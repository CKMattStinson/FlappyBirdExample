const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 400,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let background;
let pipes;
let restartButton;
let score = 0;
let highScore = 0;
let scoreText;
let highScoreText;
let flySound;
let scoreSound;
let crashSound;
let music;

function preload() {
    // load assets
    this.load.image('player', 'assets/cat.png');
    this.load.image('background', 'assets/backgrounds/beach.png');
    this.load.image('top_pipe', 'assets/top_pipe.png');
    this.load.image('bottom_pipe', 'assets/bottom_pipe.png');
    this.load.image('restart_button', 'assets/restart_button.png');

    this.load.audio('flySound', 'assets/sounds/fly.wav');
    this.load.audio('scoreSound', 'assets/sounds/score.wav');
    this.load.audio('crashSound', 'assets/sounds/crash.wav');
    this.load.audio('music', 'assets/sounds/music.wav');
}

function create() {

    // Create the background as a tileSprite
    background = this.add.tileSprite(0, 0, 1200, 800, 'background');
    background.setScale(0.5);
    background.setOrigin(0, 0);
    
    // Create the player sprite at position (100, 300)
    player = this.physics.add.sprite(100, 300, 'player');

    // Set gravity for the player
    player.setGravityY(1000); 

    // Set the player's hitbox size
    player.setBodySize(10, 10, true);

    // Put the player in front of the pipes
    player.depth = 5;

    // Says whether the player is alive
    player.alive = true

    // Call the fly function when the mouse is clicked
    this.input.on('pointerdown', fly);

    // Group containing all the pipes
    pipes = this.physics.add.group();

    // Add a timer event to call spawnPipes 
    this.time.addEvent({
        delay: 1500,    // Time in milliseconds
        callback: spawnPipes,    // Function to call
        callbackScope: this,    // Scope to which the function belongs
        loop: true             // Continuous loop
    });

    // Enable collision between the player and pipes group
    this.physics.add.collider(player, pipes, gameOver, null, this);

    // Create the restart button and make it invisible
    restartButton = this.add.image(300, 200, 'restart_button').setOrigin(0.5, 0.5).setVisible(false);
    restartButton.setInteractive(); // Make it interactive
    // Add click event to the restart button
    restartButton.on('pointerdown', () => restartGame.call(this));
    restartButton.depth = 10;

    loadGame();
    
    // Create score text
    scoreText = this.add.text(16, 16, 'Score: ' + score, { fontSize: '32px', fill: '#000000' });

    // Create high score text
    highScoreText = this.add.text(16, 50, 'High Score: ' + highScore, { fontSize: '32px', fill: '#00000' });

    // Set text on top of everything
    scoreText.depth = 10;
    highScoreText.depth = 10;

    flySound = this.sound.add('flySound');
    scoreSound = this.sound.add('scoreSound');
    crashSound = this.sound.add('crashSound');
    music = this.sound.add('music');
    music.loop = true;
    music.play();
    
}

function spawnPipes() {
    const gap = Phaser.Math.Between(100, 200);
    const topPipeHeight = Phaser.Math.Between(50, 200);
    const bottomPipeHeight = 400 - gap - topPipeHeight;
    
    const topPipe = pipes.create(700, topPipeHeight, 'top_pipe');
    topPipe.setOrigin(0.5, 1);
    topPipe.passed = false; // Add passed property
    
    const bottomPipe = pipes.create(700, 400 - bottomPipeHeight, 'bottom_pipe');
    bottomPipe.setOrigin(0.5, 0);
    bottomPipe.passed = false; // Add passed property
    
    pipes.setVelocityX(-200); 
}


function fly() {
    player.setVelocityY(-350); // Set an upward velocity to make the player fly
    player.angle = -30;
    flySound.play()
}

function gameOver() {

    // Play the crash sound
    if (player.alive)
        crashSound.play();
    player.alive = false;
    
    // Stop all physics
    this.physics.pause();

    // Change the player's tint to red
    player.setTint(0xff0000);

    // Make the restart button visible
    restartButton.setVisible(true);

    // Save the high score
    saveGame();
}

function restartGame() {
    score = 0;
    
    music.stop();
    // Restart the scene
    this.scene.restart();
}

function increaseScore() {
    score += 0.5; // Increase score by 1
    // Check if the new score exceeds the high score
    if (score > highScore) {
        highScore = score; // Update high score
    }
    // Update the displayed text
    scoreText.setText('Score: ' + score);
    highScoreText.setText('High Score: ' + highScore);

    scoreSound.play();
}

function saveGame() {
    localStorage.setItem('highScore', highScore);
}

function loadGame() {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore !== null) {
        highScore = savedHighScore;
    }
}

function update() {
    // Scroll the background to the left
    background.tilePositionX += 4; 
    
    if (player.angle < 30) {
        player.angle += 1; 
    }

    // Check if the player's y position is off the screen
    if (player.y < 0 || player.y > 400) {
        gameOver.call(this); // Call gameOver function
    }

    // Check each pipe
    pipes.getChildren().forEach(pipe => {
        if (!pipe.passed && pipe.x < player.x) {
            pipe.passed = true; // Mark as passed
            increaseScore(); // Call the score increase function
        }
    });
}