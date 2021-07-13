const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const playersService = require("./services/players");

io.on("connection", (client) => {
  console.log("a user connected " + client.id);
  const { newPlayer, players } = playersService.createPlayer(client.id);

  client.emit("currentPlayers", players);
  client.broadcast.emit("newPlayer", newPlayer);

  client.on("disconnect", () => {
    console.log("user disconnected");
    playersService.removePlayer(client.id);
    client.emit("disconnect", client.id);
  });
});

app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});
