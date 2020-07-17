# Server side
This is the server side of Worms Ranking System. It is an web API written in Flask. Interacts with a Postgres DB through psycopg library. It also has other functionalities like uploading DB dump to a specific Google Drive folder through Google Drive API.

# Dependencies
Does not depend on any other module.

# Running locally
- In this folder, a file called **deps** lists all softwares that should be installed. One of them is **postgres**, the Database storing the application data. Other is **pipenv**. **uWSGI** is needed for deployment, not for development.
- Make sure Postgres is up and running (recommended at localhost:5432)
- Load **db/init_db.sql** into Postgres.
- Load **db/create_tables.sql** into Postgres.
- Load **db/create_functions.sql** into Postgres.
- Load **db/create_triggers.sql** into Postgres.
- Load **db/populate_players.sql** into Postgres if you want my default players to be at your DB instance.
- Run **pipenv install**
- Source environment variables listed in **env.sh**. Can be done in unix-like OS running **source env.sh**.
- Run **pipenv run python -m flask run**
- API should be running on **localhost:5000**.
