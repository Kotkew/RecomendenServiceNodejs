function Site(){
	var self = this;
	
	self.Users = {
		Add: function(login){
			query('INSERT INTO users (login) VALUES (' + login + ')');
		},
		
		Show: function(){
			query('SELECT * FROM users', true);
		}
	}
	
	self.Categories = {
		Add: function(name){
			return 'INSERT INTO cats (name) VALUES (' + name + ')';
		}
	}
	
	function query(query, result){
		var pg = require('pg');
		var conString = "postgres://postgres:postgres@localhost/market";
		
		pg.connect(conString, function(err, client, done) {
			if(err) {
				return console.error('error fetching client from pool', err);
			}
			
			client.query(query, function(err, result) {
				done();

				if(err) {
					return console.error('error running query', err);
				}
				
				if(result)
					console.log(JSON.stringify(result.rows));
				
				pg.end();
			});
		});
	}
}

var site = new Site();
//site.Users.Add('Jason');
site.Users.Show();

//console.log(site.Categories.Add('Боевик'));