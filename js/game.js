const canvas = document.getElementById('game');
const c = canvas.getContext('2d');

window.onload = function () {
    startNewGame();
    setInterval(update, 10);   // Update the game every 10 milliseconds.
}
// Global Variables
// Player / Character attributes

let player;
let gravity = 0.1;
let obstacles = [];
let obstacleY;
let level;

const playerRadius = 20;
const playerHeight = playerRadius;
const playerWidth = playerRadius + 10;

// Obstacle / Platform attributes
const obstacleHeight = 10;
const obstacleWidth = 60;

// General game attributes

let score;
let highScore;

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
        c.beginPath();
        c.arc(this.x + 15, this.y, this.r, 0, (2 * Math.PI), false);    //Draw a circle at the player's position / makes the player a circle.
        c.fillStyle = "#1cd300"; //Kindly green
        c.closePath();
        c.fill();
    }

    update() {
        this.x += this.xSpeed;  //Move the player on the x-axis.
    }
}

class Obstacle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = obstacleWidth;
        this.height = obstacleHeight;
        this.ySpeed = 3;
        this.visible = true;
        this.moving = false;            // Not used
        this.wasAbove = false;
        this.chance = Math.floor(Math.random() * 10);   // Not used
    }
    show() {
        /* if (this.chance === 2) {
            this.moving = true;
        } */
        if (this.visible) {
            c.fillStyle = 'red';
            c.fillRect(this.x, this.y, this.width, this.height); // Draws the obstacle.
        }
    }
    update() {
        // Removes the obstacles that are below the player and out of frame
        if (this.y > canvas.height + 150) {
            this.visible = false;
        }

        // If the obstacle is above the player.
        if (player.y < this.y - 21) {
            this.wasAbove = true;
        }

        // Collision Detection between player and platform
        if (player.x < this.x + this.width && player.x + player.width > this.x && player.y < this.y + this.height && player.y + player.height > this.y && this.wasAbove && this.visible) {
            player.ySpeed = -800;   // The player speed on the y-axis upon collision.
            console.log(obstacleY);
            console.log(player.ySpeed)
        }

        // Auto generates obstacles and additions the level + 1
        if (player.y < obstacles[obstacles.length -10].y) { // If the player is above the 10th platform from the bottom.
            level++;
            generateObstacles();
            console.log("Generate new obstacles", this.ySpeed, "ySpeed")
        }

        let playerIsDead = obstacles.every(obstacle => obstacle.y < (player.y + player.height - 500)); // If the player is dead.
        if (playerIsDead) {
            startNewGame();
        }
    
        if (playerIsDead) {
            gameOver();
            console.log("GAME OVER!")
        }

        /* Increases the fall speed/velocity of the player*/
        this.y -= player.ySpeed * 0.01;
        /* player.ySpeed += (gravity / (level +1)); */

        score = ((this.y) + 9500).toFixed(0);
    }
}

// Starts a new game.
function startNewGame() {
    score = 0;
    level = 0;
    obstacles = [];
    player = new Player(300, 400, playerRadius); // The start position x-axis, y-axis, and radius size of the player.
    generateObstacles()
    player.xSpeed = 0;
    console.log("NEW GAME!")
}

// Generates the obstacles.
function generateObstacles() {
    if (level === 0) {
        obstacleY = canvas.height
    } else {
        obstacleY = obstacles[obstacles.length - 1].y;
    }
    const numberOfObstacles = 100;
    for (let i = 0; i < numberOfObstacles; i++) {
        let ob = new Obstacle(Math.floor(Math.random() * 600), obstacleY); // Random x-axis position between 0 and 600.
        obstacles.push(ob);
        console.log("gen")

        
        if (level !== 0) {
            obstacleY -= 100
        } else {
            obstacleY -= 100
        }
        console.log(obstacleY, "obstacleY")
    }

    obstacles[0].width = 1000;
    obstacles[0].x = 0;
    console.log(obstacles)
}

// Updates the game
function update() {
    //background
    c.fillStyle = 'lightblue';
    c.fillRect(0, 0, 600, 800);

    //player
    //obstacles
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].show();
        obstacles[i].update();
    }

    player.show();
    player.update();

    player.ySpeed += gravity * 100;

    
    console.log(score, "score");
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
    obstacles = [];
    gravity = 0.1;
    player.ySpeed = 3;
    player.xSpeed = 0;
    player.y = 1000;
}

document.onkeydown = keyDown;
document.onkeyup = keyUp;