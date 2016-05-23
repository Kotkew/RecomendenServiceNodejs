var pg = require('pg'),
    express = require('express'),
    swig = require('swig'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'); //npm install cookie-parser
    
var Actions = {
    GET: [
        {
            path: '/',
            template: './template/auth.html'
        },
        {
            path: '/exit',
            template: './template/auth.html',
            callback: function(page, resource){
                resource.clearCookie('id');
                resource.clearCookie('login');
                resource.redirect('/');
            }
        },
        {
            path: '/films',
            template: './template/films.html',
            callback: function(page, resource){
                SQL.Query('SELECT m.id, m.title, m.poster, m.rank, ARRAY_AGG(l.user_id) as likes FROM movie m LEFT JOIN likes l ON m.id = l.movie_id GROUP BY (m.id) ORDER BY m.id', function(data){                     
                    SQL.Query('SELECT m.id, m.title, m.poster, m.rank, COUNT(l) as likes FROM likes l JOIN movie m ON l.movie_id = m.id GROUP BY (m.id) ORDER BY likes DESC LIMIT 10', function(dataTop){
                    
                        resource.send(page({
                            'data': data,
                            'top': dataTop
                        }));
                    });
                });
            }
        },
        {
            path: '/films/:film_id',
            template: './template/film.html',
            callback: function(page, resource, request){
                //SELECT m.id, m.title, m.poster, m.rank, ARRAY_AGG(l.user_id), ARRAY_AGG(c.text) FROM movie m LEFT JOIN likes l ON m.id = l.movie_id LEFT JOIN comment c ON m.id = c.movie_id WHERE m.id = 1 GROUP BY (m.id)
                
                //Возвращает несколько записей
                SQL.Query('SELECT m.id, m.title, m.poster, m.rank, m.year, ARRAY_AGG(l.user_id) as likes, r.rating FROM movie m LEFT JOIN likes l ON m.id = l.movie_id LEFT JOIN ratings r ON m.id = r.movie_id AND r.user_id = ' + request.cookies.id + ' WHERE m.id = ' + request.params.film_id + ' GROUP BY (m.id, r.rating)', function(data){
                    
                    SQL.Query('SELECT t1.text, t2.name FROM comment t1 JOIN users t2 ON t1.user_id = t2.id WHERE t1.movie_id = ' + request.params.film_id + ' ORDER BY t1.id', function(dataComments){
                        SQL.Query('SELECT * FROM movie WHERE rank BETWEEN ' + data[0].rank + ' - 0.5 AND ' + data[0].rank + ' + 0.5 AND year BETWEEN ' + data[0].year + ' - 3 AND ' + data[0].year + ' + 3 AND id <> ' + data[0].id, function(dataSame){

                            resource.send(page({
                                'movie': data[0],
                                'near': dataSame,
                                'comments': dataComments
                            }));
                            
                        });
                    });
                });
            }
        },
        {
            path: '/recommendations/users',
            template: './template/rec_users.html',
            callback: function(page, resource, request){
                SQL.Query('SELECT u.name, ud.l1, ud.l2, ud.same_likes, ud.g FROM like_user_distance ud LEFT JOIN users u ON ud.to_id = u.id WHERE ud.from_id = ' +  request.cookies.id + ' ORDER BY ud.l2', function(data){
                    resource.send(page({
                        'data': data
                    }));
                });
            }
        },
        {
            path: '/recommendations/films/:film_id',
            template: './template/rec_films.html',
            callback: function(page, resource, request){
                SQL.Query('SELECT fd.to_id, fd.l1, fd.l2, fd.same_likes, fd.g, m.title FROM like_film_distance fd LEFT JOIN movie m ON fd.to_id = m.id WHERE from_id = ' + request.params.film_id + ' ORDER BY fd.l2', function(data){
                    resource.send(page({
                        'data': data
                    }));
                });
            }
        },
        {
            path: '/recommendations/users_by_rating',
            template: './template/rec_users_r.html',
            callback: function(page, resource, request){
                SQL.Query('SELECT u.name, ud.l1, ud.l2 FROM rating_user_distance ud LEFT JOIN users u ON ud.to_id = u.id WHERE ud.from_id = ' +  request.cookies.id + ' ORDER BY ud.l2', function(data){
                    resource.send(page({
                        'data': data
                    }));
                });
            }
        },
        {
            path: '/recommendations/films_by_rating/:film_id',
            template: './template/rec_films_r.html',
            callback: function(page, resource, request){
                SQL.Query('SELECT fd.to_id, fd.l1, fd.l2, m.title FROM rating_film_distance fd LEFT JOIN movie m ON fd.to_id = m.id WHERE from_id = ' + request.params.film_id + ' ORDER BY fd.l2', function(data){
                    resource.send(page({
                        'data': data
                    }));
                });
            }
        },
        {
            path: '/recommendations_update',
            template: './template/rec_films.html',
            callback: function(page, resource, request){
                SQL.Query('TRUNCATE TABLE like_user_distance', function(){
                    SQL.Query('SELECT u.id, ARRAY_AGG(l.movie_id) as likes FROM likes l LEFT JOIN users u ON l.user_id = u.id GROUP BY (u.id)', function(users){
                        SQL.Query('INSERT INTO like_user_distance VALUES ' + analyzeLikes(users));
                    });
                });
                
                SQL.Query('TRUNCATE TABLE like_film_distance', function(){
                    SQL.Query('SELECT l.movie_id as id, ARRAY_AGG(l.user_id) as likes FROM likes l LEFT JOIN movie m ON l.movie_id = m.id GROUP BY (l.movie_id)', function(likes){
                        SQL.Query('INSERT INTO like_film_distance VALUES ' + analyzeLikes(likes));
                    });
                });
                
                SQL.Query('TRUNCATE TABLE rating_user_distance', function(){
                    SQL.Query('SELECT u.id, ARRAY_AGG(r.movie_id) as iid, ARRAY_AGG(r.rating) as rating FROM ratings r LEFT JOIN users u ON r.user_id = u.id GROUP BY (u.id)', function(data){
                        SQL.Query('INSERT INTO rating_user_distance VALUES ' + analyzeRating(data));
                    });
                });
                
                SQL.Query('TRUNCATE TABLE rating_film_distance', function(){
                    SQL.Query('SELECT r.movie_id as id, ARRAY_AGG(r.user_id) as iid, ARRAY_AGG(r.rating) as rating FROM ratings r LEFT JOIN movie m ON r.movie_id = m.id GROUP BY (r.movie_id)', function(data){
                        SQL.Query('INSERT INTO rating_film_distance VALUES ' + analyzeRating(data));
                    });
                });
                
                resource.send('updated!');
                
                function analyzeLikes(data)
                {
                    var result = []
                        count = 0;
                    
                    for (var i = 0, l = data.length; i < l; i++)
                    {
                        for (var _i = 0, _l = data.length; _i < l; _i++)
                        {
                            var analyze = getDistance(data[i].likes, data[_i].likes);
                            
                            result[count] = {
                                from_id: data[i].id,
                                to_id: data[_i].id,
                                l1: analyze[0],
                                l2: analyze[1],
                                same_likes: analyze[2],
                                g: analyze[3] == 'Infinity' ? '\'Infinity\'' : analyze[3]
                            };
                            
                            count++;
                        }
                    }
                    
                    var sql = [];
                    for(var i = 0, l = result.length; i < l; i++)
                        sql[i] = '(' + result[i].from_id + ', ' + result[i].to_id + ', ' + result[i].l1 + ', ' + result[i].l2 + ', ' + result[i].g + ', ' + result[i].same_likes + ')';
                    
                    return sql;
                }
                
                function analyzeRating(data)
                {
                    var result = []
                        count = 0;
                    
                    for (var i = 0, l = data.length; i < l; i++)
                    {
                        for (var _i = 0, _l = data.length; _i < l; _i++)
                        {
                            var analyze = getDistance(data[i].iid, data[_i].iid, data[i].rating, data[_i].rating);
                            
                            result[count] = {
                                from_id: data[i].id,
                                to_id: data[_i].id,
                                l1: analyze[0],
                                l2: analyze[1]
                            };
                            
                            count++;
                        }
                    }
                    
                    var sql = [];
                    for(var i = 0, l = result.length; i < l; i++)
                        sql[i] = '(' + result[i].from_id + ', ' + result[i].to_id + ', ' + result[i].l1 + ', ' + result[i].l2 + ')';
                    
                    return sql;
                }
                
                function getDistance(a, b, _a, _b)
                {
                    var mask = false;
                    var l1 = l2 = 0;
                    if(_a && _b)
                    {
                        mask = [];
                        var mask_a = a.concat(b);
                        var mask_c = _a.concat(_b);
                        
                        for(var i = 0; i < mask_a.length; i++)
                            mask[mask_a[i]] = mask.indexOf(mask_a[i]) != -1 ? Math.abs(mask[mask_a[i]] - mask_c[i]) : mask_c[i];
                        
                        var same_f = a.filter(function(i) { return b.indexOf(i) > -1; });
                        
                        for (var i = 0; i < same_f.length; i++)
                        {
                            l1 += mask[same_f[i]];
                            l2 += Math.pow(mask[same_f[i]], 2);
                        }
                    }
                    
                    var first = a.filter(function(i) { return b.indexOf(i) < 0; }),
                        last = b.filter(function(i) { return a.indexOf(i) < 0; }),
                        full = first.concat(last);
                    
                    for (var i = 0; i < full.length; i++)
                    {
                        var item = mask ? (mask[full[i]] || 0) : 1;
                        
                        l1 += item;
                        l2 += Math.pow(item, 2);
                    }
                    
                    l2 = Math.sqrt(l2);
                    var same = a.length + b.length - full.length;
                    var g = same / (a.length + b.length - same);
                    
                    return [l1, l2, same, g];
                }
            }
        }
    ],
    
    POST: [
        {
            path: '/auth',
            callback: function(body, resource){
                //console.log(JSON.stringify(body));
                
                if(body.login){
                    SQL.Query('SELECT id FROM users WHERE name = \'' + body.login + '\' LIMIT 1', function(data){
                        if(!data.length){
                            SQL.Query('INSERT INTO users (name) VALUES (\'' + body.login + '\') RETURNING id', function(data){
                                createCookie(data[0].id);
                            });
                            
                            return;
                        }
                        
                        createCookie(data[0].id);
                    });
                    
                    return;
                }
                
                resource.redirect('/');
                
                function createCookie(id){
                    var cookieAge = 1000 * 60 * 600;
                    resource.cookie('id', id, { maxAge: cookieAge });
                    resource.cookie('login', body.login, { maxAge: cookieAge });
                    resource.redirect('/films');
                }
            }
        },
        {
            path: '/like',
            callback: function(body, resource, request){
                SQL.Query('INSERT INTO likes (user_id, movie_id) VALUES (' + request.cookies.id + ', ' + body.movie + ') ON CONFLICT DO NOTHING RETURNING 1', function(data){
                    if(!data.length)
                        SQL.Query('DELETE FROM likes WHERE user_id = ' + request.cookies.id + ' AND movie_id = ' + body.movie);
                });
                
                resource.redirect(request.get('referer'));
            }
        },
        {
            path: '/comment',
            callback: function(body, resource, request){
                SQL.Query('INSERT INTO comment (user_id, movie_id, text) VALUES (' + request.cookies.id + ', ' + body.movie + ', \'' + body.comment + '\')');
                resource.redirect(request.get('referer'));
            }
        },
        {
            path: '/rating',
            callback: function(body, resource, request){
                SQL.Query('INSERT INTO ratings (user_id, movie_id, rating) VALUES (' + request.cookies.id + ', ' + body.movie + ', ' + body.rating + ') ON CONFLICT (user_id, movie_id) DO UPDATE SET rating = ' + body.rating);
                resource.redirect(request.get('referer'));
            }
        }
    ]
}

var SQL = {
    Connect: false,
    
    Query: function(query, callback){
        try{
            if(!this.Connect){
                this.Connect = new pg.Client('postgres://postgres:postgres@localhost/market');
                //database.on('drain', database.end.bind(database));
                this.Connect.connect(function(error, client, done) { //Connect.connect щито?
                    if(error)
                        throw new Error(error);
                });
            }

            var request = this.Connect.query(query),
                result = [];
                
            request.on('error', function(error) {
                throw new Error(query + ' : ' + error);
            });
            
            if(callback){
                request.on('row', function(row) {
                    result.push(row);
                });
                
                request.on('end', function(end) {
                    callback(result);
                });
            }
        }
        catch(e){
            console.error(e.message);
        }
    }
}

function System(actions){
    var self = this;
    
    var app = express(),
        database = false;
        
    app.use(express.static('statics'));
    app.use(cookieParser());
    
    var urlencodedParser = bodyParser.urlencoded({ extended: false });
    
    self.Init = function(){
        for (var i = 0, l = actions.GET.length; i < l; i++)
            self.GET(actions.GET[i].path, actions.GET[i].template, actions.GET[i].callback);
        
        for (var i = 0, l = actions.POST.length; i < l; i++)
            self.POST(actions.POST[i].path, actions.POST[i].callback);
        
        app.listen(3000, function() {
            console.log('Example app listening on port 3000!');
        });
    }
    
    self.GET = function(path, template, callback){
        app.get(path, function (req, res) {
            console.log('GET: ' + path);
            var page = swig.compileFile(template);
            
            if(callback){
                if(!Object.getOwnPropertyNames(req.cookies).length){
                    res.redirect('/');
                    return;
                }
                
                callback(page, res, req);
                return;
            }
            
            res.send(page());
        });
    }
    
    self.POST = function(path, callback){
        app.post(path, urlencodedParser, function (req, res) {
            console.log('POST: ' + path);
            callback(req.body, res, req);
        });
    }
    
    self.Init();
}

var system = new System(Actions);