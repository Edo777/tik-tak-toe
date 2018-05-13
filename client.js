process.stdin.setEncoding('utf8');
const io = require('socket.io-client')
const URI = "http://" + process.argv[2];
const socket = io.connect(URI);
var turn = 1;

//The main logic of the client side
socket.on("connect", connectionID);
socket.on("board", displayBoard);
socket.on("which-turn", turnOfPlayer);
socket.on("result", resultGame);
socket.on("message", messageCB);
socket.on("disconnect", disconnected);

//The fonction is provided the read from the terminals and send messages to the server from corresponding players
function messageCB(data) {
    console.log(data)
    process.stdin.on('readable', () => {
        const chunk = process.stdin.read();
        if (chunk !== null) {
            if (turn == 1) {
                socket.emit("first-player", { chunk, id: socket.id });
            } else {
                socket.emit("second-player", { chunk, id: socket.id });
            }
        };
    });
};

//The function is provided to send the socket ID 
function connectionID() {
    socket.emit("start-game", socket.id);
    console.log("connected to " + URI);
}

function disconnected() {
    console.log("server disconnected")
    socket.removeAllListeners();
    return socket.close();
}

//This function is provided to display the game result
function resultGame(data) {
    console.log(data);
    process.stdin.removeAllListeners();
    return socket.close();
}

//This function is provided to detect the player and swap the turn
function turnOfPlayer(data) {
    turn = data;
}

//This function is provided to display the board after each step
function displayBoard(game){
    for(let i = 0; i < game.length; i++){
      process.stdout.write(game[i]);
      if(((i+1) % 3) == 0){
        process.stdout.write("\n");
      }
    }
  }