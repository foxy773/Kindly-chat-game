const canvas = document.getElementById('game');
const c = canvas.getContext('2d');
let kindlyFont = new FontFace('IBMPlexSans', 'url("../fonts/IBMPlexSans-Bold.ttf")');

window.onload = function () {
    startNewGame();
    setInterval(update, 10);   // Update the game every 10 milliseconds.
}
// Global Variables.
// Player / Character attributes.

let player;
let platforms = [];
let platformY;
let enemies = [];
let enemyY;
let level;

const playerRadius = 20;
const playerHeight = playerRadius;
const playerWidth = playerRadius + 10;

// platform / Platform attributes
const platformHeight = 10;
const platformWidth = 60;

// Enemies / Enemy attributes
const enemyRadius = 20;
const enemyHeight = enemyRadius * 2;
const enemyWidth = enemyRadius * 2;

// General game attributes
let gravity = 0.1;
let score;
let lastHeight;
let highScore;
let lastIndex

// Player Class
class Player {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.width = playerWidth;
        this.height = playerHeight;
        this.ySpeed = 1;
        this.xSpeed = 0;
    }

    show() {
        //Draw a circle at the player's position / makes the player a circle.
        c.beginPath();
        c.arc(this.x + 15, this.y, this.r, 0, (2 * Math.PI), false);
        c.fillStyle = "#1cd300"; //Kindly green
        c.closePath();
        c.fill();
    }

    update() {
        this.x += this.xSpeed;  //Move the player on the x-axis.

        // When player exits the screen, move them back to the other side of the screen.
        if (this.x < 0 - this.width) {
            this.x = canvas.width + this.width
        } else if (this.x > canvas.width + this.width) {
            this.x = 0 - this.width
        }
    }
}

class Platform {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = platformWidth;
        this.height = platformHeight;
        this.ySpeed = 3;
        this.visible = true;
        this.moving = false;            // Not used
        this.wasAbove = false;
        this.chance = Math.floor(Math.random() * 10);   // Not used
    }
    show() {

        
        if (this.chance === 1) {
            this.moving = true;
        }
        
        if (this.visible) {
            // Draws the platform.
            c.fillStyle = 'red';
            c.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    update() {
        // Removes the platforms that are below the player and out of frame
        if (this.y > canvas.height + 150) {
            this.visible = false;
        }

        // If the platform is above the player.
        if (player.y < this.y - 21) {
            this.wasAbove = true;
        }

        // Collision Detection between player and platform
        if (player.x < this.x + this.width && player.x + player.width > this.x && player.y < this.y + this.height && player.y + player.height > this.y && this.wasAbove && this.visible && player.ySpeed > 0) {
            player.ySpeed = -800;   // The player speed on the y-axis upon collision.
            playSound("playerJump");
            updateScore();
        }

        // Auto generates platforms and additions the level + 1
        if (player.y < platforms[platforms.length - 10].y) { // If the player is above the 10th platform from the bottom.
            level++;
            generateplatforms();
            /*  console.log("Generate new platforms", this.ySpeed, "ySpeed") */
        }
        /* let playerIsDead = 0; */
        /* let playerIsDead =  */ /* console.log(platforms.lastIndexOf(platform => platform.visible === false)); // If the player is dead. */

        /* if (playerIsDead) {
            startNewGame();
        } */

        /* if (playerIsDead) {
            gameOver();
            console.log("GAME OVER!")
        } */

        /* Increases the fall speed/velocity of the player*/
        this.y -= player.ySpeed * 0.01;
        /* player.ySpeed += (gravity / (level +1)); */
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = enemyRadius
        this.width = enemyWidth;
        this.height = enemyHeight;
        this.ySpeed = 3;
        this.xSpeed = 3;
        this.visible = true;
        /* this.moving = true;   */
        this.wasAbove = false;
        this.chance = Math.floor(Math.random() * 10);   // Not used
    }
    get moving() {
        return this.xSpeed || this.ySpeed;
    }
    show() {
        if (this.visible) {
            c.beginPath();
            c.arc(this.x + 15, this.y, this.r, 0, (2 * Math.PI), false);    //Draw a circle at the player's position / makes the player a circle.
            c.fillStyle = "red"; //Kindly green
            c.closePath();
            c.fill();
        }
    }
    update() {
        // Removes the enemies that are below the player and out of frame
        if (this.y > canvas.height + 200) {
            this.visible = false;
        }

        // If the enemy is above the player.
        if (player.y < this.y - 21) {
            this.wasAbove = true;
        }

        // Collision Detection between player and enemies
        let playerEnemy = getDistance(this.x, this.y, player.x, player.y)

        if (playerEnemy < this.r + player.r) {
            gameOver();
        }

        if (this.moving /* && this.chance === 2 */) {

            if (this.x > canvas.width - this.width) {
                this.xSpeed -= 3;
            } else if (this.x < 0) {
                this.xSpeed = 3;
            }
        }

        // Auto generates platforms and additions the level + 1
        if (player.y < enemies[enemies.length - 1].y) { // If the player is above the 10th platform from the bottom.
            generateEnemies()
            console.log("Generate new enemies", this.ySpeed, "ySpeed")
        }

        /* Increases the fall speed/velocity of the player*/
        this.y -= player.ySpeed * 0.01;
        /* player.ySpeed += (gravity / (level +1)); */
        /* console.log(this.y) */
        this.x += this.xSpeed;
    }
}

// Starts a new game.
function startNewGame() {
    score = 0;
    lastHeight = 0;
    level = 0;
    platforms = [];
    enemies = [];
    player = new Player(300, 400, playerRadius); // The start position x-axis, y-axis, and radius size of the player.
    generateplatforms()
    generateEnemies()
    player.xSpeed = 0;
    console.log("NEW GAME!")
}

// Generates the platforms.
function generateplatforms() {
    if (level === 0) {
        platformY = canvas.height
    } else {
        platformY = platforms[platforms.length - 1].y;
    }
    const numberOfplatforms = 100;
    for (let i = 0; i < numberOfplatforms; i++) {
        let ob = new Platform(Math.floor(Math.random() * (canvas.width - platformWidth)), platformY); // Random x-axis position between 0 and 600.
        console.log(ob)
        platforms.push(ob);
        /* console.log("gen") */
        platformY -= 100;
    }

    platforms[0].width = 1000;
    platforms[0].x = 0;
    console.log(platforms)
}

// Generates the platforms.
function generateEnemies() {
    if (level === 0) {
        enemyY = canvas.height - 400
    } else {
        enemyY = enemies[enemies.length - 1].y - 400;
    }
    const numberOfEnemies = 16;
    for (let i = 0; i < numberOfEnemies; i++) {
        let en = new Enemy(Math.floor(Math.random() * (canvas.width - enemyWidth)), enemyY); // Random x-axis position between 0 and 600.
        console.log(en)
        enemies.push(en);
        enemyY -= 100 * platforms.length / numberOfEnemies;
    }
}

// Updates the game
function update() {
    //background
    c.fillStyle = 'lightblue';
    c.fillRect(0, 0, canvas.width, canvas.height);

    //player
    //platforms

    for (var i = 0; i < platforms.length; i++) {
        platforms[i].show();
        platforms[i].update();
    }

    for (var i = 0; i < enemies.length; i++) {
        enemies[i].show();
        enemies[i].update();
    }

    player.show();
    player.update();

    player.ySpeed += gravity * 100;

    lastIndex = platforms.map(platforms => platforms.visible).lastIndexOf(false);
    if (platforms[lastIndex]?.y < player.y - 500 || platforms[0].y < player.y - 500) {
        gameOver()
    }
    /* console.log(lastIndex, "lastIndex"); */
    /* console.log(score, "score"); */
    drawScore();
}

// Event Listeners

// If the button is pressed the player will move on the x-axis with the direction chosen.
function keyDown(e) {
    if (e.keyCode === 39) { // Right arrow key
        player.xSpeed = 5
    }
    if (e.keyCode === 37) { // Left arrow key
        player.xSpeed = -5;
    }
}

// If the button is let go the x-axis speed of the player will halt.
function keyUp(e) {
    if (e.keyCode === 39) { // Right arrow key
        player.xSpeed = 0;
    }
    if (e.keyCode === 37) { // Left arrow key
        player.xSpeed = 0;
    }
}

let gameEnded = false;
function gameOver() {
    resetGlobalVariables();
    console.log("GAME OVER!")
    /* gameEnded = true; */
}

function resetGlobalVariables() {
    platforms = [];
    gravity = 0.1;
    player.ySpeed = 3;
    player.xSpeed = 0;
    /* player.y = 1000; */
    startNewGame();
}

function getDistance(x1, y1, x2, y2) {
    let xDis = x2 - x1;
    let yDis = y2 - y1;
    return Math.sqrt(Math.pow(xDis, 2) + Math.pow(yDis, 2));
}

function playSound(audio) {                                  // Plays sounds based on method call strings
    const playerJump = "../sounds/SFX_Jump_42.wav";
    if (audio === "playerJump") {
        audio = new Audio(playerJump);
        audio.volume = 0.4;
    } else if (audio === "chipsReset") {

    }
    /* audio.play(""); */
}

const updateScore = () => {

    score = platforms.filter(function (platform) {
        return platform.visible === false;
    }).length + 2;
    console.log(score)
}

function drawScore() {


    c.font = "40px IBMPlexSans";
    c.fillStyle = "black";
    c.fillText(score, canvas.width / 2, 50);
}

document.onkeydown = keyDown;
document.onkeyup = keyUp;