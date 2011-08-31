// server.js
var express = require('express'),
    http = require('http'),
    everyauth = require('everyauth'),
    conf = require('./conf'),
    browserify = require('browserify');


var app = express.createServer  (
    express.bodyParser(),
    express.static(__dirname + "/public"),
    express.cookieParser(),
    express.session({ secret: 'htuayreve'}),
    everyauth.middleware()
);

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.static(__dirname + '/public'));
    app.use('/js/lib', express.static(__dirname + '/lib'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

app.use(browserify({
    mount: '/browserify.js',
    require: ['events']
}));

// Routes
app.get('/', function(req, res){
    res.render('home');
});

app.listen(8080);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// then just pass the server app handle to .listen()!
var clients = {};

var fs = require('fs');
/*var server = require('http').createServer(function(req, response){
  fs.readFile('index.html', function(err, data){
    response.writeHead(200, {'Content-Type':'text/html'});  
    response.write(data);  
    response.end();
  });
});
server.listen(8080);*/
var everyone = require('now').initialize(app);


everyone.connected(function(){
  console.log("Joined: " + this.now.name);
});


everyone.disconnected(function(){
  console.log("Left: " + this.now.name);
});

everyone.now.distributeMessage = function(message){everyone.now.receiveMessage(this.now.name, message);};
