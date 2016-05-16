CREATE TABLE user_distance (
    from_id integer NOT NULL REFERENCES users(id),
    to_id integer NOT NULL REFERENCES users(id),
    l1 integer,
    same_likes integer
);

CREATE TABLE film_distance (
    from_id integer NOT NULL REFERENCES movie(id),
    to_id integer NOT NULL REFERENCES movie(id),
    l1 integer
);