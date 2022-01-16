var http = require('http');

var hostname  = '127.0.0.1';
var port      = 3080;

var app = http.createServer(function(req, res) {
            res.setHeader('Content-Type', 'application/json');
            res.end('Res');
          });

app.listen(port, hostname);