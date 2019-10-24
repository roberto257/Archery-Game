//Configurations for the physics engine
var physicsConfig = {
    default: 'matter',
    matter : {
        debug: true, //CHANGE THIS TO TRUE TO SEE LINES
        debugShowVelocity : true
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

//Declare skater variable so we can access it in all functions
var skater;

function preload() {
    //Images
    this.load.image('sky', 'archery_assets/images/sky.png');

    //Load sprites from TexturePacker
    this.load.atlas('sheet', 'skate_assets/sprites.png', 'skate_assets/sprites.json');
    //Load body shapes from PhysicsEditor
    this.load.json('shapes', 'skate_assets/spritesPE.json');
}

function create() {

    //Background
    skyImg = this.add.image(600, 300, 'sky');
    //Scale the images
    skyImg.setDisplaySize(1200, 600);

    //Get the hitboxes
    var shapes = this.cache.json.get('shapes');
    
    //Set world bounds    
    this.matter.world.setBounds(0, 0, 1200, 600);

    //Place ground object
    var ground = this.matter.add.sprite(0, 0, 'sheet', 'ground', {shape: shapes.ground});
    //Ground is 600x600, so double the x pixels and we get screen width
    ground.setScale(2, 1);
    ground.setPosition(300 + ground.centerOfMass.x, 150 + ground.centerOfMass.y);

    //Place the first ramp
    var upRamp = this.matter.add.sprite(0, 0, 'sheet', 'up_ramp', {shape: shapes.up_ramp});
    upRamp.setPosition(600 + upRamp.centerOfMass.x, 125  + upRamp.centerOfMass.y);

    //Create the skater
    skater = this.matter.add.sprite(0, 0, 'sheet', 'roll/0001', {shape: shapes.s0001});
    skater.setPosition(100 + skater.centerOfMass.x, 200 + skater.centerOfMass.y);

    //Roll animation
    //Generate the frame names
    var rollFrameNames = this.anims.generateFrameNames(
        'sheet', {start: 1, end: 4, zeroPad: 4,
        prefix: 'roll/'}
    );
    //Create the animation
    this.anims.create({
        key: 'roll', frames: rollFrameNames, frameRate: 16, repeat: -1
    });

    //Push animation
    var pushFrameNames = this.anims.generateFrameNames(
        'sheet', {start: 5, end: 8, zeroPad: 4,
        prefix: 'push/'}
    );
    this.anims.create({
        key: 'push', frames: pushFrameNames, frameRate: 16, repeat: 0 
    });

    //Input
    this.cursors = this.input.keyboard.createCursorKeys();

    //Spacebar
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
}

function update() {

    //Set variable for player movement
    var pushSpeed = 0;

    if (this.spacebar.isDown) {
        //Increase speed
        pushSpeed += 10;

        //Move player
        skater.setVelocityX(pushSpeed);

    }
    /*
    do {
        //Play roll animation
        skater.anims.play('push');
    }
    while 
    */

}   