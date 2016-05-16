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
                
                SQL.Query('SELECT m.id, m.title, m.poster, m.rank, m.year, ARRAY_AGG(l.user_id) as likes FROM movie m LEFT JOIN likes l ON m.id = l.movie_id WHERE m.id = ' + request.params.film_id + ' GROUP BY (m.id) ORDER BY m.id', function(data){
                    
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
                SQL.Query('SELECT u.name, u.id, ARRAY_AGG(l.movie_id) as likes FROM likes l LEFT JOIN users u ON l.user_id = u.id GROUP BY (u.name, u.id)', function(users){
                    
                    var source,
                        result = [];
                    
                    for (var i = 0, l = users.length; i < l; i++)
                    {
                        //console.log(users[i].id + ' ' +  request.cookies.id);
                        if(users[i].id == request.cookies.id)
                        {
                            source = users[i].likes;
                            break;
                        }
                    }
                    
                    //console.log(JSON.stringify(source));
                    
                    for (var i = 0, l = users.length; i < l; i++)
                    {
                        result[i] = {
                            name: users[i].name,
                            distance: getDistance(source, users[i].likes)
                        };
                    }
                    
                    result.sort(function(a, b){ return a.distance - b.distance; });
                    resource.send(page({
                        'data': result
                    }));
                    
                    function getDistance(a, b) {
                        var first = a.filter(function(i) { return b.indexOf(i) < 0; });
                        var last  = b.filter(function(i) { return a.indexOf(i) < 0; });
                        
                        return first.concat(last).length;
                    };
                });
            }
        },
        {
            path: '/recommendations/films/:film_id',
            template: './template/rec_films.html',
            callback: function(page, resource, request){
                SQL.Query('SELECT m.title, l.movie_id, ARRAY_AGG(l.user_id) as likes FROM likes l LEFT JOIN movie m ON l.movie_id = m.id GROUP BY (l.movie_id, m.title)', function(likes){
                    
                    var source,
                        result = [];
                    
                    for (var i = 0, l = likes.length; i < l; i++)
                    {
                        if(likes[i].movie_id == request.params.film_id)
                        {
                            source = likes[i].likes;
                            break;
                        }
                    }
                    
                    if(!source)
                        throw new Error('Такого фильма не существует');
                    
                    for (var i = 0, l = likes.length; i < l; i++)
                    {
                        result[i] = {
                            id: likes[i].movie_id,
                            name: likes[i].title,
                            distance: getDistance(source, likes[i].likes)
                        };
                    }
                    
                    result.sort(function(a, b){ return a.distance - b.distance; });
                    resource.send(page({
                        'data': result
                    }));
                    
                    function getDistance(a, b) {
                        var first = a.filter(function(i) { return b.indexOf(i) < 0; });
                        var last  = b.filter(function(i) { return a.indexOf(i) < 0; });
                        
                        return first.concat(last).length;
                    };
                });
            }
        },
        {
            path: '/recommendations_update',
            template: './template/rec_films.html',
            callback: function(page, resource, request){
                SQL.Query('TRUNCATE TABLE user_distance', function(users){
                    SQL.Query('SELECT u.id, ARRAY_AGG(l.movie_id) as likes FROM likes l LEFT JOIN users u ON l.user_id = u.id GROUP BY (u.id)', function(users){
                        
                        var result = []
                            count = 0;
                        
                        for (var i = 0, l = users.length; i < l; i++)
                        {
                            for (var _i = 0, _l = users.length; _i < l; _i++)
                            {
                                var analyze = getDistance(users[i].likes, users[_i].likes);
                                
                                result[count] = {
                                    from: users[i].id,
                                    to: users[_i].id,
                                    l1: analyze[0],
                                    same_likes: analyze[1]
                                };
                                
                                count++;
                            }
                        }
                        
                        var sql = [];
                        for(var i = 0, l = result.length; i < l; i++)
                            sql[i] = '(' + result[i].from + ', ' + result[i].to + ', ' + result[i].l1 + ', ' + result[i].same_likes + ')';
                            
                        var res = 'INSERT INTO user_distance VALUES ' + sql.join();
                        
                        resource.send(res);
                    });
                });
                
                function getDistance(a, b) {
                    var first = a.filter(function(i) { return b.indexOf(i) < 0; });
                    var last  = b.filter(function(i) { return a.indexOf(i) < 0; });
                    
                    var diff = first.length + last.length;
                    var same = a.length + b.length - diff;
                    
                    return [diff, same];
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