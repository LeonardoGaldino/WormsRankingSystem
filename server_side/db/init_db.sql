CREATE ROLE lcgm LOGIN SUPERUSER PASSWORD '123k321k' VALID UNTIL 'infinity';
ALTER USER lcgm PASSWORD '123k321k';
ALTER USER postgres PASSWORD '321k123k';
CREATE DATABASE worms OWNER lcgm CONNECTION LIMIT 10;
