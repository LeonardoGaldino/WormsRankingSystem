from sys import argv, exit
from os import remove, environ
import json

import requests

def check_file_name_argv():
    if len(argv) != 2:
        with open('py_err', 'a+') as err_file:
            err_file.write("Trying to execute script with wrong number of argv.\n")
            err_file.write("Expected 1: game_data file name, but received {}\n\n".format(str(argv)))
        exit(1)

def get_server_endpoint_env_var():
    worms_server_endpoint = environ.get('WORMS_SERVER_ENDPOINT', None)
    if worms_server_endpoint is None:
        with open('py_err', 'a+') as err_file:
            err_file.write("WORMS_SERVER_ENDPOINT Environment variable not set.\n")
        exit(1)

    return worms_server_endpoint

def save_game(file_name, worms_server_endpoint):
    with open(file_name, "r") as file:
        data = file.readlines()
        if len(data[:-1]) == 0:
            with open('py_err', 'a+') as err_file:
                err_file.write("Tried to save file {}, but file does not have team data.\n\n".format(file_name))
        else:
            last_line = data[-1]
            if 'end' in last_line:
                end_ts = int(last_line.split('|')[1])
                teams_data = list(map(lambda row: row.split('|'), data[:-1]))
                payload = {
                    'game_ts': end_ts, 
                    'player_stats': list(map(lambda team_data: {
                        'team_name': team_data[0],
                        'rounds_played': int(team_data[1]),
                        'kills': int(team_data[2]),
                        'damage': int(team_data[3]),
                        'self_damage': int(team_data[4])
                    }, teams_data))
                }

                response = requests.post("http://{}/worms/api/create/game".format(worms_server_endpoint), json=payload)
                if response.status_code != 200:
                    with open('py_err', 'a+') as err_file:
                        err_file.write("Server failed on file {}, status code: {}\n\n".format(file_name, response.status_code))
                        exit(1)
            else:
                with open('py_err', 'a+') as err_file:
                    err_file.write("Tried to save file {}, but file does not have 'end' directive on last line.\n\n".format(file_name))
                exit(1)
    remove(file_name)
    

if __name__ == '__main__':
    check_file_name_argv()
    worms_server_endpoint = get_server_endpoint_env_var()
    save_game(argv[1], worms_server_endpoint)