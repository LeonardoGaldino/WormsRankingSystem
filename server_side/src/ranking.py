from functools import reduce

from .db import PostgresDB

class PlayerStats:

    def __init__(self, db: PostgresDB, name: str, kills: int, suicides: int, position: int):
        self.db = db
        self.id = self.db.get_player_data(name)[0]
        self.name = name
        self.kills = kills
        self.suicides = suicides
        self.position = position

    def save(self, game_id):
        self.db.insert_player_stats(self.id, game_id, self.kills, self.suicides, self.position)

    @staticmethod
    def from_json(db: PostgresDB, json):
        return PlayerStats(db, json.get('name', None), json.get('kills', None),
            json.get('suicides', None), json.get('position', None))

    def __repr__(self):
        return 'PlayerStats({}, {}, {}, {})'.format(self.name, self.kills, self.suicides, self.position)

class GameRankingComputer:

    def __init__(self, db: PostgresDB, game_id: int, game_stats: [PlayerStats]):
        self.db = db
        self.game_id = game_id
        self.game_stats = game_stats

    def get_game_avg_score(self) -> float:
        total_points = sum(map(lambda player_stat: self.compute_score(player_stat), self.game_stats))
        return total_points/len(self.game_stats)

    def get_score_ranking_updates(self):
        return list(map(lambda player_stat: 
            (player_stat, self.compute_score(player_stat), self.compute_delta_ranking(player_stat)), 
            self.game_stats))

    def compute_score(self, stats: PlayerStats) -> float:
        kill_points = 2.0*stats.kills
        suicide_points = 2.0**stats.suicides
        nominator = kill_points - suicide_points
        
        position_points = 0.2*(stats.position-1)
        denominator = 1 + position_points

        return nominator/denominator if nominator > 0 else nominator*denominator

    def compute_delta_ranking(self, stats: PlayerStats) -> float:
        player_score = self.compute_score(stats)
        player_avg_score = self.db.get_player_avg_score(self.db.get_player_data(stats.name)[0])
        global_game_avg = self.db.get_global_game_avg_score(self.game_id)

        game_weight = 1.0 if global_game_avg == 0 else self.get_game_avg_score()/global_game_avg

        return (player_score-player_avg_score)*game_weight
    

def dict_assign(obj, key, val):
    obj[key] = val
    return obj
