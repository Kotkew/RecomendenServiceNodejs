CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    login VARCHAR NOT NULL
);
CREATE TABLE cats (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL
);
CREATE TABLE films (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    category INT NOT NULL,
    image TEXT,
    LIKES JSON
);

INSERT INTO users (login) VALUES ('Jason');
INSERT INTO users (login) VALUES ('Statham');

INSERT INTO cats (name) VALUES ('Боевик');
INSERT INTO cats (name) VALUES ('Комедия');

INSERT INTO films (name, category) VALUES ('Адреналин', 1);