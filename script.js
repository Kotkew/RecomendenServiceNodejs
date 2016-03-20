function Site(){
    var self = this,
        database = false;
    
    self.Users = {
        Add: function(login){
            query("INSERT INTO users (login) VALUES ('" + login + "')");
        },
        
        Show: function(){
            query("SELECT * FROM users", function(result){
                console.log(JSON.stringify(result));
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
            var result = query("SELECT * FROM films", function(result){
                console.log(JSON.stringify(result));
            });
        }
    }
    
    function query(_query, _callback){
        try{
            if(!database){
                var pg = require('pg');
                database = new pg.Client('postgres://postgres:postgres@localhost/market');
                
                database.on('drain', database.end.bind(database));
                database.connect(function(err, client, done) {
                    if(err)
                        throw new Error('Ошибка подключения к бд.');
                });
            }

            var query = database.query(_query, function(err, result) {
                if(err)
                    throw new Error(_query + ': ' + err);

                if(_callback)
                    _callback(result.rows);
            });
        }
        catch(e){
            console.error(e.message);
        }
    }
}

var site = new Site();
//site.Users.Add('Jason 2');
site.Users.Show();
//site.Films.Add('Адреналин', 1);
site.Films.Show();
site.Categories.Show();

//console.log(site.Categories.Add('Боевик'));