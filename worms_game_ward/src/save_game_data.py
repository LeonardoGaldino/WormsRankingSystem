from sys import argv, exit
from os import remove
import json

import requests

def check_file_name_argv():
    if len(argv) != 2:
        with open('py_err', 'a+') as err_file:
            err_file.write("Trying to execute script with wrong number of argv.\n")
            err_file.write("Expected 1: game_data file name, but received {}\n\n".format(str(argv)))
        exit(1)

def save_game(file_name):
    with open(file_name, "r") as file:
        data = file.readlines()
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
            
            response = requests.post("http://192.168.0.76:17015/worms/api/create/game", json=payload)
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
    save_game(argv[1])