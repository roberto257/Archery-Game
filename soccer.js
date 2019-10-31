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
                y: 1 //We want gravity turned off for now
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
    
    var leftpost;
    var rightpost
    var crossbar;
    var net;


    //Start game
    var game = new Phaser.Game(config);

    function preload() {
        //Images
        this.load.image('sky', 'soccer_assets/images/sky.png');
        this.load.image('grass', 'soccer_assets/images/grass.png');
        this.load.image('net', 'soccer_assets/images/goalnet.png')


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
        this.matter.world.setBounds(0, 0, gameWidth, 650);

        //Add our goal, which we will have to piece together
        net = this.add.image(600, 378, 'net');
        leftpost = this.matter.add.sprite(300, 380, 'sheet', 'leftpost', {shape: shapes.leftpost});
        rightpost = this.matter.add.sprite(900, 380, 'sheet', 'rightpost', {shape: shapes.rightpost});
        crossbar = this.matter.add.sprite(600, 265, 'sheet', 'crossbar', {shape: shapes.crossbar});

        //Place the ball`
        ball = this.matter.add.sprite(597, 535, 'sheet', 'ball', {shape: shapes.ball});
        ball.setBounce(0.9, 0.9);

        //Add our player
        player = this.matter.add.sprite(360, 600, 'sheet', 'player', {shape: shapes.player});

        //Get input for the spacebar
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //Input for arrowkeys
        this.arrowKeys = this.input.keyboard.addKeys({
            up: 'up',
            down: 'down',
            left: 'left',
            right: 'right'
        }); 
    }

    function update() {
        var move = -20;
        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
            ball.setVelocityY(move);
        }
        if (Phaser.Input.Keyboard.JustDown(this.arrowKeys.left)) {
            ball.setVelocityX(move);
        }
        if (Phaser.Input.Keyboard.JustDown(this.arrowKeys.right)) {
            ball.setVelocityX(-move);
        }
    }
} 
