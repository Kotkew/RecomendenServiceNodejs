var pg = require('pg'),
    express = require('express'),
    swig = require('swig');
    
var pages = [
    {
        title: 'Фильмы',
        path: '/films',
        template: './template/films.html',
        query: 'SELECT * FROM films'
    },
    {
        title: 'Фильм',
        path: '/films/:film_id',
        template: './template/film.html',
        query: 'SELECT * FROM films WHERE id = 1'
    }
];

var actions = [
    {
        path: '/auth',
        callback: function(){
            SQL.Query('SELECT 1 FROM users WHERE id = ИД', function(data){
                Console.log(data);
            });
        }
    },
    {
        path: '/like',
        callback: function(){
            
        }
    }
];

var SQL = {
    Connect: false,
    
    Query: function(query, callback){
        try{
            if(!this.Connect){
                this.Connect = new pg.Client('postgres://postgres:postgres@localhost/market');
                //database.on('drain', database.end.bind(database));
                this.Connect.connect(function(error, client, done) { //Что?)))
                    if(error)
                        throw new Error(error);
                });
            }

            var request = this.Connect.query(query),
                result = [];
                
            request.on('error', function(error) {
                throw new Error(error);
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

function System(){
    var self = this;
    
    var app = express(),
        database = false;
        
    self.Init = function(pages){
        for (var i = 0, l = pages.length; i < l; i++){
            self.Page(pages[i].path, pages[i].template, pages[i].query, pages[i].title);
        }
    }
    
    self.Page = function(path, template, _query, title){
        app.get(path, function (req, res) {
            console.log('GET: ' + path);
            
            var page = swig.compileFile(template);
            SQL.Query(_query, function(data){
                res.send(page({
                    'title': title,
                    'data': data
                }));
            });
        });
    }
    
    self.SetAction = function(path, callback){
        app.post(path, function (req, res) {
            console.log('POST: ' + path);
            
            callback();
        });
    }
    
    app.listen(3000, function() {
        console.log('Example app listening on port 3000!');
    });
}

var system = new System();
system.Init(pages);