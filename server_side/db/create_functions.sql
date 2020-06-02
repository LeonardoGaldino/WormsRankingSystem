CREATE OR REPLACE FUNCTION statistics.INSERT_USER_SCORE(
        IN CHARACTER(30), --name
        IN INTEGER, --game_id
        IN INTEGER, --kills
        IN INTEGER, --suicides
        IN INTEGER, --position
        IN REAL --score
    ) RETURNS VOID AS 
    $$
        BEGIN
            INSERT INTO statistics.PLAYER_GAME (player_id, game_id, kills, suicides, position, score)
                VALUES ((SELECT id FROM statistics.PLAYER WHERE name = $1), $2, $3, $4, $5, $6);
            UPDATE statistics.GAME 
                SET score = (SELECT AVG(score) FROM statistics.PLAYER_GAME WHERE game_id = $2)
                WHERE id = $2;
        END
    $$ LANGUAGE plpgsql;