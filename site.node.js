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
            console.log('Request: ' + path);
            var page = swig.compileFile(template);
            query(_query, function(data){
                res.send(page({
                    'title': title,
                    'data': data
                }));
            });
        });
    }

    app.listen(3000, function() {
        console.log('Example app listening on port 3000!');
    });
    
    function query(query, callback){
        try{
            if(!database){
                database = new pg.Client('postgres://postgres:postgres@localhost/market');
                //database.on('drain', database.end.bind(database));
                database.connect(function(error, client, done) {
                    if(error)
                        throw new Error(error);
                });
            }

            var request = database.query(query),
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

var system = new System();
system.Init(pages);