CREATE OR REPLACE FUNCTION update_game_scores() RETURNS TRIGGER AS 
    $$
        DECLARE ranking_update FLOAT;
        BEGIN
            PERFORM update_game_scores_generic(NEW);

            IF (TG_OP = 'INSERT') THEN
                ranking_update := NEW.ranking_delta;
            ELSIF (TG_OP = 'UPDATE') THEN
                ranking_update := NEW.ranking_delta - OLD.ranking_delta;
            END IF;

            UPDATE PLAYER p SET ranking = p.ranking + ranking_update WHERE p.id = NEW.player_id;
            RETURN NEW;
        END
    $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_game_scores_on_deletion() RETURNS TRIGGER AS 
    $$
        BEGIN
            PERFORM update_game_scores_generic(OLD);
            UPDATE PLAYER p SET ranking = p.ranking - OLD.ranking_delta WHERE p.id = OLD.player_id;
            RETURN OLD;
        END
    $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_game_scores_generic(IN changed_row PLAYER_GAME_RANKING) RETURNS VOID AS 
    $$
        DECLARE game_ts TIMESTAMP;
        DECLARE num_games INTEGER;
        DECLARE score_before FLOAT;
        DECLARE game_row GAME%rowtype;
        BEGIN
            game_ts := (SELECT insertion_timestamp FROM GAME g WHERE g.id = changed_row.game_id);
            num_games := (SELECT COUNT(*) FROM GAME g WHERE g.insertion_timestamp < game_ts
                        AND g.avg_score_after IS NOT NULL);
            score_before := (SELECT g.avg_score_after FROM GAME g
                        WHERE g.insertion_timestamp < game_ts AND
                        g.avg_score_after IS NOT NULL ORDER BY g.insertion_timestamp DESC LIMIT 1);

            if score_before is NULL then
                score_before := 0.0;
            end if;

            UPDATE GAME 
                SET 
                    score = (SELECT AVG(score) FROM PLAYER_GAME_RANKING WHERE game_id = changed_row.game_id)
                WHERE
                    id = changed_row.game_id;
            
            UPDATE GAME g
                SET 
                    avg_score_after = (score + score_before*num_games) / (num_games+1)
                WHERE
                    id = changed_row.game_id;
            
            num_games := num_games + 1;
            score_before := (SELECT avg_score_after FROM GAME WHERE id = changed_row.game_id);

            FOR game_row IN SELECT * FROM GAME g
                WHERE g.insertion_timestamp > game_ts AND
                g.avg_score_after IS NOT NULL 
                ORDER BY g.insertion_timestamp ASC
            LOOP
                UPDATE GAME g
                    SET 
                        avg_score_after = (game_row.score + score_before*num_games) / (num_games+1)
                    WHERE
                        id = game_row.id;

                score_before := (game_row.score + score_before*num_games) / (num_games+1);
                num_games := num_games + 1;
            END LOOP;

        END
    $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_ranking_on_truncate() RETURNS TRIGGER AS 
    $$
        BEGIN
            UPDATE player SET RANKING = 1500;
            UPDATE game SET score = NULL,
                            avg_score_after = NULL;
            RETURN NULL;
        END
    $$ LANGUAGE plpgsql;
