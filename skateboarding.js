//Configurations for the physics engine
var physicsConfig = {
    default: 'matter',
    matter : {
        debug: false //CHANGE THIS TO TRUE TO SEE LINES
    }   
}

//Game configurations
var config = {
    type: Phaser.AUTO,
    width: 1500 ,
    height: 900,
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
    skyImg = this.add.image(750, 450, 'sky');
    //Scale the images
    skyImg.setDisplaySize(1500, 900);

    //Get the hitboxes
    var shapes = this.cache.json.get('shapes');
    
    //Set world bounds    
    this.matter.world.setBounds(0, 0, 1500, 900);

    //Place ground object
    var ground = this.matter.add.sprite(0, 0, 'sheet', 'ground', {shape: shapes.ground});
    //Ground is 600x600, so double the x pixels and we get screen width
    ground.setScale(2.5, 1);
    ground.setPosition(450  + ground.centerOfMass.x, 300 + ground.centerOfMass.y);

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

    //This keeps the rolling animation going once the push animation is done
    skater.on('animationcomplete', () => {
        skater.anims.play('roll');
    });

    //Input
    this.cursors = this.input.keyboard.createCursorKeys();

    //Spacebar
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
}

function update() {

    //Set variable for player movement
    var pushSpeed = 0;
    var ollie = 0;

    if (this.cursors.right.isDown) {
        //Increase speed
        pushSpeed += 7.5;

        //Move player
        skater.setVelocityX(pushSpeed);

        //Play push animation
        skater.anims.play('push');
    }

    if (this.spacebar.isDown) {

        ollie += -8;

        skater.setVelocityY(ollie);
    }

    if (this.cursors.down.isDown) {
        //Play the shuvit animation
        skater.anims.play('shuv');
    }
}   