const canvas = document.getElementById('game');
const c = canvas.getContext('2d');

window.onload = function () {
    startNewGame();
    setInterval(update, 10);
}

// Player / Character attributes


const playerRadius = 20;
const playerHeight = playerRadius;
const playerWidth = playerRadius + 10;

const obstacleHeight = 10;
const obstacleWidth = 60;

class Player {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.width = playerWidth;
        this.height = playerHeight;
        this.ySpeed = 3;
        this.xSpeed = 0;
    }

    show() {
        c.beginPath();
        c.arc(this.x + 15, this.y, this.r, 0, (2 * Math.PI), false);
        c.fillStyle = "#1cd300";
        //Kindly green
        c.closePath();
        c.fill();
    }

    update() {
        this.x += this.xSpeed;
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
        this.moving = false;
        this.wasAbove = false;
        this.chance = Math.floor(Math.random() * 10);
    }
    show() {
        if (this.chance === 2) {
            this.moving = true;
        }
        if (this.visible) {
            c.fillStyle = 'red';
            c.fillRect(this.x, this.y, this.width, this.height);
            /* if (this.hasSpring) {
                c.fillStyle = 'gray';
                c.fillRect(this.springX, this.y - 10, 10, 10);
            } */
        }
    }
    update() {
        /* Removes the obstacles that are below the player and out of frame */
        if (this.y > canvas.height +100) {
            this.visible = false;
        }

        if (player.y < this.y - 21) {
            this.wasAbove = true;
        }

        if (player.x < this.x + this.width && player.x + player.width > this.x && player.y < this.y + this.height && player.y + player.height > this.y && this.wasAbove && this.visible) {
            player.ySpeed = -800;
        }

        let playerIsDead = obstacles.every(obstacle => obstacle.visible === false)

        if (playerIsDead === true) {
            gameOver();
        }

        /* Increases the fall speed/velocity of the player*/
        this.y -= player.ySpeed*0.01;
        player.ySpeed += gravity;
    }
}

let player;
let gravity = 0.1;

let obstacles = []; 
let obstacleY = 800;

function startNewGame() {
    player = new Player(300, 300, playerRadius);

    for (let i = 0; i < 100; i++) {
        var ob = new Obstacle(Math.floor(Math.random() * 600), obstacleY);
        obstacles.push(ob);
        obstacleY -= 100;
    }
    
    console.log("NEW GAME!")
}

function update() {
   //background
   c.fillStyle = 'lightblue';
   c.fillRect(0, 0, 600, 800);
   
   //player
   //obstacles
   for (let i = 0; i < obstacles.length; i++) {
       obstacles[i].show();
       obstacles[i].update();
   }

   player.show();
   player.update();
}

function keyDown(e) {
    if (e.keyCode === 39) {
        player.xSpeed = 5
    }
    if (e.keyCode === 37) {
        player.xSpeed = -5;
    }
}

function keyUp(e) {
    if (e.keyCode === 39) {
        player.xSpeed = 0;
    }
    if (e.keyCode === 37) {
        player.xSpeed = 0;
    }
}

function gameOver() {
    console.log("GAME OVER!")
    /* startNewGame(); */
}

document.onkeydown = keyDown;
document.onkeyup = keyUp;