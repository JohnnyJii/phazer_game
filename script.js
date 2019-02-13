let config = {
    type: Phaser.AUTO,
    parent: 'phaser',
    width: 800,
    height: 600,
    pixelArt: true,
    zoom: 2,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        render: render
    }
};

let player;
let stars;
let bombs;
let platforms;
let cursors;
let score = 0;
let scoreText;
let gameOver = false;

let game = new Phaser.Game(config);

game.CONFIG = {
    width: config.width,
    height: config.height,
    centerX: Math.round(0.5 * config.width),
    centerY: Math.round(0.5 * config.height)
};

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', {frameWidth: 32, frameHeight: 48}
    );
    //skaalaus koko näytölle
    game.scale.scalemode = Phaser.ScaleManager.SHOW_ALL;
    game.scle.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

    game.load
}

function create() {
    //koko näyttö mobiileille
    if (!game.device.desktop) {
        game.input.onDown.add(gofull, this);
    }
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //Mobiili kontrollit
    // hyppynappi
    jumpButton = game.aa.button(600, 500, 'jumpButton', null, this, 0, 1, 0, 1);
    jumpButton.fixedToCamera = true;
    jumpButton.events.onInputOver.add(function () {
        jump = true;
    });
    jumpButton.events.onInputOut.add(function () {
        jump = false;
    });
    jumpButton.events.onInputDown.add(function () {
        jump = true;
    });
    jumpButton.events.onInputUp.add(function () {
        jump = false;
    });

    //vasen nappi
    leftButton = game.add.button(0, 472, 'buttonhorizontal', null, this, 0, 1, 0, 1);
    leftButton.fixedToCamera = true;
    leftButton.events.onInputOver.add(function () {
        left = true;
    });
    leftButton.events.onInputOut.add(function () {
        left = false;
    });
    leftButton.events.onInputDown.add(function () {
        left = true;
    });
    leftButton.events.onInputUp.add(function () {
        left = false;
    });

    //oikea nappi
    rightButton = game.add.button(160, 472, 'buttonhorizontal', null, this, 0, 1, 0, 1);
    rightButton.fixedToCamera = true;
    rightButton.events.onInputOver.add(function () {
        right = true;
    });
    rightButton.events.onInputOut.add(function () {
        right = false;
    });
    rightButton.events.onInputDown.add(function () {
        right = true;
    });
    rightButton.events.onInputUp.add(function () {
        right = false;
    });


    //Näpppäimistö kontrollit
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [{key: 'dude', frame: 4}],
        frameRate: 20
    });
    this.anims.create({
        key: 'turn',
        frames: [{key: 'dude', frame: 4}],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
        frameRate: 10,
        repeat: -1
    });
    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {x: 12, y: 0, stepX: 70}
    });
    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    bombs = this.physics.add.group();

    scoreText = this.add.text(16, 16, 'score: 0', {fontSize: '32px', fill: '#000'});

    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);

}

function render() {
    game.debug.text('jump:' + jump +  'left:' + left + ' right:' + right, 20, 20);
}

function resize() {
    let game_ratio = (800) / (600);
    let div = document.getElementById('phaser');
    div.style.width = (window.innerHeight * game_ratio) + 'px';
    div.style.height = window.innerHeight + 'px';

    let canvas = document.getElementsByTagName('canvas')[0];
    let dpi_w = (parseInt(div.style.width) / canvas.width);
    let dpi_h = (parseInt(div.style.height) / canvas.height);
    let height = window.innerHeight * (dpi_w / dpi_h);
    let width = height * game_ratio;

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

}


window.addEventListener('resize', resize);
resize();


//ohjaimet näppikselle//

function update() {
    if (gameOver) {
        return;
    }
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }
}

function mobile() {
    if (left) {
        player.scale.x = -1;
        player.body.moveLeft(500);
        player.animations.play('walk');
    } else if (right) {
        player.scale.x = 1;
        player.body.moveRight(500);
        player.animations.play('walk');
    } else {
        player.loadTexture('dude', 0);
    }
    if (jump) {
        jump_now();
        player.loadTexture('dude', 5);
    }
    if (game.input.currentPointers == 0 && !game.input.activePointer.isMouse) {
        right = false;
        left = false;
        jump = false;
    }
};


function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        let bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    }
}

function hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');

    gameOver = true;

}