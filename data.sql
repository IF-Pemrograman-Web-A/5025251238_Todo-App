DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(50)  NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE todos (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       VARCHAR(200) NOT NULL,
  done       SMALLINT     NOT NULL DEFAULT 0,
  shared     SMALLINT     NOT NULL DEFAULT 0,   
  remind_at  TIMESTAMP NULL,
  image      VARCHAR(64) NULL,                  
  alt        VARCHAR(200) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email) VALUES
  ('Andi',  'andi@example.com'),
  ('Budi',  'budi@example.com'),
  ('Citra', 'citra@example.com');

INSERT INTO todos (user_id, text, done, shared, remind_at) VALUES
  (1, 'Belajar',   0, 0, '2026-11-20 09:00:00'),
  (1, 'rapat',    0, 1, '2026-11-23 10:00:00'),
  (2, 'Tidur',  0, 1, NULL);
