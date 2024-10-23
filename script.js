const config = {
    type: Phaser.AUTO,
    parent: "game",
    width: 1280,
    height: 720,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
  backgroundColor: "#66ccff",
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
    scene: {
        init: init,
        preload: preload,
        create: create,
        update: update
    }
};

//initialize the game
const game = new Phaser.Game(config);

var blueClouds;
var whiteClouds;
var whiteCloudSmall;
var plane;
var coinGroup, coin;
var obstacleGroup, obstacle;
var GameOver = false;
var scoreText;
var positionsY = [125, 360, 595];
var coinTime = true;

//initialize variables
function init() {

}
//load assets
function preload() {
    this.load.image("blue-clouds", "assets/blue-clouds.png");
    this.load.image("white-clouds", "assets/white-clouds.png");
    this.load.image("white-small-clouds", "assets/white-small.png");
    this.load.atlas("plane", "assets/planeX.png", "assets/planeX.json");
    this.load.spritesheet("explosion", "assets/explosion.png", { frameWidth: 512, frameHeight: 512 });
    this.load.image("coin", "assets/coin.png");
    this.load.image("obstacle", "assets/obstacle.png");
}

//create game
function create() {
    blueClouds = this.add.image(640, 360, "blue-clouds");
    whiteClouds = this.add.tileSprite(640, 360, 1280, 720, "white-clouds");
    whiteCloudSmall = this.add.tileSprite(640, 360, 1280, 720, "white-small-clouds");

    scoreText = this.add.text(
        10,
        10,
        "SCORE: 0",
        {
            fontSize: 40,
            color: "#000000",
            fontStyle: "bold",
            backgroundColor: "#EEEEEE",
            padding: 10
        }
    );
    scoreText.setDepth(1);

    this.anims.create({
        key: "fly",
        frameRate: 7,
        frames: this.anims.generateFrameNames("plane", {
            prefix: "plane",
            suffix: ".png",
            start: 1,
            end: 4,
            zeroPad: 1
        }),
        repeat: -1
    });

    this.anims.create({
        key: "explosion",
        frameRate: 7,
        frames: this.anims.generateFrameNames("plane", {
            prefix: "smoke",
            suffix: ".png",
            start: 1,
            end: 4,
            zeroPad: 1
        }),
        repeat: 2
    });


    plane = this.physics.add.sprite(100, 360, "plane");
    plane.setDepth(1);
    plane.setScale(0.25);
    plane.setData("score", 0);
    plane.setData("position", 1);
    plane.play("fly");

    coinGroup = this.physics.add.group({
        defaultKey: "coin",
        maxSize: 10,
        visible: false,
        active: false
    });
    obstacleGroup = this.physics.add.group({
        defaultKey: "obstacle",
        maxSize: 10,
        visible: false,
        active: false
    });

    this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            let coinPosition = Math.floor(Math.random() * 3);
            if (coinTime == true) {
                coinGroup.get(1300, positionsY[coinPosition])
                    .setActive(true)
                    .setVisible(true)
                    .setScale(0.15);
            } else {
                let obstacleCount = Math.floor(Math.random() * 2) + 1;
                for (let i = 0; i < obstacleCount; i++) {
                    let obstaclePosition = Math.floor(Math.random() * 3);
                    obstacleGroup.get(1300, positionsY[obstaclePosition])
                        .setActive(true)
                        .setVisible(true)
                        .setScale(0.3);
                }
            }
            coinTime = !coinTime;
        }
    });


    this.physics.add.collider(plane, coinGroup, function(plane, coin) {
        if (coin.active && plane.anims.getName() != "explosion") {
            coinGroup.killAndHide(coin);
            let score = plane.getData("score");
            score++;
            plane.setData("score", score);
            scoreText.setText("SCORE: " + score);
        }
    });

    this.physics.add.collider(plane, obstacleGroup, function(plane, obstacle) {
        if (plane.anims.getName() != "explosion") {
            plane.play("explosion");
            plane.on('animationcomplete', () => {
                plane.destroy();
                this.scene.restart();
            });
        }
    }, null, this);
}

//update action
function update() {
    whiteClouds.tilePositionX += 0.5;
    whiteCloudSmall.tilePositionX += 0.25;
    coinGroup.incX(-3);
    obstacleGroup.incX(-3);

    coinGroup.getChildren().forEach(coin => {
        if (coin.active && coin.x < 0) {
            coinGroup.killAndHide(coin);
        }
    });
    obstacleGroup.getChildren().forEach(obstacle => {
        if (obstacle.active && obstacle.x < 0) {
            obstacleGroup.killAndHide(obstacle);
        }
    });

    if (this.input.activePointer.isDown) {
        let position = this.input.activePointer.position;
        let distancesY = positionsY.map(positionY => {
            return Math.abs(positionY - position.y);
        });

        let min = distancesY.indexOf(Math.min.apply(Math, distancesY));
        plane.setData("position", min);

    }
    if (plane.y > positionsY[plane.getData("position")]) {
        plane.y -= 6;
    } else if (plane.y < positionsY[plane.getData("position")]) {
        plane.y += 6;
    }
    if (Math.abs(plane.y - positionsY[plane.getData("position")]) <= 10) {
        plane.y = positionsY[plane.getData("position")];
    }

}
