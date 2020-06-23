from abc import ABC, abstractmethod

from src.ranking import PlayerStats, GameRankingComputer
from src.db import PostgresDB


class Argument:

    def __init__(self, name: str, _type):
        self.name = name
        self._type = _type

    def __repr__(self):
        return 'Arg({}, {})'.format(self.name, self._type)


class Command(ABC):

    def __init__(self, exec_args):
        self.exec_args = exec_args

    def __repr__(self):
        return 'Command({})'.format(self.command_name())

    def validate_arguments(self):
        arguments = self.arguments()
        expected_num_args = len(arguments)
        actual_num_args = len(self.exec_args)

        if expected_num_args != actual_num_args:
            raise IndexError("Wrong number of arguments. Expected {}: {}, got {} ({})."
                .format(expected_num_args, arguments, actual_num_args, self.exec_args))

        parsed_args = []
        for idx, exec_arg in enumerate(self.exec_args):
            arg = arguments[idx]
            try:
                parsed_arg = arg._type(exec_arg)
                parsed_args.append(parsed_arg)
            except:
                raise TypeError("Argument {} ({}) with wrong type. Expected {}, got '{}'."
                    .format(idx, arg.name, arg._type, exec_arg))
        return parsed_args

    @staticmethod
    @abstractmethod
    def command_name() -> str:
        pass

    @staticmethod
    @abstractmethod
    def arguments() -> [Argument]:
        pass

    @abstractmethod
    def run(self):
        pass


class RecomputeRankingCommand(Command):

    @staticmethod
    def command_name() -> str:
        return 'recompute_ranking'

    @staticmethod
    def arguments() -> [Argument]:
        return [
            Argument('DB_CONNECTION_STR', str),
        ]

    def run(self):
        [db_connection_str] = self.validate_arguments()
        print('Running {}...'.format(self.command_name()))

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


class RemovePlayerFromGameCommand(Command):

    @staticmethod
    def command_name() -> str:
        return 'remove_player_from_game'

    @staticmethod
    def arguments() -> [Argument]:
        return [
            Argument('DB_CONNECTION_STR', str),
            Argument('PLAYER_ID', int),
            Argument('GAME_ID', int),
        ]

    def run(self):
        [db_connection_str, player_id, game_id] = self.validate_arguments()
        print('Running {}...'.format(self.command_name()))

        db = PostgresDB(db_connection_str)
        db.delete_player_from_game(player_id, game_id)

        recompute_ranking_command = RecomputeRankingCommand([db_connection_str])
        recompute_ranking_command.run()
