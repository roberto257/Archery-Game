//Start button for the archery game
var startButton = document.querySelector("#startArch").addEventListener("click", () => {
    //Delay in ms for our remove start button
    let removeDelay = 1;
    //Call the function to start this game
    this.startArchGame();
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

//Function to start the game when the button is clicked
startArchGame = () => {

    //Configurations for the physics engine
    var physicsConfig = {
        default: 'arcade',
        arcade: {
            debug: false //CHANGE THIS TO TRUE TO SEE LINES
        }
    }

    //Variables for the game's height and width
    var gameHeight = 600;
    var gameWidth = 1200

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

    //Declare variables for the score (used later)
    let score = 0;
    let scoreBoard;

    //Declare a modifier for modifying the firing angle 
    var angleModifier = (Math.random() + .1) * 2;

    //Start the game
    var game = new Phaser.Game(config);

    function preload ()
    {   
        //Images
        this.load.image('sky', 'archery_assets/images/sky.png');
        this.load.image('target', 'archery_assets/images/target.png');
        this.load.image('ground', 'archery_assets/images/ground.png');
        this.load.image('arrow', 'archery_assets/images/arrow.png');
        this.load.image('gold_medal', 'archery_assets/images/goldmedal.png');
        this.load.image('silver_medal', 'archery_assets/images/silvermedal.png');
        this.load.image('bronze_medal', 'archery_assets/images/bronzemedal.png');
        this.load.image('no_medal', 'archery_assets/images/nomedal.png');
        //Spritesheets
        this.load.spritesheet('archer', 'archery_assets/spritesheets/archer_sprites.png', {frameWidth: 128, frameHeight: 128});
        this.load.spritesheet('rings', 'archery_assets/spritesheets/rings_sprite.png', {frameWidth: 320, frameHeight: 320});
        //Audio
        this.load.audio('arrow_shot', 'archery_assets/sounds/arrow_shooting.mp3');
    }

    //Define the target here as we will be using it quite a bit
    let target;

    function create ()
    {   
        //Define the background as a variable
        sky = this.add.image(600, 300, 'sky');
        //Change background size to fit
        sky.setDisplaySize(gameWidth, gameHeight);
        
        //Add the ground
        ground = this.add.image(600, 200, 'ground');
        //Scale the ground
        ground.setScale(2, 1);

        //Create the archer/player
        this.player = this.physics.add.sprite(100, 410, 'archer');
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        //Shooting animation
        this.anims.create({
            key: 'shoot',
            frames: this.anims.generateFrameNumbers('archer', {start : 0, end: 4}),
            frameRate: 20,
            repeat: 0
        });

        //Rings animation
        this.anims.create({
            key: 'rings_anim',
            frames: this.anims.generateFrameNumbers('rings', {start : 0, end : 69}),
            frameRate: 10,
            repeat: 0
        })
        //Play the animation on start
        this.rings = this.physics.add.sprite(300, 40, 'rings');
        this.rings.anims.play('rings_anim', true);

        //Create the target
        target = this.physics.add.sprite(530, 365, 'target');
        target.setSize(115, 95).setOffset(70, 130); //TARGET HITBOX
        target.enableBody = true;
        target.setImmovable();

        //Create an array for arrows for later
        this.arrows = [];

        //Get keypresses
        this.cursors = this.input.keyboard.createCursorKeys();
        //Assign input for spacebar
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        //Play sound when the arrow is shot
        this.arrowSound = this.sound.add('arrow_shot');

        //Make the arrows collide with the target
        this.physics.add.collider(this.arrows, target)

        //Add the scoreboard in
        scoreBoard = this.add.text(550, 40, "SCORE: 0", {fontSize: '64px', fill: '#fff'});
    }

    function update ()
    {   
        //Declare constants for movement
        const arrowMoveAmt = 1500;
        this.player.setDrag(2000);

        //Rotation of the player
        if (this.cursors.up.isDown && this.player.angle > -45) {
            this.player.angle -= angleModifier;}

        if (this.cursors.down.isDown && this.player.angle < 0) {
            this.player.angle += angleModifier;}
        
        //Shooting with the spacebar
        if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {

            //Animate the shooting
            this.player.anims.play('shoot', true);

            //Arrow shooting
            let arrow = this.physics.add.sprite(this.player.x, (this.player.y + 20), 'arrow');

            //Make sure the arrow has a hitbox
            arrow.enableBody = true;
            //Let the arrow move
            arrow.body.immovable = false;
            //Edit arrow hitbox 
            arrow.setSize(50, 15).setOffset(5, 50);

            arrow.setGravityY(3600); //Gravity will affect the arrows
            //Arrow speeds
            arrow.setVelocityX(arrowMoveAmt);
            arrow.setVelocityY((this.player.angle * 50));

            this.arrows.push(arrow); //Add arrow to the array created earlier

            this.arrowSound.play(); //Play the sound

            //Reset the angle modifier for added difficulty
            angleModifier = (Math.random() + .1) * 2;
        }

        else if(target.body.touching.left) {

            //Variable for loop
            let i = 0;

            //Set initial position of new medals
            let firstMedalX = 180;

            //Loop to create multiple arrows
            while (i < this.arrows.length) {
                newArrows = this.arrows[i];
                newArrows.setGravityY(0);
                newArrows.setVelocityX(0);
                newArrows.setVelocityY(0);

                //Add 30 to the new medal's x position
                firstMedalX += 40;

                //Increment for every arrow shot
                i++;

                //Reset the player angle for difficulty
                this.player.angle = 0;

                //Get new arrow's x value
                newArrows.x += 10;
            }
            target.x += 10;

            //Call the function to determine medal and pass the variable
            if(this.arrows.length <= 5) {
                //Only track the first five arrows
                getMedal(firstMedalX);
            }
        }

        //Function to decide medal, and where it goes
        getMedal = (value) => {
            //Gold medal
            if (410 < newArrows.y && newArrows.y < 435) {
                this.add.image(value, 175, 'gold_medal');
                score += 5;
            }
            //Silver medal
            else if (395 < newArrows.y && newArrows.y < 450) {
                this.add.image(value, 175, 'silver_medal');
                score += 3;
            }
            //Bronze medal
            else if (380 < newArrows.y && newArrows.y < 460) {
                this.add.image(value, 175, 'bronze_medal');
                score += 1;
            }
            else {
                this.add.image(value, 175, 'no_medal');
            }
            //Set the scoreboard to the new score
            scoreBoard.setText('SCORE: ' + score);
        }
    }
}
