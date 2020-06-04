import json
from functools import reduce

from flask import Flask, request, Response
from flask_cors import CORS
import psycopg2


app = Flask(__name__)
CORS(app)
conn = psycopg2.connect("dbname=worms user=lcgm password=123k321k")
cursor = conn.cursor()

ranking_query = """
    SELECT 
        p.name, 
        p.ranking, 
        (SELECT COUNT(*) FROM player_stats ps2 WHERE ps2.player_id = p.id) as games,
        (SELECT COUNT(*) FROM player_stats ps2 WHERE ps2.player_id = p.id AND ps2.position = 1) as wins,
        AVG(pgr.score) as score_avg
        FROM player p 
        LEFT OUTER JOIN player_game_ranking pgr ON p.id = pgr.player_id
        LEFT OUTER JOIN player_stats ps ON p.id = ps.player_id 
        GROUP BY (p.id, p.name, p.ranking, wins)
        ORDER BY p.ranking DESC, score_avg DESC NULLS LAST
"""

games_query = """
    SELECT
        g.insertion_timestamp, 
        p.name,
        ps.kills,
        ps.suicides,
        ps.position,
        pgr.score,
        pgr.ranking_delta
        FROM player_stats ps
        INNER JOIN game g ON g.id = ps.game_id
        INNER JOIN player p ON p.id = ps.player_id 
        INNER JOIN player_game_ranking pgr ON pgr.id = p.id AND pgr.game_id = g.id 
        ORDER BY (g.insertion_timestamp, pgr.score, ps.position) DESC NULLS LAST
"""

player_query = """
    SELECT
        id, ranking
        FROM player
        WHERE name = %s;
"""

player_avg_score_query = """
    SELECT
        AVG(score)
        FROM player_game_ranking
        WHERE player_id = %s;
"""

global_game_avg_query = """
    SELECT
        g.avg_score_after
        FROM game g
        WHERE g.insertion_timestamp < (SELECT g2.insertion_timestamp FROM game g2 WHERE g2.id = %s)
        AND g.avg_score_after IS NOT NULL
        ORDER BY g.insertion_timestamp DESC LIMIT 1
"""

insert_game_stmt = "INSERT INTO game DEFAULT VALUES RETURNING ID;"

insert_player_stats_stmt = """
    INSERT INTO player_stats (
        player_id, 
        game_id, 
        kills, 
        suicides, 
        position) 
        VALUES (%s, %s, %s, %s, %s) RETURNING ID;
"""

insert_player_game_ranking_stmt = """
    INSERT INTO player_game_ranking (
        player_id,
        game_id,
        score,
        ranking_delta
    ) VALUES (%s, %s, %s, %s);
"""

# Changes None to 0
def safe_score(value):
    return 0 if value is None else value

def parse_ranking_response(raw_data):
    return [{'name': data[0], 'ranking': data[1], 'games': data[2],
        'wins': data[3], 'score_avg': safe_score(data[4])} for data in raw_data]

@app.route('/ranking', methods=['GET'])
def ranking():
    cursor.execute(ranking_query)
    res = cursor.fetchall()

    parsed_data = parse_ranking_response(res)

    return json.dumps(parsed_data, ensure_ascii=False)

def parse_games_response(raw_data):
    date_index = {}
    for data in raw_data:
        date = data[0]
        parsed_date = '{}/{}/{}'.format(date.day, date.month, date.year)
        games = date_index.get(parsed_date, [])
        games.append({
            'name': data[1],
            'kills': data[2],
            'suicides': data[3],
            'position': data[4],
            'score': data[5],
            'ranking_delta': data[6],
        })
        date_index[parsed_date] = games
    return date_index

@app.route('/games', methods=['GET'])
def games():
    cursor.execute(games_query)
    res = cursor.fetchall()

    parsed_data = parse_games_response(res)

    return json.dumps(parsed_data, ensure_ascii=False)

@app.route('/create/game', methods=['POST'])
def create_game():
    game_id = None

    try:
        data_json = request.get_json(force=True)

        game_avg_score = reduce(lambda acc, v: acc+compute_score_from_json(v), data_json, 0.0)/len(data_json)

        game_id = create_game()

        for player_stats in data_json:
            cursor.execute(player_query, (player_stats['name'],))
            player_result = cursor.fetchone()
            player_id, player_ranking = player_result[0], player_result[1]

            global_game_score_avg = get_global_game_avg_score(game_id)

            player_score = compute_score(
                int(player_stats['kills']), int(player_stats['suicides']), int(player_stats['position']))
            ranking_delta = compute_ranking_delta(player_id, game_id, game_avg_score, player_score)

            cursor.execute(insert_player_stats_stmt, (player_id, 
                game_id, player_stats['kills'], player_stats['suicides'], player_stats['position']))
            cursor.execute(insert_player_game_ranking_stmt, (player_id, game_id, player_score, ranking_delta))
    except Exception as e:
        print(e)
        conn.rollback()
        res = Response()
        res.status_code = 500
        return res

    conn.commit()
    return {
        'game_id': game_id,
    }

def create_game():
    cursor.execute(insert_game_stmt)
    game_id = cursor.fetchone()[0]
    conn.commit()
    return game_id

def get_game_avg_score(game_id):
    cursor.execute(game_avg_query, (game_id,))
    res = cursor.fetchone()[0]
    return 0 if res is None else float(res)

def get_player_avg_score(player_id):
    cursor.execute(player_avg_score_query, (player_id,))
    res = cursor.fetchone()[0]
    return 0 if res is None else float(res)

def get_global_game_avg_score(game_id):
    cursor.execute(global_game_avg_query, (game_id,))
    res = cursor.fetchone()
    return 0 if res is None else float(res[0])

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

def compute_ranking_delta(player_id, game_id, game_avg_score, score):
    player_avg = get_player_avg_score(player_id)
    global_game_avg = get_global_game_avg_score(game_id)

    game_weight = 1.0 if global_game_avg == 0 else game_avg_score/global_game_avg

    return (score-player_avg)*game_weight