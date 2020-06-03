CREATE TRIGGER tg_on_insert_update_player_game_ranking
    AFTER INSERT
    OR UPDATE OF score
    ON player_game_ranking
    FOR EACH ROW
    EXECUTE PROCEDURE update_game_scores();

CREATE TRIGGER tg_on_delete_player_game_ranking
    AFTER DELETE
    ON player_game_ranking
    FOR EACH ROW
    EXECUTE PROCEDURE update_game_scores_on_deletion();