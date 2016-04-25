var pg = require('pg'),
    express = require('express'),
    swig = require('swig');
    
var app = express(),
    connect = 'postgres://postgres:postgres@localhost/market';

function Site(){
    var self = this,
        database = false,
        system = new System();
    
    self.Users = {
        Add: function(login){
            query("INSERT INTO users (login) VALUES ('" + login + "')");
        },
        
        Show: function(){
            query("SELECT * FROM users", function(result){
                return result;
            });
        }
    }
    
    self.Categories = {
        Add: function(name){
            query("INSERT INTO cats (name) VALUES ('" + name + "')");
        },
        
        Show: function(){
            var result = query("SELECT * FROM cats", function(result){
                console.log(JSON.stringify(result));
            });
        },
        
        Delete: function(id){
            query("DELETE FROM cats WHERE id = " + id);
        }
    }
    
    self.Films = {
        Add: function(name, category, image){
            image = image || '';
            query("INSERT INTO films (name, category, image) VALUES ('" + name + "', " + category + ", '" + image + "');");
        },
        
        Show: function(){
            // "SELECT f.id, f.name, c.name as category, f.image, f.likes FROM films f LEFT JOIN cats c ON f.category = c.id ORDER BY f.id"
            query("SELECT * FROM films", function(data){
                system.Page('/films', './template/films.html', data, 'Фильмы');
            });
        },
        
        ShowByID: function(id){
            query("SELECT * FROM films WHERE id = 1", function(data){
                system.Page('/films/:film_id', './template/film.html', data[0], data[0].name);
            });
        },
        
        Like: function(userID, filmID){
            query("SELECT likes FROM films WHERE id = " + filmID, function(result){
                result = result[0].likes;
                
                var index = result.indexOf(userID);
                if (index == -1)
                    result.push(userID);
                else
                    result.splice(index, 1);
                    
                result = JSON.stringify(result);
                query("UPDATE films SET likes = '" + result + "' WHERE id = " + filmID);
            });
        }
    }
    
    function query(_query, _callback){
        try{
            if(!database){
                database = new pg.Client(connect);
                database.on('drain', database.end.bind(database));
                database.connect(function(error, client, done) {
                    if(error){
                        throw new Error(error);
                    }
                });
            }

            var query = database.query(_query),
                result = [];
                
            query.on('error', function(error) {
                throw new Error(error);
            });
            
            if(_callback){
                query.on('row', function(row) {
                    result.push(row);
                });
                
                query.on('end', function(end) {
                    _callback(result);
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
    
    self.Page = function(path, template, data, title){
        app.get(path, function (req, res) {
            var page = swig.compileFile(template);
            res.send(page({
                'title': title || '',
                'data': data
            }));
        });
    }

    app.listen(3000, function () {
        console.log('Example app listening on port 3000!');
    });
}

var site = new Site();
//var system = new System();
//site.Films.Like(1, 1);
//site.Films.ShowByID(1);
//system.addPath('/');

site.Films.Show();
site.Films.ShowByID();