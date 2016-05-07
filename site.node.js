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
                SQL.Query('SELECT m.id, m.title, m.poster, m.rank, SUM(1) as likes FROM movie m LEFT JOIN likes l ON m.id = l.movie_id GROUP BY (m.id) ORDER BY m.id', function(data){
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
                SQL.Query('SELECT *, (SELECT 1 FROM likes WHERE user_id = ' + request.cookies.id + ' AND movie_id = ' + request.params.film_id + ') AS has_like FROM movie WHERE id = ' + request.params.film_id, function(data){
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
                    resource.cookie('id', id, { maxAge: 900000 });
                    resource.cookie('login', body.login, { maxAge: 900000 });
                    resource.redirect('/films');
                }
            }
        },
        {
            path: '/like',
            callback: function(body, resource, request){
                SQL.Query('SELECT 1 FROM likes WHERE user_id = ' + request.cookies.id + ' AND movie_id = ' + body.movie + ' LIMIT 1', function(data){
                    if(!data.length){
                        SQL.Query('INSERT INTO likes (user_id, movie_id) VALUES (' + request.cookies.id + ', ' + body.movie + ')');
                        return;
                    }
                    
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