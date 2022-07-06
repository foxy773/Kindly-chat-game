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
let obstacleY = 800;
let level;

const playerRadius = 20;
const playerHeight = playerRadius;
const playerWidth = playerRadius + 10;

// Obstacle / Platform attributes
const obstacleHeight = 10;
const obstacleWidth = 60;

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
        if (player.y < obstacles[obstacles.length - 90].y) { // If the player is above the 10th platform from the bottom.
            level++;
            generateObstacles();
            console.log("Generate new obstacles", this.ySpeed, "ySpeed")
        }

        /* let playerIsDead = obstacles.every(obstacle => obstacle.y > player.y * 100); */

        /* if (playerIsDead) {
            gameOver();
        } */

        obstacles[2].width = 10000; // Sets the width of the third platform from the bottom to be the start platform.
        obstacles[2].x = 0;         // Sets the x-position of the third platform from the bottom to be the start platform.

        /* Increases the fall speed/velocity of the player*/
        this.y -= player.ySpeed * 0.01;
        player.ySpeed += gravity;
    }
}

// Starts a new game.
function startNewGame() {
    obstacles = [];
    level = 0;
    player = new Player(300, 300, playerRadius); // The start position x-axis, y-axis, and radius size of the player.
    generateObstacles()
    player.xSpeed = 0;
    console.log("NEW GAME!")
}

// Generates the obstacles.
function generateObstacles() {
    const numberOfObstacles = 100;
    /* obstacles = []; */
    for (let i = 0; i < numberOfObstacles; i++) {
        let ob = new Obstacle(Math.floor(Math.random() * 600), obstacleY); // Random x-axis position between 0 and 600.
        obstacles.push(ob);
        console.log("gen")
        if (level === 0) {
            obstacleY -= 100 // The start position of the obstacle y-axis.
        } else {
            
        }

        console.log(obstacleY)
    }
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
    console.log("GAME OVER!")
    gameEnded = true;
}

function resetGlobalVariables() {
    /* gravity = 0.1;
    player.ySpeed = 3;
    player.xSpeed = 0;
    player.y = 1000; */
}

document.onkeydown = keyDown;
document.onkeyup = keyUp;