const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const playersService = require("./services/players");
const roomPlayerMap = {};
const playerRoomMap = {};

const star = {
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50,
};
const scores = {
  blue: 0,
  red: 0,
};

io.on("connection", (client) => {
  console.log("a user connected " + client.id);

  client.on("room", (room) => {
    console.log(client.id + " has joined room " + room);
    myRoom = room;
    client.join(room);

    if (roomPlayerMap[room]) {
      roomPlayerMap[room].push(client.id);
    } else {
      roomPlayerMap[room] = [client.id];
    }
    playerRoomMap[client.id] = room;

    console.log("all rooms", io.sockets.adapter.rooms);

    const { newPlayer, players } = playersService.createPlayer(
      client.id,
      roomPlayerMap[room]
    );

    client.emit("currentPlayers", players);
    client.broadcast.to(playerRoomMap[client.id]).emit("newPlayer", newPlayer);

    client.emit("starLocation", star);
    // send the current scores
    client.emit("scoreUpdate", scores);

    client.on("disconnect", () => {
      console.log("user disconnected:", client.id);
      playersService.removePlayer(client.id);
      // io.emit("disconnectPlayer", client.id);
      io.in(playerRoomMap[client.id]).emit("disconnectPlayer", client.id);
    });

    // when a player moves, update the player data
    client.on("playerMovement", (movementData) => {
      players[client.id].x = movementData.x;
      players[client.id].y = movementData.y;
      players[client.id].rotation = movementData.rotation;
      client.broadcast
        .to(playerRoomMap[client.id])
        .emit("playerMoved", players[client.id]);
    });

    client.on("starCollected", () => {
      if (players[client.id].team === "red") {
        scores.red += 10;
      } else {
        scores.blue += 10;
      }
      star.x = Math.floor(Math.random() * 700) + 50;
      star.y = Math.floor(Math.random() * 500) + 50;
      io.in(playerRoomMap[client.id]).emit("starLocation", star);
      io.in(playerRoomMap[client.id]).emit("scoreUpdate", scores);
    });
  });
});

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
