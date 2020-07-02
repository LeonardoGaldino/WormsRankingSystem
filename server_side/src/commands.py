from abc import ABC, abstractmethod
from datetime import datetime
from os import system, environ
import socket

from google.oauth2 import service_account
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

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


class BackupDBCommand(Command):

    MAX_RETRIES = 15

    @staticmethod
    def command_name() -> str:
        return 'backup_db'

    @staticmethod
    def arguments() -> [Argument]:
        return [
            Argument('DB_HOST', str),
            Argument('DB_PORT', int),
            Argument('DB_NAME', str),
            Argument('DB_USER', str),
            Argument('DB_PASSWORD', str),
            Argument('GOOGLE_CREDS_JSON_PATH', str),
        ]

    def upload_db_dump(self, google_creds_json_path):
        SCOPES = ['https://www.googleapis.com/auth/drive']
        parents_ids = ['1Q9jfdzJfT9SVz7luRurjpevzQrZlG0YB']

        credentials = service_account.Credentials.from_service_account_file(google_creds_json_path, scopes=SCOPES)

        if not credentials.valid:
            credentials.refresh(Request())

        service = build('drive', 'v3', credentials=credentials)

        today = datetime.now()
        file_name = 'db_backup-{}/{}/{}'.format(today.day, today.month, today.year)
        file_metadata = {'name': file_name, 'parents': parents_ids}
        media = MediaFileUpload('db/db_dump', mimetype='text/plain')
        file = service.files().create(body=file_metadata,
                                            media_body=media,
                                            fields='id').execute()

    def run(self):
        [db_host, db_port, db_name, db_user, db_pass, google_creds_json_path] = self.validate_arguments()
        print('Running {}...'.format(self.command_name()))

        environ['PGPASSWORD'] = db_pass
        error_code = system('pg_dump {} > db/db_dump -h {} -p {} -U {} 2> db/db_dump.err'
            .format(db_name, db_host, db_port, db_user))

        if error_code != 0:
            raise SystemExit('Error code {} when generating db_dump.'.format(error_code))

        # Increase connection creation timeout to 10 minutes
        socket.setdefaulttimeout(60*10)

        _try = 0
        last_exception = None
        while _try < self.MAX_RETRIES:
            try:
                self.upload_db_dump(google_creds_json_path)
                break
            except Exception as e:
                _try += 1
                last_exception = e
        else:
            raise last_exception


class CreateUnixSocketCommand(Command):

    @staticmethod
    def command_name() -> str:
        return 'create_unix_socket'

    @staticmethod
    def arguments() -> [Argument]:
        return [
            Argument('SOCKET_NAME', str),
        ]

    def run(self):
        [socket_name] = self.validate_arguments()
        print('Running {}...'.format(self.command_name()))

        sock = socket.socket(socket.AF_UNIX)
        sock.bind(socket_name)

class DeleteGameCommand(Command):

    @staticmethod
    def command_name() -> str:
        return 'delete_game'

    @staticmethod
    def arguments() -> [Argument]:
        return [
            Argument('DB_CONNECTION_STR', str),
            Argument('GAME_ID', int),
        ]

    def run(self):
        [db_connection_str, game_id] = self.validate_arguments()
        print('Running {}...'.format(self.command_name()))

        db = PostgresDB(db_connection_str)
        db.delete_game(game_id)