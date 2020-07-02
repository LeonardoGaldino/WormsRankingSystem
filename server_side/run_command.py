from os import environ
from sys import argv, stderr, exit

from src.commands import Command, RecomputeRankingCommand, \
    RemovePlayerFromGameCommand, BackupDBCommand, CreateUnixSocket, DeleteGameCommand


VALID_COMMANDS: [Command] = [
    RecomputeRankingCommand,
    RemovePlayerFromGameCommand,
    BackupDBCommand,
    CreateUnixSocket,
    DeleteGameCommand,
]

def main():
    valid_commands_name = [command.command_name() for command in VALID_COMMANDS] 
    if len(argv) < 2:
        print('Specify the command name to be ran. No command specified. Should be one of {}'
            .format(valid_commands_name), file=stderr)
        exit(1)
    try:
        command_type = filter(lambda command: command.command_name() == argv[1], VALID_COMMANDS).__next__()
    except StopIteration:
        print('No command with name {} found. Should be one of {}'
            .format(argv[1], valid_commands_name), file=stderr)
        exit(1)

    command = command_type(argv[2:])
    command.run()

if __name__ == '__main__':
    main()