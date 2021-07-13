const Game = ((global) => {
  const io = global.io;
  const config = {
    type: Phaser.AUTO,
    parent: "phaser-example",
    width: 800,
    height: 600,
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
        gravity: { y: 0 },
      },
    },
    scene: {
      preload,
      create,
      update,
    },
  };
  let socket;
  let game;

  function preload() {}
  function create() {
    // socket = io.connect();
    this.socket = io();
  }
  function update() {}

  const init = () => {
    game = new Phaser.Game(config);
  };

  return {
    init,
  };
})(window);
