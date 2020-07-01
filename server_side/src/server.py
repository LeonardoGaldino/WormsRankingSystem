from os import environ
import json
from functools import reduce
from math import ceil

from src.db import PostgresDB
from src.ranking import GameRankingComputer, PlayerStats

from flask import Flask, request, Response
from flask_cors import CORS
import psycopg2


app = Flask(__name__)
CORS(app)

db_connection_str = environ['PG_CONNECTION_STR']

def get_avatar_path(player_name: str):
    return '/worms/images/{}.jpg'.format(player_name.lower().replace(' ', ''))

@app.route('/worms/api/player/ranking_history', methods=['GET'])
def player_ranking_history():
    db = PostgresDB(db_connection_str)
    player_name = request.args['player_name']
    return json.dumps(db.get_player_ranking_history(player_name),ensure_ascii=False)
    

@app.route('/worms/api/ranking', methods=['GET'])
def ranking():
    db = PostgresDB(db_connection_str)
    ranking = db.get_ranking()
    
    for player_ranking in ranking:
        player_ranking['avatar_path'] = get_avatar_path(player_ranking['name'])

    return json.dumps(ranking, ensure_ascii=False)


@app.route('/worms/api/games', methods=['GET'])
def games():
    db = PostgresDB(db_connection_str)
    page_size, page = int(request.args.get('page_size', 5)), int(request.args.get('page', 0))
    num_pages = ceil(db.get_num_games()/page_size)
    
    games_res = db.get_games(page_size, page)
    for players_data in games_res.values():
        for player in players_data:
            player['avatar_path'] = get_avatar_path(player['name'])

    return json.dumps({'num_pages': num_pages, 'games': games_res}, ensure_ascii=False)

@app.route('/worms/api/game', methods=['GET'])
def game():
    db = PostgresDB(db_connection_str)
    game_id = int(request.args.get('game_id'))
    
    game_res = db.get_game(game_id)
    for player_data in game_res['players_data']:
        player_data['avatar_path'] = get_avatar_path(player_data['name'])

    return json.dumps(game_res, ensure_ascii=False)

@app.route('/worms/api/create/game', methods=['POST'])
def create_game():
    db = PostgresDB(db_connection_str)
    game_id = None

    try:
        data_json = request.get_json(force=True)

        if not data_json.get('player_stats', []):
            return Response(status=400)

        game_ts = data_json.get('game_ts', None)
        players_stats = data_json['player_stats']
        game_id = db.create_game(game_ts)

        stats = list(map(lambda player_stats: PlayerStats.from_json(db, player_stats), players_stats))
        ranker = GameRankingComputer(db, game_id, stats)

        updates = ranker.get_score_ranking_updates()
        for player_stats, score, ranking_delta in updates:
            player_stats.save(game_id)
            db.insert_player_game_ranking(player_stats.id, game_id, score, ranking_delta)
    except Exception as e:
        db.rollback()
        raise e

    db.commit()
    return {
        'game_id': game_id,
    }
