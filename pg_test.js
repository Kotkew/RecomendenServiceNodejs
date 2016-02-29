var pg = require('pg');
var conString = "postgres://postgres:postgres@localhost/market";

pg.connect(conString, function(err, client, done) {
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  client.query('SELECT * FROM users', function(err, result) {
    done();

    if(err) {
      return console.error('error running query', err);
    }
	
	server(result.rows);
  });
});

function server(data){
	var http = require('http');

	var server = http.createServer(function (request, response) {
	  response.writeHead(200, {"Content-Type": "application/json"});
	  response.end(JSON.stringify(data));
	});
	server.listen(8080);

	console.log("Server running at http://127.0.0.1:8080/");
}