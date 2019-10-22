//Configurations for the physics engine
var physicsConfig = {
    default: 'arcade',
    arcade : {
        debug : false  //CHANGE THIS TO TRUE TO SEE LINES
    }
}

//Game configurations
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: physicsConfig,
    scene: {
        preload: preload,
        create: create,
        update: update,
        render: render
    }   
}

//Start the game
var game = new Phaser.Game(config);

function preload() {
    //Images
    this.load.image('sky', 'archery_assets/images/sky.png');
    this.load.image('ground', 'skate_assets/images/ground.png');

    //Spritesheets
    this.load.spritesheet('player', 'skate_assets/spritesheets/skater.png', {frameWidth: 160, frameHeight: 160});

}

function create() {
    //Background
    this.add.image(400, 300, 'sky');
    this.add.image(300, 600, 'ground');

    //Create the player
    this.player = this.physics.add.sprite(100, 410, 'player');
    this.player.setCollideWorldBounds(true);

    //Rolling animation
    this.anims.create({
        key: 'move',
        frames: this.anims.generateFrameNumbers('player', {start: 0, end: 3}),
        frameRate: 16,
        repeat: -1
    });
    this.player.anims.play('move', true);

}

function update() {

}

function render() {

}
