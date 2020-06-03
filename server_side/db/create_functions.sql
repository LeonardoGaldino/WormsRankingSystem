CREATE OR REPLACE FUNCTION insert_user_score(
        IN CHARACTER(30), --name
        IN INTEGER, --game_id
        IN INTEGER, --kills
        IN INTEGER, --suicides
        IN INTEGER, --position
        IN REAL --score
    ) RETURNS VOID AS 
    $$
        BEGIN
            INSERT INTO PLAYER_GAME (player_id, game_id, kills, suicides, position, score)
                VALUES ((SELECT id FROM PLAYER WHERE name = $1), $2, $3, $4, $5, $6);
        END
    $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_game_avg_score() RETURNS TRIGGER AS 
    $$
        BEGIN
            INSERT INTO GAME_AVG_SCORE (game_id, avg_score) 
                VALUES 
                    (
                        NEW.id, 
                        (SELECT AVG(score) FROM GAME WHERE score IS NOT NULL)
                    );
            RETURN NEW;
        END
    $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_game_score() RETURNS TRIGGER AS 
    $$
        BEGIN
            UPDATE GAME 
                SET 
                    score = (SELECT AVG(score) FROM PLAYER_GAME WHERE game_id = NEW.game_id)
                WHERE
                    id = NEW.game_id;
                    
            UPDATE GAME_AVG_SCORE gas
                SET 
                    avg_score = (SELECT AVG(g.score) FROM GAME g
                        WHERE g.score IS NOT NULL AND g.insertion_timestamp <= gas.insertion_timestamp)
                WHERE
                    gas.insertion_timestamp >= 
                        (SELECT insertion_timestamp FROM GAME_AVG_SCORE WHERE game_id = NEW.game_id);

            RETURN NEW;
        END
    $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_game_score_deletion() RETURNS TRIGGER AS 
    $$
        BEGIN
            UPDATE GAME 
                SET 
                    score = (SELECT AVG(score) FROM PLAYER_GAME WHERE game_id = OLD.game_id)
                WHERE
                    id = OLD.game_id;

            UPDATE GAME_AVG_SCORE gas
                SET 
                    avg_score = (SELECT AVG(g.score) FROM GAME g
                        WHERE g.score IS NOT NULL AND g.insertion_timestamp <= gas.insertion_timestamp)
                WHERE
                    gas.insertion_timestamp >= 
                        (SELECT insertion_timestamp FROM GAME_AVG_SCORE WHERE game_id = OLD.game_id);

            RETURN OLD;
        END
    $$ LANGUAGE plpgsql;