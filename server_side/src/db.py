import psycopg2

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
        g.id,
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
        INNER JOIN player_game_ranking pgr ON pgr.player_id = p.id AND pgr.game_id = g.id 
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

class PostgresDB:

    def __init__(self, connection_string):
        self.conn = psycopg2.connect(connection_string)
        self.cursor = self.conn.cursor()

    def get_player_avg_score(self, player_id):
        self.cursor.execute(player_avg_score_query, (player_id,))
        res = self.cursor.fetchone()[0]
        return 0 if res is None else float(res)

    def get_global_game_avg_score(self, game_id):
        self.cursor.execute(global_game_avg_query, (game_id,))
        res = self.cursor.fetchone()
        return 0 if res is None else float(res[0])

    def get_game_avg_score(self, game_id):
        self.cursor.execute(game_avg_query, (game_id,))
        res = self.cursor.fetchone()[0]
        return 0 if res is None else float(res)

    def create_game(self):
        self.cursor.execute(insert_game_stmt)
        game_id = self.cursor.fetchone()[0]
        self.conn.commit()
        return game_id

    def get_ranking(self):
        self.cursor.execute(ranking_query)
        res = self.cursor.fetchall()

        return self.parse_ranking_response(res)

    def get_games(self):
        self.cursor.execute(games_query)
        res = self.cursor.fetchall()

        return self.parse_games_response(res)

    def get_player_data(self, player_name):
        self.cursor.execute(player_query, (player_name,))
        res = self.cursor.fetchone()

        return res[0], res[1]

    def insert_player_stats(self, player_id, game_id, kills, suicides, position):
        self.cursor.execute(insert_player_stats_stmt, (player_id, game_id, kills, suicides, position))

    def insert_player_game_ranking(self, player_id, game_id, player_score, ranking_delta):
        self.cursor.execute(insert_player_game_ranking_stmt, (player_id, game_id, player_score, ranking_delta))

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def safe_score(self, value):
        return 0 if value is None else value

    def parse_games_response(self, raw_data):
        date_index = {}
        for data in raw_data:
            insertion_ts = data[1]
            parsed_date = '{}/{}/{}'.format(insertion_ts.day, insertion_ts.month, insertion_ts.year)
            games_for_date = date_index.get(parsed_date, {})
            # get game for given id
            player_entries = games_for_date.get(data[0], []) 
            player_entries.append({
                'name': data[2].strip(),
                'kills': data[3],
                'suicides': data[4],
                'position': data[5],
                'score': data[6],
                'ranking_delta': data[7],
            })
            games_for_date[data[0]] = sorted(player_entries, key=lambda v: v['position'])
            date_index[parsed_date] = games_for_date
        return date_index

    def parse_ranking_response(self, raw_data):
        return [{'name': data[0].strip(), 'ranking': data[1], 'games': data[2],
            'wins': data[3], 'score_avg': self.safe_score(data[4])} for data in raw_data]
