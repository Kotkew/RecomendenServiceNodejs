--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.1
-- Dumped by pg_dump version 9.5.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: comment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE comment (
    id integer NOT NULL,
    user_id integer NOT NULL,
    movie_id integer NOT NULL,
    text text
);


ALTER TABLE comment OWNER TO postgres;

--
-- Name: comment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE comment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE comment_id_seq OWNER TO postgres;

--
-- Name: comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE comment_id_seq OWNED BY comment.id;


--
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE likes (
    user_id integer NOT NULL,
    movie_id integer NOT NULL
);


ALTER TABLE likes OWNER TO postgres;

--
-- Name: movie; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE movie (
    id integer NOT NULL,
    title text,
    duration integer,
    year integer,
    poster text,
    director text,
    category text,
    rank real,
    "position" integer
);


ALTER TABLE movie OWNER TO postgres;

--
-- Name: movie_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE movie_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE movie_id_seq OWNER TO postgres;

--
-- Name: movie_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE movie_id_seq OWNED BY movie.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE users (
    id integer NOT NULL,
    name text
);


ALTER TABLE users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY comment ALTER COLUMN id SET DEFAULT nextval('comment_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY movie ALTER COLUMN id SET DEFAULT nextval('movie_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Data for Name: comment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY comment (id, user_id, movie_id, text) FROM stdin;
\.


--
-- Name: comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('comment_id_seq', 1, false);


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY likes (user_id, movie_id) FROM stdin;
6	1
6	2
6	3
6	4
6	5
6	6
6	7
6	8
6	9
6	10
6	11
6	12
6	13
6	14
6	15
6	16
6	17
6	18
6	19
6	20
6	21
6	22
6	23
6	24
6	25
6	26
6	27
6	28
6	29
6	30
6	31
6	32
6	33
6	34
6	35
6	36
6	37
6	38
6	39
6	40
6	41
6	42
6	43
6	44
6	45
6	46
6	47
6	48
1	3
1	4
1	6
1	10
1	11
1	12
1	14
1	15
1	18
1	19
1	20
1	21
1	23
1	25
1	26
1	28
1	33
1	34
1	35
1	38
1	39
1	42
1	44
1	45
1	47
1	48
2	1
2	4
2	7
2	8
2	9
2	10
2	11
2	12
2	15
2	19
2	20
2	21
2	22
2	23
2	26
2	27
2	29
2	30
2	31
2	33
2	34
2	36
2	38
2	40
2	41
2	42
2	47
2	48
3	2
3	4
3	5
3	8
3	14
3	15
3	17
3	18
3	19
3	20
3	22
3	24
3	26
3	29
3	30
3	34
3	37
3	39
3	42
3	43
3	46
3	47
4	1
4	3
4	4
4	5
4	6
4	10
4	12
4	17
4	18
4	19
4	21
4	24
4	26
4	27
4	28
4	29
4	30
4	33
4	35
4	39
4	42
4	43
4	45
4	46
4	47
4	48
5	3
5	4
5	5
5	6
5	9
5	10
5	13
5	15
5	16
5	17
5	18
5	21
5	22
5	23
5	26
5	27
5	29
5	31
5	32
5	35
5	36
5	37
5	38
5	39
5	41
5	42
5	44
5	47
5	48
\.


--
-- Data for Name: movie; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY movie (id, title, duration, year, poster, director, category, rank, "position") FROM stdin;
1	Побег из Шоушенка	\N	1994	http://st-im.kinopoisk.ru/im/poster/1/4/7/kinopoisk.ru-The-Shawshank-Redemption-1479180.jpg	\N	\N	9.19999981	\N
2	Крёстный отец	\N	1972	http://www.kinopoisk.ru/images/film_big/325.jpg	\N	\N	9.19999981	\N
3	Крёстный отец 2	\N	1974	http://www.kinopoisk.ru/images/film_big/327.jpg	\N	\N	9	\N
4	Тёмный рыцарь	\N	2008	http://www.kinopoisk.ru/images/film_big/111543.jpg	\N	\N	8.89999962	\N
5	Список Шиндлера	\N	1993	http://www.kinopoisk.ru/images/film_big/329.jpg	\N	\N	8.89999962	\N
6	Криминальное чтиво	\N	1994	http://www.kinopoisk.ru/images/film_big/342.jpg	\N	\N	8.89999962	\N
7	12	\N	2007	http://www.kinopoisk.ru/images/film_big/222809.jpg	\N	\N	7.5999999	\N
8	Властелин колец: Возвращение короля	\N	2003	http://st-im.kinopoisk.ru/im/poster/8/1/7/kinopoisk.ru-The-Lord-of-the-Rings_3A-The-Return-of-the-King-817079.jpg	\N	\N	8.89999962	\N
9	Бойцовский клуб	\N	1999	http://st-im.kinopoisk.ru/im/poster/1/8/0/kinopoisk.ru-Fight-Club-1801683.jpg	\N	\N	8.80000019	\N
10	Начало	\N	2010	http://st-im.kinopoisk.ru/im/poster/1/3/0/kinopoisk.ru-Inception-1302163.jpg	\N	\N	8.69999981	\N
11	Пролетая над гнездом кукушки	\N	1975	http://www.kinopoisk.ru/images/film_big/336.jpg	\N	\N	8.69999981	\N
12	Славные парни	\N	1990	http://www.kinopoisk.ru/images/film_big/350.jpg	\N	\N	8.69999981	\N
13	Матрица	\N	1999	http://www.kinopoisk.ru/images/film_big/301.jpg	\N	\N	8.69999981	\N
14	Леон	\N	1994	http://st-im.kinopoisk.ru/im/poster/1/7/8/kinopoisk.ru-L_26_23233_3Bon-1784007.jpg	\N	\N	8.60000038	\N
15	Унесённые призраками	\N	2001	http://www.kinopoisk.ru/images/film_big/370.jpg	\N	\N	8.5	\N
16	Зеленая миля	\N	1999	http://st.kp.yandex.net/images/film_iphone/iphone360_435.jpg	\N	\N	8.5	\N
17	1+1	\N	2011	http://st.kp.yandex.net/images/film_iphone/iphone360_535341.jpg	\N	\N	8.80000019	\N
18	Жизнь прекрасна	\N	1997	http://www.kinopoisk.ru/images/film_big/381.jpg	\N	\N	8.60000038	\N
19	Иван Васильевич меняет профессию	\N	1973	http://st.kp.yandex.net/images/film_iphone/iphone360_42664.jpg	\N	\N	8.69999981	\N
20	Достучаться до небес	\N	1997	http://st.kp.yandex.net/images/film_iphone/iphone360_32898.jpg	\N	\N	8.60000038	\N
21	Интерстеллар	\N	2014	http://st.kp.yandex.net/images/film_iphone/iphone360_258687.jpg	\N	\N	8.60000038	\N
22	Престиж	\N	2006	http://st.kp.yandex.net/images/film_iphone/iphone360_195334.jpg	\N	\N	8.5	\N
23	Игры разума	\N	2001	http://www.kinopoisk.ru/images/film_big/530.jpg	\N	\N	8.5	\N
24	Операция «Ы» и другие приключения Шурика	\N	1965	http://www.kinopoisk.ru/images/film_big/42782.jpg	\N	\N	8.69999981	\N
25	Гладиатор	\N	2000	http://st.kp.yandex.net/images/film_iphone/iphone360_474.jpg	\N	\N	8.60000038	\N
26	Назад в будущее	\N	1985	http://st.kp.yandex.net/images/film_iphone/iphone360_476.jpg	\N	\N	8.60000038	\N
27	Карты, деньги, два ствола	\N	1998	http://st.kp.yandex.net/images/film_iphone/iphone360_522.jpg	\N	\N	8.5	\N
28	Зверополис	\N	2016	http://st.kp.yandex.net/images/film_iphone/iphone360_775276.jpg	\N	\N	8.60000038	\N
29	Пианист	\N	2002	http://st.kp.yandex.net/images/film_iphone/iphone360_355.jpg	\N	\N	8.39999962	\N
30	Поймай меня, если сможешь	\N	2002	http://st.kp.yandex.net/images/film_iphone/iphone360_324.jpg	\N	\N	8.5	\N
31	В бой идут одни «старики»	\N	1973	http://st.kp.yandex.net/images/film_iphone/iphone360_25108.jpg	\N	\N	8.69999981	\N
32	Властелин колец: Братство кольца	\N	2001	http://st.kp.yandex.net/images/film_iphone/iphone360_328.jpg	\N	\N	8.5	\N
33	Отступники	\N	2006	http://st.kp.yandex.net/images/film_iphone/iphone360_81314.jpg	\N	\N	8.39999962	\N
34	Бриллиантовая рука	\N	1968	http://st.kp.yandex.net/images/film_iphone/iphone360_46225.jpg	\N	\N	8.60000038	\N
35	Властелин колец: Две крепости	\N	2002	http://st.kp.yandex.net/images/film_iphone/iphone360_312.jpg	\N	\N	8.5	\N
36	Американская история Х	\N	1998	http://st.kp.yandex.net/images/film_iphone/iphone360_382.jpg	\N	\N	8.39999962	\N
37	Большой куш	\N	2000	http://st.kp.yandex.net/images/film_iphone/iphone360_526.jpg	\N	\N	8.5	\N
38	Остров проклятых	\N	2009	http://st.kp.yandex.net/images/film_iphone/iphone360_397667.jpg	\N	\N	8.5	\N
39	Пробуждение	\N	1990	http://www.kinopoisk.ru/images/film_big/2950.jpg	\N	\N	8.39999962	\N
40	Пираты Карибского моря: Проклятие Черной жемчужины	\N	2003	http://st.kp.yandex.net/images/film_iphone/iphone360_4374.jpg	\N	\N	8.30000019	\N
41	Хористы	\N	2004	http://st.kp.yandex.net/images/film_iphone/iphone360_51481.jpg	\N	\N	8.30000019	\N
42	Джентльмены удачи	\N	1971	http://www.kinopoisk.ru/images/film_big/44386.jpg	\N	\N	8.60000038	\N
43	Дубровский	\N	2014	http://right-film.ru/uploads/posts/2016-02/1456157180-1824291676.jpg	\N	\N	5.76300001	\N
44	Про Любовь	\N	2015	http://drufilms.ru/uploads/posts/2015-12/1450534383-2032288180.jpg	\N	\N	6.55900002	\N
45	Король Лев	\N	1994	http://ru2.anyfad.com/items/t2@c60a98bb-6f13-4f16-b238-1c9c1c8b07e4/Korol-Lev-1994.jpg	\N	\N	8.80000019	\N
46	Приключения Паддингтона	\N	2014	http://kinogo-net-2015.ru/uploads/posts/2015-01/1421601585_priklyucheniya-paddingtona.jpg	\N	\N	7.19999981	\N
47	Гарри Поттер и Дары Смерти	\N	2010	http://kino-go.tv/uploads/posts/2015-07/1437691322_poster-407636.jpg	\N	\N	7.80000019	\N
48	Хроники Нарнии: Покоритель Зари	\N	2010	http://kino-go.tv/uploads/posts/2015-09/1441656442_poster-281439.jpg	\N	\N	6.9000001	\N
\.


--
-- Name: movie_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('movie_id_seq', 48, true);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY users (id, name) FROM stdin;
1	Екатерина
2	Милана
3	Анастасия
4	Татьяна
5	Александр
6	Вася
7	Петя
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('users_id_seq', 7, true);


--
-- Name: comment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);


--
-- Name: likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (movie_id, user_id);


--
-- Name: movie_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY movie
    ADD CONSTRAINT movie_pkey PRIMARY KEY (id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: comment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY likes
    ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: talipov
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM talipov;
GRANT ALL ON SCHEMA public TO talipov;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

