const STATIC_PORT = 8080;
const SOCKET_PORT = 8081;
const ANIM_DELAY  = 1000;

var readline = require("readline");
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

moveq = [];
inpEof = false;

rl.on("line", function(line) {
  var gameRegex = /.*{'game': {'id'.*/g;
  var gameData = gameRegex.exec(line);

  if (gameData != null) {
    gameData = gameData[0]
      .replaceAll("'", '"')
      .replaceAll("False", "false")
      .replaceAll("True", "true");
    console.log("trying to parse", gameData);
    moveData = JSON.parse(gameData);
    moveq.push(moveData);
  } else {
    console.log(line);
  }
}).on("close", function() {
  inpEof = true;
});
// create static web server
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(STATIC_PORT, function(){
  console.log('Server running on ' + STATIC_PORT + '...');
});


// create Websocket server
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: SOCKET_PORT });

wss.on('connection', function connection(ws) {
  console.log("connected");
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });

  setInterval(function() {
    if (moveq.length > 0) {
      ws.send(JSON.stringify(moveq[0]));
      moveq.splice(0, 1);
    } else if (inpEof) {
      process.exit();
    }
  }, (ANIM_DELAY / Math.log(moveq.length)));
});
