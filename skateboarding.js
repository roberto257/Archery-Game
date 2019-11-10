//Define our start button for out index page
var startButton = document.querySelector("#startSkate").addEventListener("click", () => {
    //Delay in ms to remove our button
    let removeDelay = 1;
    //Call function to start the game
    this.startSkateGame();
    //Call the setTimeout method and define a function
    setTimeout(function () {
        //Get elements and remove them to clear the page
        document.getElementById('startArch').remove();
        document.getElementById('startSkate').remove();
        document.getElementById('startSoccer').remove();
        document.getElementById('logo').remove();
        //Pass the delay
    }, removeDelay);
});

//Define the function that we call when our start button is clicked
startSkateGame = () => {

    //Configurations for the physics engine
    var physicsConfig = {
    default: 'matter',
    matter : {
        gravity: {
            x: 0,
            y: 2.5, // <--This is the only way I could get the skater to roll up the ramp.s
        },
        debug: false  //CHANGE THIS TO TRUE TO SEE LINES
        }   
    };

    //Variables for height and width
    var gameHeight = 750;
    var gameWidth = 5000;

    //Game configurations
    var config = {
    type: Phaser.AUTO,
    width: 1500, //<-- this is the width of what we will see at one time
    height: gameHeight,
    physics: physicsConfig,
    //We will use a plugin to help us detect collisions
    plugins: {
        scene: [
            {  
                plugin: PhaserMatterCollisionPlugin,
                key: "matterCollision",
                mapping: "matterCollision"
            }
        ]
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }   
    };

    /* This variable will be used to make sure the skater 
    cannot ollie while he is already in the air */
    var canOllie;
    var grind;

    //Start the game
    var game = new Phaser.Game(config);

    //Declare variables so we can access them in all functions
    var skater;
    var ground;
    var sky;
    var bench;

    //Score variables
    let score = 0;
    let scoreBoard;

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
    sky = this.add.image(2500, 325,'sky');
    //Scale the image
    sky.setDisplaySize(gameWidth, gameHeight);

    //Get the hitboxes
    var shapes = this.cache.json.get('shapes');

    //Set world bounds    
    this.matter.world.setBounds(0, 0, gameWidth, gameHeight);

    //Place ground object
    ground = this.matter.add.sprite(0, 0, 'sheet', 'ground', {shape: shapes.ground});
    //Ground is 600x600, so double the x pixels and we get screen width
    ground.setScale(8.5, 1);
    ground.setPosition(2500, 650);
    //Let the ground detect collisions 
    ground.isSensor(true);

    //Place the ramp
    var ramp = this.matter.add.sprite(0, 0, 'sheet', 'ramp', {shape: shapes.ramp});
    ramp.setPosition(550 + ramp.centerOfMass.x, 250 + ramp.centerOfMass.y);

    //Place a bench
    bench = this.matter.add.sprite(2000, 200, 'sheet', 'bench', {shapes: shapes.bench});
    bench.setScale(2, 1);
    bench.setPosition(2250 + bench.centerOfMass.x, 500 + bench.centerOfMass.y);
    //Needed this again so that bench can detect collisions
    bench.isSensor(true);
    //This makes sure it doesn't move
    bench.body.isStatic = true;

    //Create the skater
    skater = this.matter.add.sprite(0, 0, 'sheet', 'roll/0001', {shape: shapes.s0001});
    skater.setPosition(100 + skater.centerOfMass.x, 200 + skater.centerOfMass.y);

    //Collision filtering
    var staticCategory = this.matter.world.nextCategory();
    ramp.setCollisionCategory(staticCategory);
    ground.setCollisionCategory(staticCategory);
    bench.setCollisionCategory(staticCategory);

    //Skater needs to be in a different category
    var skaterCategory = this.matter.world.nextCategory();
    skater.setCollisionCategory(skaterCategory);

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
        key: 'shuv', frames: shuvFrameNames, frameRate: 32, repeat: 0 
    });

    //Ollie animation
    var ollieFrameNames = this.anims.generateFrameNames(
        'sheet', {start: 13, end: 20, zeroPad: 4,
        prefix: 'ollie/'}
    );
    this.anims.create({
        key: 'ollie', frames: ollieFrameNames, frameRate: 24, repeat: 0
    });

    //Kickflip animation
    var kfFrameNames = this.anims.generateFrameNames(
        'sheet', {start: 21, end: 33, zeroPad: 4,
        prefix: 'kickflip/'}
    );
    this.anims.create({
        key: 'kickflip', frames: kfFrameNames, frameRate: 24, repeat: 0
    });

    //Nosegrind  animation
    var ngFrameNames = this.anims.generateFrameNames(
        'sheet', {start: 34, end: 37, zeroPad: 4,
        prefix: 'nosegrind/'}
    );
    this.anims.create({
        key: 'nosegrind', frames: ngFrameNames, frameRate: 24, repeat: 0
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

    //Input for WASD keys
    this.WASDkeys = this.input.keyboard.addKeys({
        W: 'W',
        A: 'A',
        S: 'S',
        D: 'D'
    });

    //Spacebar
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    //Camera to follow the skater
    this.cameras.main.setBounds(0, 0, gameWidth, gameHeight);
    this.cameras.main.startFollow(skater);

    //Detect the player's collision with the ground and the ramp
    this.matterCollision.addOnCollideStart({
        objectA: skater,
        objectB: [ground, ramp],
        callback: () => {
            canOllie = true;
            grind = false;
        }
    });

    //TODO - BUG: Need to only detect collisions when we are on top of the rail.
    //Detect collision when we are on the bench, so we can play the grind animation
    this.matterCollision.addOnCollideStart({
        objectA: skater,
        objectB: bench,
        callback: () => {
            canOllie = false;
            grind = true;
        }
    });

    //Create the scoreboard as a container
    scoreBoard = this.add.container(10, 50);
    //Add text to this container, displaying our score
    scoreText = this.add.text(10, 50, "SCORE: 0", {fontSize: '56px', color: '#fff'});

    //Add the text to the container which will be our scoreboard
    scoreBoard.add(scoreText);

    //Make the scoreboard follow the player
    this.tweens.add({
        targets: scoreBoard,
        ease: 'Linear',
        duration: 1,
        delay: 1,
        yoyo: false,
        repeat: -1
    });

    }

    function update() {
    //Set variable for player movement
    var pushSpeed = 0;
    var ollie = 0;

    //Make sure the player isn't doing anything if he's upside down, or crashed
    let skaterCrashed;

    //Variable to check the angle of the skater
    let angleOkay = skater.angle > -89 && skater.angle < 89;

    //Determine if the player is crashed or not
    if (angleOkay) {
        skaterCrashed = false;
    }

    //canOllie is used as a parameter because if the skater is sideways in the air, he is not crashed yet
    else if ((!(angleOkay || canOllie)) && canOllie) {
        skaterCrashed = true;
        window.alert("You crashed!");
    }

    //Starting parameter, as we don't want to do anything if we are crashed
    if (!skaterCrashed) {
        //Pushing
        if (Phaser.Input.Keyboard.JustDown(this.spacebar) && canOllie) {
            //Increase speed
            pushSpeed = 18;

            //Move player
            skater.setVelocityX(pushSpeed);

            //Play push animation
            skater.anims.play('push');
        }

        //Ollie
        if (Phaser.Input.Keyboard.JustDown(this.arrowKeys.up) && canOllie) {
            //Set this to false, because we are about to jump
            canOllie = false;

            grind = false;

            //Set ollie power
            ollie = -15;

            //Set skate velocity
            skater.setVelocityY(ollie);

            //Play the ollie animation
            skater.anims.play('ollie');

            //Scoring for ollie
            score += 1;
        }

        //Shuvit
        if (Phaser.Input.Keyboard.JustDown(this.arrowKeys.down)) {
            //Play the shuvit animation
            skater.anims.play('shuv');

            //Scoring for shuv
            score += 3;
        }

        //Kickflip
        if (Phaser.Input.Keyboard.JustDown(this.WASDkeys.W)  && canOllie) {
            //Reset variable since we are jumping
            canOllie = false;

            //Set jump height
            ollie = -14;

            //Move the player
            skater.setVelocityY(ollie);

            //Play animation
            skater.anims.play('kickflip');

            //Scoring for kickflip
            score += 10;
        }

        //Grind animation
        if (grind) {
            //Give a little speed boost
            skater.setVelocityX(15);
            //Set this to true so we can ollie out
            canOllie = true;
            //Play the animation
            skater.anims.play('nosegrind');

            //Increment the score while we are grinding
            score += 0.5;
            //Score will be rounded as it is displayed, because we don't want decimals
        }

        //Tilting backwards in the air
        if (this.arrowKeys.left.isDown && !canOllie) {
            //Be able to turn backwards so you don't flip
            skater.angle -= 3 ;
        }
        //Tilting forwards in the air
        if (this.arrowKeys.right.isDown && !canOllie) {
            //Be able to turn forwards so you don't flip
            skater.angle += 3 ;
        }
    }

    //Move the scoreboard
    scoreText.x = skater.body.position.x - 200;
    //Round the score when displayed
    scoreText.setText("SCORE : " + (Math.round(score)));
    }
};
    
