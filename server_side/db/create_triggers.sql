CREATE TRIGGER tg_on_new_game
    AFTER INSERT
    ON game
    FOR EACH ROW
    EXECUTE PROCEDURE create_game_avg_score();

CREATE TRIGGER tg_on_insert_player_game
    AFTER INSERT
    OR UPDATE OF score
    ON player_game
    FOR EACH ROW
    EXECUTE PROCEDURE update_game_score();

CREATE TRIGGER tg_on_change_player_game
    AFTER DELETE
    ON player_game
    FOR EACH ROW
    EXECUTE PROCEDURE update_game_score_deletion();
