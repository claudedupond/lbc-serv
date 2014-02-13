var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var request = require('request');
var lbcscraper = require('./lib/lbcscraper');

var app = express();

// all environments
app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1");
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

global.running = true;
global.last = new Date().toString('T');
global.waitingList = [];
global.lbcscraper = new lbcscraper();
global.count = 0;

app.get('/', routes.index);
app.post('/stat', routes.stat);
app.post('/add', routes.add);
app.post('/start', routes.start);
app.post('/stop', routes.stop);

http.createServer(app).listen(app.get('port'), app.get('ip'), function () {
    console.log('Express server listening on port ' + app.get('port'));
    global.lbcscraper.run();
    var requestJSON = require('request-json');
});
