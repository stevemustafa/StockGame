
var yaml = require('js-yaml')
  ,markov = require('./lib/markov.js')
  ,mongoose = require('mongoose')
  ,net = require('net')
  ,express = require('express')
  ,http = require('http')
  ,app = express()
  ,server = http.createServer(app)
  ,fs = require('fs')
  ,io = require('socket.io').listen(server);


//configure the server
// var config = JSON.parse(fs.readFileSync("config.json"));
// var host = config.host;
// var port = config.port;


console.log("server starting\n\n");

//test mongoose connection
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("DB Connection check pass.\n");
});

var timeInterval = 1000;
var stateValues = [[0.65,0.2,0.4],[0.05,0.2,0.2],[0.3,0.6,0.4]];
var commodities = [];

commodities[0] = markov.createCommodity('gold', 1000, 'Ounces',stateValues);
commodities[1] = markov.createCommodity('oil', 90, 'Barrel',stateValues);
commodities[2] = markov.createCommodity('pork bellies', 1, 'kilograms',stateValues);

console.log("market ready...\n\n");

/*=================================================================
Start socket.io server
===================================================================*/

// create a TCP listener for the socket.io coming for the markov values
// var app = require('http').createServer(handler)
//   , io = require('socket.io').listen(app)
  

app.listen(4000);
server.listen(1337);

console.log("waiting for connections from clients on port http://localhost:4000. Live StockWatch\n");
console.log("waiting for connections from clients on port 1337 - leet baby!\n");

app.get('/',function(req,res){
  res.sendfile(__dirname + "/public/index.html");
});

//tick and calculate the new state of each commodity
setInterval(sendNewCommodityPrices, timeInterval);

function sendNewCommodityPrices()
{
  var price;
  var prices = [];
  for( var i = 0; i < commodities.length; i++)
  {
     prices[i] = JSON.stringify( { commodity : commodities[i].name, price : commodities[i].getNewPrice()});
  }

  io.sockets.emit('prices',{'prices': prices});
}

io.sockets.on('connection', function(socket){ socketEventHandler(socket) });

function socketEventHandler(socket){
  socket.on('event', function(event) {
    socket.join(event);
  });
}

