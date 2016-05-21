CREATE TABLE movie (
    id serial PRIMARY KEY,
    title text,
    duration integer,
    year integer,
    poster text,
    director text,
    category text,
    rank real,
    position integer
);

CREATE TABLE users (
    id serial PRIMARY KEY,
    name text
);

CREATE TABLE comment (
    id serial PRIMARY KEY,
    user_id integer NOT NULL REFERENCES users(id),
    movie_id integer NOT NULL REFERENCES movie(id),
    text text
);

CREATE TABLE likes (
    user_id integer NOT NULL REFERENCES users(id),
    movie_id integer NOT NULL REFERENCES movie(id),
    PRIMARY KEY(movie_id, user_id)
);

CREATE TABLE user_distance (
    from_id integer NOT NULL REFERENCES users(id),
    to_id integer NOT NULL REFERENCES users(id),
    l1 integer,
    same_likes integer
);

CREATE TABLE film_distance (
    from_id integer NOT NULL REFERENCES movie(id),
    to_id integer NOT NULL REFERENCES movie(id),
    l1 integer,
    same_likes integer
);

CREATE TABLE ratings (
    user_id integer NOT NULL REFERENCES users(id),
    movie_id integer NOT NULL REFERENCES movie(id),
    rating integer,
    PRIMARY KEY(movie_id, user_id)
);