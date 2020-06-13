from sys import argv, exit

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
            end_ts = last_line.split(' ')[1]
            team_data = data[:-1]
            # Build json and send to backend
        else:
            with open('py_err', 'a+') as err_file:
                err_file.write("Tried to save file {}, but file does not have 'end' directive on last line.\n\n".format(file_name))
            exit(1)

if __name__ == '__main__':
    check_file_name_argv()
    save_game(argv[1])