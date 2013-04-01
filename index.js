
var yaml = require('js-yaml')
  ,markov = require('./lib/markov.js')
  // ,mongoose = require('mongoose')
  ,net = require('net')
  ,express = require('express')
  ,http = require('http')
  ,app = express()
  ,server = http.createServer(app)
  ,fs = require('fs')
  ,io = require('socket.io').listen(server);


//configure the server
var config = JSON.parse(fs.readFileSync("config.json"));
var host = config.host
    ,socketPort = config.socketPort
    ,expressPort = config.expressPort
    ,timeInterval = config.timeInterval
    ,comms = config.commodities;




console.log("server starting\n\n");

//TODO:
/*
Make data stateful in a DB
*/
//test mongoose connection
// mongoose.connect('mongodb://localhost/test');
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function callback () {
//   console.log("DB Connection check pass.\n");
// });

var commodities = [];

for(var i = 0; i < comms.length; i++)
{
  commodities[i] = markov.createCommodity(comms[i].name, comms[i].basePrice, comms[i].unit,comms[i].stateValues);
}

console.log("market ready...\n\n");

/*=================================================================
Start socket.io server
===================================================================*/
 

app.use(express.static(__dirname + '/public'));

// app.listen(4000);
app.listen(expressPort);
// server.listen(1337);
server.listen(socketPort);

console.log("waiting for connections from clients on port http://localhost:" + expressPort + ". Live StockWatch\n");
console.log("waiting for connections from clients on port " + socketPort + " - leet baby!\n");

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

