from functools import reduce
import json

from src.db import PostgresDB

class PlayerStats:

    def __init__(self, db: PostgresDB, name: str, rounds_played: int, kills: int, damage: int, self_damage: int, player_id: int = None):
        self.db = db
        self.id = self.db.get_player_data(name)[0] if player_id is None else player_id
        self.name = name
        self.rounds_played = rounds_played
        self.kills = kills
        self.damage = damage
        self.self_damage = self_damage

    def save(self, game_id):
        self.db.insert_player_stats(self.id, game_id, self.rounds_played, self.kills, self.damage, self.self_damage)

    @staticmethod
    def get_mapped_name(team_name: str):
        with open('team_map.json', 'r') as file:
            team_mapping = json.loads(file.read())
            if team_name.lower() not in team_mapping:
                raise LookupError('Team {} doesn\'t exists.'.format(team_name))
            return team_mapping[team_name.lower()]

    @staticmethod
    def from_json(db: PostgresDB, json):
        team_name = json.get('team_name', '')
        name = PlayerStats.get_mapped_name(team_name)
        return PlayerStats(db, name, json.get('rounds_played', 0), json.get('kills', 0), json.get('damage', 0), json.get('self_damage', 0))

    def __repr__(self):
        return 'PlayerStats({}, {}, {}, {}, {}, {})'.format(
            self.name, self.rounds_played, self.kills, self.damage, self.self_damage, self.id)

class GameRankingComputer:

    def __init__(self, db: PostgresDB, game_id: int, game_stats: [PlayerStats]):
        self.db = db
        self.game_id = game_id
        self.game_stats = game_stats

    def get_game_avg_score(self) -> int:
        total_points = sum(map(lambda player_stat: self.compute_score(player_stat), self.game_stats))
        return round(total_points/len(self.game_stats))

    def get_game_avg_rounds_played(self) -> int:
        rounds_sum = sum(map(lambda player_stat: player_stat.rounds_played, self.game_stats))
        return round(rounds_sum/len(self.game_stats))

    def get_score_ranking_updates(self):
        return list(map(lambda player_stat: 
            (player_stat, self.compute_score(player_stat), self.compute_delta_ranking(player_stat)), 
            self.game_stats))

    def compute_score(self, stats: PlayerStats) -> int:
        kill_points = 3 * stats.kills
        damage_points = round(0.1 * stats.damage)
        self_damage_points = round(0.1 * stats.self_damage)

        return kill_points + damage_points - self_damage_points

    def compute_delta_ranking(self, stats: PlayerStats) -> int:
        player_score = self.compute_score(stats)
        player_ranking = self.db.get_player_data(stats.name)[1]
        
        game_avg_score = self.get_game_avg_score()
        game_avg_ranking = self.db.get_game_avg_ranking(list(map(lambda player_stats: player_stats.id, self.game_stats)))

        avg_rounds_played = self.get_game_avg_rounds_played()
        rounds_base = 0.75 if stats.rounds_played < avg_rounds_played else 0.9
        rounds_weight = rounds_base**(stats.rounds_played - avg_rounds_played)

        diff = player_score - game_avg_score
        if diff > 0:
            ranking_weight = 1.0 if player_ranking == 0 else game_avg_ranking/player_ranking
        else:
            ranking_weight = 1.0 if game_avg_ranking == 0 else player_ranking/game_avg_ranking
            rounds_weight = rounds_weight**-1 if stats.rounds_played < avg_rounds_played else rounds_weight

        delta_ranking = round(diff*(ranking_weight**2)*rounds_weight)

        # Prevent ranking from falling below 1
        if (player_ranking + delta_ranking) < 1:
            delta_ranking = 1 - player_ranking

        return delta_ranking


def dict_assign(obj, key, val):
    obj[key] = val
    return obj

def constrain(val: float, min_val: float, max_val: float):
    return max(min_val, min(val, max_val))
