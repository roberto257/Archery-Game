//Configurations for the physics engine
var physicsConfig = {
    default: 'arcade',
    arcade : {
        debug : true  //CHANGE THIS TO TRUE TO SEE LINES
    }
}

//Game configurations
var config = {
    type: Phaser.AUTO,
    width: 1200 ,
    height: 600,
    physics: physicsConfig,
    scene: {
        preload: preload,
        create: create,
        update: update
    }   
}

//Start the game
var game = new Phaser.Game(config);

function preload() {
    //Images
    this.load.image('sky', 'archery_assets/images/sky.png');
    this.load.image('ground', 'skate_assets/images/ground.png');
    this.load.image('up_ramp', 'skate_assets/images/up_ramp.png')

    //Spritesheets
    this.load.spritesheet('player', 'skate_assets/spritesheets/skater.png', {frameWidth: 160, frameHeight: 160});

}

function create() {
    //Background
    skyImg = this.add.image(600, 300, 'sky');
    //Scale the images
    skyImg.setDisplaySize(1200, 600);
    groundImg = this.add.image(600, 600, 'ground');
    groundImg.setDisplaySize(1200, 250);

    //Create the player
    this.player = this.physics.add.sprite(100, 410, 'player');
    this.player.setCollideWorldBounds(true);

    //Rolling animation 
    this.anims.create({
        key: 'move',
        frames: this.anims.generateFrameNumbers('player', {start: 0, end: 3}),
        frameRate: 16,
        repeat: -1 // <-- keeps the rolling animation going
    });
    //Pushing animation
    this.anims.create({
        key: 'push',
        frames: this.anims.generateFrameNumbers('player', {start: 4, end: 8}),
        frameRate: 16
    });
    //Start and keep the rolling animation going
    this.player.anims.play('move', true);

    //Up ramp (1st ramp)
    this.upRamp = this.physics.add.sprite(700, 330, 'up_ramp');
    this.upRamp.setSize(320, 150).setOffset(0, 175);
    this.upRamp.enableBody = true;
    this.upRamp.setImmovable();

    //Input
    this.cursors = this.input.keyboard.createCursorKeys();

    //Spacebar
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.physics.add.collider(this.player, this.upRamp);
}


function update() {

    //Set variable for push speed
    var playerPushSpeed = 0;

    //If the spacebar is pressed 
    if (this.spacebar.isDown) {
        //Play the push animation
        this.player.anims.play('push', true);

        //Push speed
        playerPushSpeed += 175;

        //Move player
        this.player.setVelocityX(playerPushSpeed);   
    }

    if (this.upRamp.body.touching.left) {
        this.player.setVelocityY(-200);
    }
}