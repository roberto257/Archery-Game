//Start button for the archery game
var startButton = document.querySelector("#startSoccer").addEventListener("click", () => {
    //Delay in ms for our remove start button
    let removeDelay = 1;
    //Call the function to start this game
    this.startSoccerGame();
    //Call the setTimeout method and then define a function
    setTimeout(function () {
        //Get elements and remove them to clear the page
        document.getElementById('startArch').remove();
        document.getElementById('startSkate').remove();
        document.getElementById('startSoccer').remove();
        document.getElementById('logo').remove();
        //Pass the delay next
    }, removeDelay);
});

startSoccerGame = () => {
    //Configurations for the physics engine
    var physicsConfig = {
        default: 'matter',
        matter: {
            gravity: {
                x: 0,
                y: 0 //We want gravity turned off for now
            },
            debug: false //CHANGE THIS TO TRUE TO SEE LINES
        }
    }

    //Game width and height
    let gameWidth = 1200;
    let gameHeight = 700;

    //Configurations for the game itself
    var config = {
        type: Phaser.AUTO,
        width: gameWidth,
        height: gameHeight,
        physics: physicsConfig,
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    //Variables for the entire game
    var sky;
    var ground;
    var ball;
    
    //Pieces of the goal
    var leftPost;
    var rightPost
    var crossbar;
    var net;

    //This is the meter above the goal that will decide the shot's direction (left to right)
    var topMeter;
    //Meter that will decide up or down
    var sideMeter;

    //Start game
    var game = new Phaser.Game(config);

    function preload() {
        //Images
        this.load.image('sky', 'soccer_assets/images/sky.png');
        this.load.image('grass', 'soccer_assets/images/grass.png');
        this.load.image('net', 'soccer_assets/images/goalnet.png')
        this.load.image('topMeter', 'soccer_assets/images/topmeter.png');

        //Load sprites from TexturePacker
        this.load.atlas('sheet', 'soccer_assets/soccer.png', 'soccer_assets/soccer.json');

        //Load hitboxes from PhysicsEditor
        this.load.json('shapes', 'soccer_assets/spritesPE.json');
    }

    function create() {
        //Background
        sky = this.add.image((gameWidth/2), (gameHeight/2), 'sky');
        ground = this.add.image((gameWidth/2), 595, 'grass');

        //Scale to fit the screen
        sky.setDisplaySize(gameWidth, gameHeight);

        //Get the hitboxes from the JSON file
        var shapes = this.cache.json.get('shapes');

        //Set the boundaries of the physics engine
        this.matter.world.setBounds(0, 0, gameWidth, 700);

        //Add our goal, which we will have to piece together
        net = this.add.image(600, 378, 'net');
        leftPost = this.matter.add.sprite(300, 380, 'sheet', 'leftpost', {shape: shapes.leftpost});
        rightPost = this.matter.add.sprite(900, 380, 'sheet', 'rightpost', {shape: shapes.rightpost});
        crossbar = this.matter.add.sprite(600, 265, 'sheet', 'crossbar', {shape: shapes.crossbar});
        
        //Place the ball`
        ball = this.matter.add.sprite(597, 535, 'sheet', 'ball', {shape: shapes.ball});
        ball.setBounce(0, 0);

        //Add our player
        player = this.matter.add.sprite(360, 670, 'sheet', 'player', {shape: shapes.player});

        //This will be our meter to aim the shot left or right
        topMeter = this.matter.add.sprite(600, 200, 'sheet', '0001');
        //Generate frames for the bars animation
        var topbarFrameNames = this.anims.generateFrameNames(
            'sheet', {start: 1, end: 15, zeroPad: 4}
        );
        //Create an animation for it
        this.anims.create({
            key: 'bar', frames: topbarFrameNames, frameRate: 4, repeat: -1, yoyo: true
        });
        //Call the animation
        topMeter.anims.play('bar');

        //Meter to aim the shot up or down
        sideMeter = this.matter.add.sprite(975, 380, 'sheet', '0016');
        sideMeter.setScale(2, 1.1);
        //Generate frame names for the animation
        var sidebarFrameNames = this.anims.generateFrameNames(
            'sheet', {start: 16, end: 30, zeroPad: 4}
        );
        //Create animation
        this.anims.create({
            key: 'sideBar', frames: sidebarFrameNames, frameRate: 4, repeat: -1, yoyo: true
        });
        //Call the animation
        sideMeter.anims.play('sideBar');

        //Get input for the spacebar
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        //Input for arrowkeys
        this.WASDKeys = this.input.keyboard.addKeys({
            W: 'W',
            A: 'A',
            S: 'S',
            D: 'D'
        }); 
    }

    //Variables to make sure both bars are stopped before we kick, need to be declared outside of the update() function
    var topBarStopped = false;
    var sideBarStopped = false;

    function update() {
        //Declare variable for the power of the kick
        var kickY;
        var kickX;

        //Variables to get the current frame of animation, and pass it through the function to get the power
        var topFrame;  
        var sideFrame;

        /* These objects will be searched through later to get the power of the kick. We will pass the index
        of the frame we were are stopped on, and get a value for the kicks X or Y velocity */
        const powerMapX = {
            15: -30, 14: -24, 13: -21, 12: -19, 11: -17.5, 10: -8,
            9: -4, 8: 0, 7: 4, 6: 8, 5: 17.5, 4: 19, 3: 21, 2: 24, 1: 30
        };
        const powerMapY = {
            1: -30, 2: -25, 3: -22, 4: -20.5, 5: -19, 6: -18.25, 7: -17.875, 8: -17.5, 
            9: -17.125, 10: -16.75, 11: -16, 12: -14.5, 13: -13, 14: -10, 15: -5,
        };

        //Top bar
        if (Phaser.Input.Keyboard.JustDown(this.WASDKeys.W)) {
            //Then pause the animation AT THE CURRENT FRAME
            topMeter.anims.pause(topMeter.anims.currentFrame);
            topBarStopped = true;
        }

        //Side bar
        if (Phaser.Input.Keyboard.JustDown(this.WASDKeys.D)) {
            //Then pause the animation AT THE CURRENT FRAME
            sideMeter.anims.pause(sideMeter.anims.currentFrame);
            sideBarStopped = true;
        }

        //Function to search our "dictionary" for the corresponding power value to aim it
        function getPower (obj, key) {
            if (obj.hasOwnProperty(key)) {
                return obj[key];
            }
        };

        //Kicking
        if (Phaser.Input.Keyboard.JustDown(this.WASDKeys.S) && (sideBarStopped && topBarStopped)) {
            //Get the current frames of animation so we can pass them through our function from earlier
            sideFrame = sideMeter.anims.currentFrame.index;
            topFrame = topMeter.anims.currentFrame.index;
            
            //Pass those variables through the function
            var kickX = getPower(powerMapX, topFrame);
            var kickY = getPower(powerMapY, sideFrame);

            //Kick the ball
            ball.setVelocity(kickX, kickY);
        }
    }
} 
