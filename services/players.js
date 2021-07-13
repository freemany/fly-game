const players = {};

const createPlayer = (clientId) => {
  const newPlayer = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: clientId,
    team: Math.floor(Math.random() * 2) == 0 ? "red" : "blue",
  };
  players[clientId] = newPlayer;

  console.log({ newPlayer, players });

  return { newPlayer, players };
};

const removePlayer = (clientId) => {
  delete players[clientId];
  console.log("remove: ", clientId);
};

module.exports = {
  getPlayers: () => players,
  createPlayer,
  removePlayer,
};
