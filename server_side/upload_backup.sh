cd $WORMS_SERVER_PATH
pg_dump worms > db/db_dump -h localhost -p 5432 -U lcgm 2> db/db_dump.err
python3 upload_backup.py 2> upload_backup.err