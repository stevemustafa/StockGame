
var markov = require('./lib/markov.js')
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


//global vars
var marketConfigSent = false;
var mySocket;

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


console.log(commodities);
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

app.get('/about',function(req,res){
  res.sendfile(__dirname + "/public/about.html");
});



// =====================================================================================================================
//                                              Socket.IO
// =====================================================================================================================

//socket vars
var subscribedSockets = [];

setInterval(function(){
    console.log('price event captured');
    var price;
    var prices = [];
    for( var i = 0; i < commodities.length; i++)
    {
        prices[i] = JSON.stringify( { commodity : commodities[i].name, price : commodities[i].getNewPrice() });
    }
    io.sockets.emit('prices',{'prices': prices});
},timeInterval);

io.on('connection', function(socket){ 
    console.log("in connection Event Handler");
    //join the two rooms
    socket.join('market');
    socket.join('prices');

    subscribedSockets.push(socket);
    console.log('subscribed the socket');

    socket.on('market', function(){
      console.log("in sendMarketConfiguration()");
      var marketData = [];
      commodities.forEach(function(element, index, array){
        marketData.push({'commodity': element});
      })
      socket.emit('market',{'market': marketData});
  });
});
