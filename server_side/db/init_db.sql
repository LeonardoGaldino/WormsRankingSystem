CREATE ROLE lcgm SUPERUSER LOGIN PASSWORD '123k321k';
CREATE DATABASE worms OWNER lcgm CONNECTION LIMIT 1;
\c worms;
CREATE SCHEMA statistics;
