const Game = ((global) => {
  const io = global.io();
  const config = {
    type: Phaser.AUTO,
    parent: "game-canvas",
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
  let myGame;

  function preload() {
    this.load.image("ship", "assets/spaceShips_001.png");
    this.load.image("otherPlayer", "assets/enemyBlack5.png");
    this.load.image("star", "assets/star_gold.png");
  }
  function create() {
    console.log("creating.....");
    const game = this;
    this.socket = io;
    this.otherPlayers = this.physics.add.group();

    this.socket.on("currentPlayers", (players) => {
      console.log("current players", players);
      Object.keys(players).forEach((id) => {
        console.log(players[id], game.socket.id);
        if (id === game.socket.id) {
          addPlayerToGame(game, players[id]);
        } else {
          addOtherPlayers(game, players[id]);
        }
      });
    });

    this.socket.on("newPlayer", (player) => {
      console.log("newplayer", player);
      addOtherPlayers(game, player);
    });

    this.socket.on("disconnectPlayer", (playerId) => {
      game.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });
    this.cursors = this.input.keyboard.createCursorKeys();

    this.socket.on("playerMoved", (player) => {
      game.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (player.playerId === otherPlayer.playerId) {
          otherPlayer.setRotation(player.rotation);
          otherPlayer.setPosition(player.x, player.y);
        }
      });
    });

    this.blueScoreText = this.add.text(16, 16, "", {
      fontSize: "32px",
      fill: "#0000FF",
    });
    this.redScoreText = this.add.text(584, 16, "", {
      fontSize: "32px",
      fill: "#FF0000",
    });

    this.socket.on("scoreUpdate", (scores) => {
      game.blueScoreText.setText("Blue: " + scores.blue);
      game.redScoreText.setText("Red: " + scores.red);
    });

    this.socket.on("starLocation", (starLocation) => {
      console.log("receive start location", starLocation);
      if (game.star) game.star.destroy();
      game.star = game.physics.add.image(
        starLocation.x,
        starLocation.y,
        "star"
      );
      game.physics.add.overlap(
        game.ship,
        game.star,
        // function () {
        //   this.socket.emit("starCollected");
        // },
        () => {
          game.socket.emit("starCollected");
        },
        null,
        game
      );
    });
  }
  function update() {
    if (this.ship) {
      if (this.cursors.left.isDown) {
        this.ship.setAngularVelocity(-150);
      } else if (this.cursors.right.isDown) {
        this.ship.setAngularVelocity(150);
      } else {
        this.ship.setAngularVelocity(0);
      }

      if (this.cursors.up.isDown) {
        this.physics.velocityFromRotation(
          this.ship.rotation + 1.5,
          100,
          this.ship.body.acceleration
        );
      } else {
        this.ship.setAcceleration(0);
      }

      this.physics.world.wrap(this.ship, 5);

      // other player motion
      const x = this.ship.x;
      const y = this.ship.y;
      const r = this.ship.rotation;
      if (
        this.ship.oldPosition &&
        (x !== this.ship.oldPosition.x ||
          y !== this.ship.oldPosition.y ||
          r !== this.ship.oldPosition.rotation)
      ) {
        this.socket.emit("playerMovement", {
          x: this.ship.x,
          y: this.ship.y,
          rotation: this.ship.rotation,
        });
      }

      // save old position data
      this.ship.oldPosition = {
        x: this.ship.x,
        y: this.ship.y,
        rotation: this.ship.rotation,
      };
    }
  }

  const addPlayerToGame = (game, player) => {
    game.ship = game.physics.add
      .image(player.x, player.y, "ship")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(53, 40);
    if (player.team === "blue") {
      game.ship.setTint(0x0000ff);
    } else {
      game.ship.setTint(0xff0000);
    }
    game.ship.setDrag(100);
    game.ship.setAngularDrag(100);
    game.ship.setMaxVelocity(200);
  };

  const addOtherPlayers = (game, player) => {
    const otherPlayer = game.add
      .sprite(player.x, player.y, "otherPlayer")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(53, 40);
    if (player.team === "blue") {
      otherPlayer.setTint(0x0000ff);
    } else {
      otherPlayer.setTint(0xff0000);
    }
    otherPlayer.playerId = player.playerId;
    game.otherPlayers.add(otherPlayer);
  };

  const init = () => {
    myGame = new Phaser.Game(config);
  };

  return {
    getIo: () => io,
    init,
    getGame: () => myGame,
  };
})(window);
