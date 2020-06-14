from os import environ

from src.ranking import PlayerStats, GameRankingComputer
from src.db import PostgresDB

db_connection_str = environ['PG_CONNECTION_STR']

if __name__ == '__main__':
    db = PostgresDB(db_connection_str)
    db.truncate_player_game_ranking()

    players_stats_by_game_id = db.get_players_stats()

    # Get games with lower id first
    for game_id in sorted(players_stats_by_game_id):
        players_stats_raw = players_stats_by_game_id[game_id]
        players_stats = list(map(
            lambda player_stats: PlayerStats(db, player_stats['name'], player_stats['kills'],
                player_stats['damage'], player_stats['self_damage'], player_stats['player_id']),
            players_stats_raw))

        ranker = GameRankingComputer(db, game_id, players_stats)
        updates = ranker.get_score_ranking_updates()

        for player_stats, score, ranking_delta in updates:
            db.insert_player_game_ranking(player_stats.id, game_id, score, ranking_delta)
    db.commit()
    