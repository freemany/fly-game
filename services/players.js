const players = {};

const filterPlayers = (players, roomPlayers) => {
  const results = {};

  for (const id in players) {
    if (roomPlayers.includes(id)) {
      results[id] = players[id];
    }
  }

  return results;
};

const createPlayer = (clientId, roomPlayers) => {
  const newPlayer = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: clientId,
    team: Math.floor(Math.random() * 2) == 0 ? "red" : "blue",
  };
  players[clientId] = newPlayer;

  return {
    newPlayer,
    players: filterPlayers(players, roomPlayers),
  };
};

const removePlayer = (clientId) => {
  delete players[clientId];
};

module.exports = {
  getPlayers: () => players,
  createPlayer,
  removePlayer,
};
