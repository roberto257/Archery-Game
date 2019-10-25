//Configurations for the physics engine
var physicsConfig = {
    default: 'matter',
    matter : {
        gravity: {
            x: 0,
            y: 2.5, // <--This is the only way I could get the skater to roll up the ramp.
        },
        debug: false //CHANGE THIS TO TRUE TO SEE LINES
    }   
}

//Variables for height and width
var gameHeight = 900;
var gameWidth = 3000;

//Game configurations
var config = {
    type: Phaser.AUTO,
    width: 1500, //<-- this is the width of what we will see at one time
    height: gameHeight,
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

//Declare variable for the sky background
var sky;

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
    sky = this.add.image(1500, 450,'sky')
    //Scale the image
    sky.setDisplaySize(gameWidth, gameHeight);

    //Get the hitboxes
    var shapes = this.cache.json.get('shapes');
    
    //Set world bounds    
    this.matter.world.setBounds(0, 0, gameWidth, gameHeight);

    //Place ground object
    var ground = this.matter.add.sprite(0, 0, 'sheet', 'ground', {shape: shapes.ground});
    //Ground is 600x600, so double the x pixels and we get screen width
    ground.setScale(5, 1);
    ground.setPosition(1500, 810);

    //Place the ramp
    var ramp = this.matter.add.sprite(0, 0, 'sheet', 'ramp', {shape: shapes.ramp});
    ramp.setPosition(500 + ramp.centerOfMass.x, 410  + ramp.centerOfMass.y);

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

    //Shuvit animation
    var shuvFrameNames = this.anims.generateFrameNames(
        'sheet', {start: 9, end: 12, zeroPad: 4,
        prefix: 'shuv/'}
    );
    this.anims.create({
        key: 'shuv', frames: shuvFrameNames, frameRate: 24, repeat: 0 
    });

    //Ollie animation
    var ollieFrameNames = this.anims.generateFrameNames(
        'sheet', {start: 13, end: 20, zeroPad: 4,
        prefix: 'ollie/'}
    );
    this.anims.create({
        key: 'ollie', frames: ollieFrameNames, frameRate: 24, repeat: 0
    });

    //This keeps the rolling animation going once the push animation is done
    skater.on('animationcomplete', () => {
        skater.anims.play('roll');
    });

    //Input for arrowkeys
    this.arrowKeys = this.input.keyboard.addKeys({
        up: 'up',
        down: 'down',
        left: 'left',
        right: 'right'
    }); 

    //Spacebar
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    //Camera to follow the skater
    this.cameras.main.setBounds(0, 0, 3000, gameHeight);
    this.cameras.main.startFollow(skater);
    
}

function update() {
    //Set variable for player movement
    var pushSpeed = 0;
    var ollie = 0;

    //Push
    if (this.arrowKeys.right.isDown && skater.angle > -60 && skater.angle < 60) {
        //Increase speed
        pushSpeed += 7;

        //Move player
        skater.setVelocityX(pushSpeed);

        //Play push animation
        skater.anims.play('push');
    }

    //Ollie
    if (this.spacebar.isDown && skater.y > 461) {
        //Play the ollie animation
        skater.anims.play('ollie');

        //Set ollie power
        ollie += -10;

        //Set skate velocity
        skater.setVelocityY(ollie);
    }

    //Shuvit
    if (this.arrowKeys.down.isDown) {
        //Play the shuvit animation
        skater.anims.play('shuv');
    }

    //Tilting backwards in the air
    if (this.arrowKeys.left.isDown && skater.y < 635) {
        //Be able to turn backwards so you don't flip
        skater.angle -= 5;
    }
}   