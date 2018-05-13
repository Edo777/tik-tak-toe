const server = require('http').createServer()
const io = require('socket.io')(server)
const PORT = process.argv[2];
var players = [];
const RESIGN = "r";
var countSteps = 0;
var currentId = null;
var CLIENT;
var game = ['.', ".", ".", ".", ".", ".", ".", ".", "."];

// Check the existance of the specified port
if (!PORT) {
  return console.log("Please Read the PORT like this => node server.js 5050");
};

// The main logic of the server
io.on('connection', function (client) {
  CLIENT = client;
  client.on("first-player", firstPlayerController);
  client.on("second-player", secondPlayerController);
  client.on('start-game', startGame);
  client.on('connection', connection);
  client.on('error', error);
  client.on("disconnect", disconnect);
});

server.listen(PORT, function (err) {
  if (err) throw err
  console.log(`listening on port ${PORT}`)
});

function disconnect() {
  players = [];
};

function error(err) {
  console.log('received error from client:', CLIENT.id)
  console.log(err)
};

function connection() {
  console.log('client disconnect...', CLIENT.id)
  handleDisconnect()
};

//This function is provided to make and check the first player mouves
function firstPlayerController(data) {
  if (currentId == data.id) {
    return CLIENT.emit("which-turn", 2);
  }
  else if (checkField(data.chunk, 'first')) {
    currentId = data.id;
    game[+data.chunk - 1] = 'x';
    countSteps++;
    checkWinOrNot("Game won by first player", 'x');
  };
};

//This function is provided to make and check the second player mouves
function secondPlayerController(data) {
  if (currentId == data.id) {
    return CLIENT.emit("which-turn", 1);
  }
  else if (checkField(data.chunk, 'second')) {
    currentId = data.id;
    game[+data.chunk - 1] = '0';
    countSteps++;
    checkWinOrNot("Game won by second player", '0');
  }
};

//This function is provided to start the game if 2 players have already connected
function startGame(id) {
  players.push({
    id: id,
    player: players.length + 1
  });
  if (players.length == 2) {
    io.sockets.connected[players[0].id].emit('message', 'Game started you are the first player');
    io.sockets.connected[players[1].id].emit('message', 'Game started you are the second player');
    currentId = players[1].id;
    CLIENT.emit('which-turn', 2);
  }
};

//This function is provided to check the loyality to fill the board or resign from the game
function checkField(data, role) {
  if (data.trim() == RESIGN) {
    if (role == 'first') {
      emitClients('result', "Game won by second player");
    } else {
      emitClients('result', "Game won by first player");
    }
    player = [];
    return false
  } else if (game[(+data) - 1] == '.' && (+data> 0 && +data < 10)) {
    return true;
  } else {
    return false;
  }
};

//This function is provided to anounce the game result
function checkWinOrNot(message, which) {
  emitClients("board", game);
  var stat1 = ((game[0] == which) && ((game[0] === game[1]) && (game[1] === game[2])));
  var stat2 = ((game[0] == which) && ((game[0] === game[3]) && (game[3] === game[6])));
  var stat3 = ((game[0] == which) && ((game[0] === game[4]) && (game[4] === game[8])));
  var stat4 = ((game[1] == which) && ((game[1] === game[4]) && (game[4] === game[7])));
  var stat5 = ((game[2] == which) && ((game[2] === game[5]) && (game[5] === game[8])));
  var stat6 = ((game[2] == which) && ((game[2] === game[4]) && (game[4] === game[6])));
  var stat7 = ((game[3] == which) && ((game[3] === game[4]) && (game[4] === game[5])));
  var stat8 = ((game[6] == which) && ((game[6] === game[7]) && (game[7] === game[8])));
  if (stat1 || stat2 || stat3 || stat4 || stat5 || stat6 || stat7 || stat8) {
    game = [".", ".", ".", ".", ".", ".", ".", ".", "."];
    countSteps = 0;
    emitClients('result', message);
    players = [];
    //io.sockets.removeAllListeners();
    return
  } else if (countSteps == 9) {
    game = [".", ".", ".", ".", ".", ".", ".", ".", "."];
    emitClients('result', "Game is tied");
    players = [];
    //io.sockets.removeAllListeners();
  }
}
//This function is provided to send the same messages to the clients
function emitClients(event, message) {
  io.sockets.connected[players[0].id].emit(event, message);
  io.sockets.connected[players[1].id].emit(event, message);
}