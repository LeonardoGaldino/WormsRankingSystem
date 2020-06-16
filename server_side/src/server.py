from os import environ
import json
from functools import reduce

from .db import PostgresDB
from .ranking import GameRankingComputer, PlayerStats

from flask import Flask, request, Response
from flask_cors import CORS
import psycopg2


app = Flask(__name__)
CORS(app)

db_connection_str = environ['PG_CONNECTION_STR']

@app.route('/worms/api/ranking', methods=['GET'])
def ranking():
    db = PostgresDB(db_connection_str)
    return json.dumps(db.get_ranking(), ensure_ascii=False)


@app.route('/worms/api/games', methods=['GET'])
def games():
    db = PostgresDB(db_connection_str)
    return json.dumps(db.get_games(), ensure_ascii=False)

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
