-- Create username 
-- CREATE TABLE IF NOT EXISTS users (
--   id SERIAL PRIMARY KEY,
--   email varchar(255),
--   password varchar(255)
-- );

CREATE TABLE IF NOT EXISTS pokemon_user (
	id SERIAL PRIMARY KEY,
	pokemon_id INTEGER,
	user_id INTEGER
);