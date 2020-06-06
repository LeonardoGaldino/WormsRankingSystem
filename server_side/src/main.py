import json
from functools import reduce

from .db import PostgresDB

from flask import Flask, request, Response
from flask_cors import CORS
import psycopg2


app = Flask(__name__)
CORS(app)

get_ranking_endpoint = 'get_ranking'
get_games_endpoint = 'get_games'
create_game_endpoint = 'create_game'

db_connection_string = 'dbname=worms user=lcgm host=localhost port=5432 password=123k321k'
db_conns = {
    get_ranking_endpoint: PostgresDB(db_connection_string),
    get_games_endpoint: PostgresDB(db_connection_string),
    create_game_endpoint: PostgresDB(db_connection_string),
}


@app.route('/worms/api/ranking', methods=['GET'], endpoint=get_ranking_endpoint)
def ranking():
    db = db_conns[request.endpoint]
    return json.dumps(db.get_ranking(), ensure_ascii=False)


@app.route('/worms/api/games', methods=['GET'], endpoint=get_games_endpoint)
def games():
    db = db_conns[request.endpoint]

    return json.dumps(db.get_games(), ensure_ascii=False)

@app.route('/worms/api/create/game', methods=['POST'], endpoint=create_game_endpoint)
def create_game():
    db = db_conns[request.endpoint]
    game_id = None

    try:
        data_json = request.get_json(force=True)

        game_avg_score = reduce(lambda acc, v: acc+compute_score_from_json(v), data_json, 0.0)/len(data_json)

        game_id = db.create_game()

        for player_stats in data_json:
            player_id, player_ranking = db.get_player_data(player_stats['name'])

            global_game_score_avg = db.get_global_game_avg_score(game_id)

            player_score = compute_score(
                int(player_stats['kills']), int(player_stats['suicides']), int(player_stats['position']))
            ranking_delta = compute_ranking_delta(db, player_id, game_id, game_avg_score, player_score)

            db.insert_player_stats(player_id, game_id, player_stats['kills'], 
                player_stats['suicides'], player_stats['position'])
            db.insert_player_game_ranking(player_id, game_id, player_score, ranking_delta)
    except Exception as e:
        db.rollback()
        raise e

    db.commit()
    return {
        'game_id': game_id,
    }

def compute_score_from_json(player_stats):
    return compute_score(
        int(player_stats['kills']), int(player_stats['suicides']), int(player_stats['position']))

def compute_score(kills, suicides, position):
        kill_points = 2.0*kills
        suicide_points = 2.0**suicides
        nominator = kill_points - suicide_points
        
        position_points = 0.2*(position-1)
        denominator = 1 + position_points

        return nominator/denominator if nominator > 0 else nominator*denominator

def compute_ranking_delta(db, player_id, game_id, game_avg_score, score):
    player_avg = db.get_player_avg_score(player_id)
    global_game_avg = db.get_global_game_avg_score(game_id)

    game_weight = 1.0 if global_game_avg == 0 else game_avg_score/global_game_avg

    return (score-player_avg)*game_weight
