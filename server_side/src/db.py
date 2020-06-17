import psycopg2

ranking_query = """
    SELECT 
        p.name, 
        p.ranking, 
        (SELECT COUNT(*) FROM player_stats ps2 WHERE ps2.player_id = p.id) as games,
        AVG(pgr.score) as score_avg
        FROM player p 
        LEFT OUTER JOIN player_game_ranking pgr ON p.id = pgr.player_id
        LEFT OUTER JOIN player_stats ps ON p.id = ps.player_id 
        GROUP BY (p.id, p.name, p.ranking)
        ORDER BY p.ranking DESC, score_avg DESC NULLS LAST
"""

games_query = """
    SELECT
        g.id,
        g.insertion_timestamp,
        p.name,
        ps.kills,
        ps.damage,
        ps.self_damage,
        pgr.score,
        pgr.ranking_delta
        FROM player_stats ps
        INNER JOIN game g ON g.id = ps.game_id 
            AND g.id IN 
                (SELECT g2.id FROM game g2 ORDER BY g2.insertion_timestamp DESC LIMIT %s OFFSET %s)
        INNER JOIN player p ON p.id = ps.player_id 
        INNER JOIN player_game_ranking pgr ON pgr.player_id = p.id AND pgr.game_id = g.id 
        ORDER BY (g.insertion_timestamp, pgr.score) DESC NULLS LAST
"""

player_stats_query = """
    SELECT
        ps.player_id,
        ps.game_id,
        p.name,
        ps.kills,
        ps.damage,
        ps.self_damage
        FROM player_stats ps
        INNER JOIN player p ON p.id = ps.player_id;
"""

player_query = """
    SELECT
        id, ranking
        FROM player
        WHERE LOWER(name) = LOWER(%s);
"""

player_avg_score_query = """
    SELECT
        AVG(score)
        FROM player_game_ranking
        WHERE player_id = %s;
"""

# Generate python string query
game_avg_ranking_query = """
    SELECT
        AVG(ranking)
        FROM player
        WHERE id IN {};
"""

global_game_avg_query = """
    SELECT
        g.avg_score_after
        FROM game g
        WHERE g.insertion_timestamp < (SELECT g2.insertion_timestamp FROM game g2 WHERE g2.id = %s)
        AND g.avg_score_after IS NOT NULL
        ORDER BY g.insertion_timestamp DESC LIMIT 1
"""

insert_game_ts_stmt = "INSERT INTO game (insertion_timestamp) VALUES (to_timestamp(%s)) RETURNING ID;"
insert_game_no_ts_stmt = "INSERT INTO game DEFAULT VALUES RETURNING ID;"

insert_player_stats_stmt = """
    INSERT INTO player_stats (
        player_id, 
        game_id, 
        kills, 
        damage, 
        self_damage) 
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

truncate_player_game_ranking_stmt = "TRUNCATE TABLE player_game_ranking;"

class PostgresDB:

    def __init__(self, connection_string: str):
        self.conn = psycopg2.connect(connection_string)
        self.cursor = self.conn.cursor()

    def get_player_avg_score(self, player_id: int):
        self.cursor.execute(player_avg_score_query, (player_id,))
        res = self.cursor.fetchone()[0]
        return 0 if res is None else float(res)

    def get_global_game_avg_score(self, game_id: int):
        self.cursor.execute(global_game_avg_query, (game_id,))
        res = self.cursor.fetchone()
        return 0 if res is None else float(res[0])

    def get_players_stats(self):
        self.cursor.execute(player_stats_query)
        res = self.cursor.fetchall()

        return self.parse_players_stats_response(res)

    def get_game_avg_ranking(self, player_ids: [int]):
        id_list = '('
        for player_id in player_ids:
            id_list += str(player_id) + ','
        id_list = id_list[:-1] + ')'

        self.cursor.execute(game_avg_ranking_query.format(id_list))
        res = self.cursor.fetchone()[0]
        return 0 if res is None else float(res)

    def get_game_avg_score(self, game_id: int):
        self.cursor.execute(game_avg_query, (game_id,))
        res = self.cursor.fetchone()[0]
        return 0 if res is None else float(res)

    def create_game(self, game_ts = None):
        if game_ts is None:
            self.cursor.execute(insert_game_no_ts_stmt)
        else:
            self.cursor.execute(insert_game_ts_stmt, (game_ts,))

        game_id = self.cursor.fetchone()[0]
        self.conn.commit()
        return game_id

    def get_ranking(self):
        self.cursor.execute(ranking_query)
        res = self.cursor.fetchall()

        return self.parse_ranking_response(res)

    def get_games(self, page_size: int = None, page: int = None):
        page_size = page_size if page_size is not None else 5
        offset = page*page_size if page is not None else 0

        self.cursor.execute(games_query, (page_size, offset,))
        res = self.cursor.fetchall()

        return self.parse_games_response(res)

    def get_player_data(self, player_name: str):
        self.cursor.execute(player_query, (player_name,))
        res = self.cursor.fetchone()

        return res[0], res[1]

    def insert_player_stats(self, player_id: int, game_id, kills: int, damage: int, self_damage: int):
        self.cursor.execute(insert_player_stats_stmt, (player_id, game_id, kills, damage, self_damage))

    def insert_player_game_ranking(self, player_id: int, game_id: int, player_score: float, ranking_delta: float):
        self.cursor.execute(insert_player_game_ranking_stmt, (player_id, game_id, player_score, ranking_delta))

    def truncate_player_game_ranking(self):
        self.cursor.execute(truncate_player_game_ranking_stmt)
        self.commit()

    def commit(self):
        self.conn.commit()

    def rollback(self):
        self.conn.rollback()

    def safe_score(self, value: float):
        return 0 if value is None else value

    def parse_players_stats_response(self, raw_data):
        parsed_data = {}
        for data in raw_data:
            player_id, game_id, player_name, kills, damage, self_damage = data
            game_id = int(game_id)

            entries = parsed_data.get(game_id, [])
            entries.append({
                'player_id': int(player_id),
                'name': player_name.strip(),
                'kills': int(kills),
                'damage': int(damage),
                'self_damage': int(self_damage),
            })
            parsed_data[game_id] = entries
        return parsed_data

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
                'damage': data[4],
                'self_damage': data[5],
                'score': data[6],
                'ranking_delta': data[7],
            })
            games_for_date[data[0]] = player_entries
            date_index[parsed_date] = games_for_date
        return date_index

    def parse_ranking_response(self, raw_data):
        return [{'name': data[0].strip(), 'ranking': data[1], 'games': data[2],
            'score_avg': round(self.safe_score(data[3]))} for data in raw_data]
