CREATE TABLE IF NOT EXISTS PLAYER (
    id SERIAL PRIMARY KEY, 
    name CHARACTER(30) UNIQUE NOT NULL, 
    ranking REAL DEFAULT 1500
);

CREATE TABLE IF NOT EXISTS GAME (
    id SERIAL PRIMARY KEY,
    insertion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score REAL DEFAULT NULL,
    avg_score_after REAL DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS PLAYER_STATS (
    id SERIAL PRIMARY KEY, 
    player_id INTEGER NOT NULL REFERENCES PLAYER,
    game_id INTEGER NOT NULL REFERENCES GAME,
    kills INTEGER NOT NULL,
    damage INTEGER NOT NULL,
    self_damage INTEGER NOT NULL,
    UNIQUE (player_id, game_id)
);

CREATE TABLE IF NOT EXISTS PLAYER_GAME_RANKING (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES PLAYER,
    game_id INTEGER NOT NULL REFERENCES GAME,
    score REAL NOT NULL,
    ranking_delta REAL NOT NULL,
    UNIQUE (player_id, game_id)
);
