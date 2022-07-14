import { getDatabase, ref, set, child, update, remove, get, query, onValue } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";

const canvas = document.getElementById('game');
const c = canvas.getContext('2d');
const kindlyFont = new FontFace('IBMPlexSans', 'url("../fonts/IBMPlexSans-Bold.ttf")');
const gameContainer = document.querySelector('.game-window');
const gameMenu = document.querySelector('.game-window__menu');
const gameWindow = document.querySelector('.game-window__game');
const startGameButton = document.querySelector('#start-game');
const highscoreList = document.getElementById("highscore-list");
const kindlyHighscoreList = document.getElementById("kindly-highscore-list") // !!! To remove before release.

if (gameWindow.classList.contains('hidden')) {
    startGameButton.addEventListener('click', function () {
        gameWindow.classList.remove('hidden');
        gameMenu.classList.add('hidden');
        startNewGame();
        setInterval(updateGame, 10);
    });
};

window.onload = function () {
    appendHighscores()
}

// Global Variables.
// Player / Character attributes.

let player;
let platforms = [];
let platformY;
let enemies = [];
let enemyY;
let clouds = [];
const cloudImages = [
    { image: "../assets/cloud-1.png" },
    { image: "../assets/cloud-2.png" },
    { image: "../assets/cloud-3.png" },
    { image: "../assets/cloud-4.png" },
    { image: "../assets/cloud-5.png" }
];
let cloudX;
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
let enemyDisabled = false;

// Clouds / Cloud attributes
const cloudHeight = 100;
const cloudWidth = 200;
const cloudMinSpeed = 1;
const cloudMaxSpeed = 1.2;

// General game attributes
let gravity = 0.1;
let score;
let lastHeight;
let highScore = 0;
let lastIndex;
let highscores

function generateBackground() {
    generateClouds();
}

class Cloud {
    constructor(x, y, width, height, xSpeed, cloudImage) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.ySpeed = 1;
        this.xSpeed = xSpeed;
        this.visible = true;
        this.moving = true;            // Not used
        this.wasAbove = false;
        this.oneJumpOnly = false;
        this.broken = false;
        this.hasSpring = false;
        this.chance = Math.floor(Math.random() * 20);
        this.cloudImage = cloudImage;
    }
    show() {
        let cloudImage = new Image();
        cloudImage.src = this.cloudImage.image;

        c.drawImage(cloudImage, this.x, this.y);

    }
    update() {
        this.x -= this.xSpeed;
        if (clouds.every(cloud => cloud.x < -100)) {
            this.x = canvas.width + 100;
        }


    }
}

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
        this.oneJumpOnly = false;
        this.broken = false;
        this.hasSpring = false;
        this.chance = Math.floor(Math.random() * 20);
    }
    show() {
        // 10% chance of a platform being one jump only.
        if (this.chance >= 0 && this.chance <= 5) {
            this.oneJumpOnly = true;
            //  5% chance of a platform having a spring.
        } else if (this.chance === 6) {
            this.hasSpring = true;
        }

        if (this.visible && this.oneJumpOnly === false && this.hasSpring === false) {
            // Draws the normal platform.
            c.fillStyle = 'red';
            c.fillRect(this.x, this.y, this.width, this.height);
        } else if (this.visible && this.oneJumpOnly) {
            // Draws the platform that only allows the player to jump once.
            c.fillStyle = 'black';
            c.fillRect(this.x, this.y, this.width, this.height);
        } else if (this.visible && this.hasSpring) {
            // Draws the platform that has a spring.
            c.fillStyle = 'green';
            c.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    update() {
        // Removes the platforms that are below the player and out of frame
        if (this.y > canvas.height + 50) {
            this.visible = false;
        }

        // If the platform is above the player.
        if (player.y < this.y - 21) {
            this.wasAbove = true;
        }

        // Collision Detection between player and platform
        if (player.x < this.x + this.width && player.x + player.width > this.x && player.y < this.y + this.height && player.y + player.height > this.y && this.wasAbove && this.visible && player.ySpeed > 0 && this.broken === false) {
            player.ySpeed = -700;   // The player speed on the y-axis upon collision.
            playSound("playerJump");
            updateScore();
            enemyDisabled = false;
            if (this.oneJumpOnly && this.broken === false) {
                this.broken = true;
            } else if (this.hasSpring) {
                player.ySpeed = -3000
                enemyDisabled = true;
            }
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
        this.color = "red"
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
        if (this.visible && enemyDisabled === false) {
            this.color = "red";
        } else if (enemyDisabled && this.visible) {
            this.color = "blue"
        }
        c.beginPath();
        c.arc(this.x + 15, this.y, this.r, 0, (2 * Math.PI), false);    //Draw a circle at the player's position / makes the player a circle.
        c.fillStyle = this.color; //Kindly green
        c.closePath();
        c.fill();

        /* if (enemyDisabled && this.visible) {
            this.visible = false;
        } else if (enemyDisabled === false) {
            this.visible = true;
        } */


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

        if (playerEnemy < this.r + player.r && this.visible === true && enemyDisabled === false) {
            gameOver();
            console.log("Died by enemy", this)
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
        }

        /* Increases the fall speed/velocity of the player*/
        this.y -= player.ySpeed * 0.01;
        /* player.ySpeed += (gravity / (level +1)); */
        this.x += this.xSpeed;
    }
}

// Starts a new game.
function startNewGame() {
    findUser();
    appendHighscores()
    score = 0;
    lastHeight = 0;
    level = 0;
    platforms = [];
    enemies = [];
    player = new Player(300, 400, playerRadius); // The start position x-axis, y-axis, and radius size of the player.
    generateBackground();
    generateplatforms();
    generateEnemies();
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
        platforms.push(ob);
        platformY -= 100;
    }

    platforms[0].width = 1000;
    platforms[0].x = 0;
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
        enemies.push(en);
        enemyY -= 100 * platforms.length / numberOfEnemies;
    }
}

function generateClouds() {
    if (level === 0) {
        cloudX = canvas.width + 50
    } else {
        cloudX = canvas[clouds.length - 1].x + 50;
    }
    const numberOfClouds = 20;
    for (let i = 0; i < numberOfClouds; i++) {
        let cl = new Cloud(getRandomNumber(canvas.width - 500, canvas.width + 5000), getRandomNumber(0 - canvas.height, canvas.height + 300), cloudHeight, cloudWidth, getRandomNumber(cloudMinSpeed, cloudMaxSpeed), cloudImages[getRandomNumber(0, cloudImages.length - 1)]); // Random x-axis position between 0 and 600.
        clouds.push(cl);
    }
}

// Updates the game
function updateGame() {
    //background
    c.fillStyle = 'lightblue';
    c.fillRect(0, 0, canvas.width, canvas.height);

    //player
    //platforms

    for (var i = 0; i < clouds.length; i++) {
        clouds[i].show();
        clouds[i].update();
    }

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
    drawScores();
}

// Event Listeners

// If the button is pressed the player will move on the x-axis with the direction chosen.
function keyDown(e) {
    if (e.keyCode === 39 || e.keyCode === 68) { // Right arrow key, or D key
        player.xSpeed = 5

    } else if (e.keyCode === 37 || e.keyCode === 65) { // Left arrow key, or A key
        player.xSpeed = -5;
    }
}

// If the button is let go the x-axis speed of the player will halt.
function keyUp(e) {
    if (e.keyCode === 39 || e.keyCode === 37 || e.keyCode === 68 || e.keyCode === 65) { // Left arrow key, Right arrow key, A key, D key
        player.xSpeed = 0;
    }
}

function gameOver() {
    if (highScore < score || highScore === undefined) {
        highScore = score;
        registerNewHighScore(highScore);
    }

    resetGlobalVariables();
    console.log("GAME OVER!")
}

function resetGlobalVariables() {
    platforms = [];
    enemies = [];
    clouds = [];
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
    audio.play("");
}

const updateScore = () => {
    score = platforms.filter(function (platform) {
        return platform.visible === false;
    }).length + 2;
    console.log(score)
}

function drawScores() {
    //  Score
    c.font = "60px IBMPlexSans-Bold";
    c.fillStyle = "orange";
    c.textAlign = "center";
    c.lineWidth = 4;
    c.fillText(score, canvas.width / 2, 50);
    c.strokeText(score, canvas.width / 2, 50);
    //  HighScore
    c.font = "30px IBMPlexSans-Bold";
    c.fillStyle = "yellow";
    c.textAlign = "center";
    c.lineWidth = 2;
    c.fillText(highScore, canvas.width / 2, 100);
    c.strokeText(highScore, canvas.width / 2, 100);
}
document.onkeydown = keyDown;
document.onkeyup = keyUp;

// Gets a random number to be used to make an uid for each user.

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const rand = () => Math.random(0).toString(36).substr(2);
const token = (length) => (rand() + rand() + rand() + rand()).substr(0, length);

async function registerNewHighScore(highScore) {
    const db = getDatabase();
    const newToken = token(32);

    if (localStorage.getItem("user") === null) {
        localStorage.setItem("user", newToken);
        registerNewUser(newToken, db);
    } else {
        updateUserHighscore(localStorage.getItem("user"), highScore, db);
        console.log("updated")
    }
}

// Registers a new user in the database with the highscore they have.

async function registerNewUser(newToken, db) {
    const username = prompt("Please enter your username");
    let newUsername

    if (username === undefined || username === null) {
        newUsername = "Anonymous";
    } else if (username.length > 10) {
        newUsername = username.slice(0, 10);
    } else if (username.length < 1) {
        newUsername = "Anonymous";
    }

    try {
        set(ref(db, 'users/' + newToken), {
            username: newUsername || username || "Anonymous",
            highScore: highScore
        }).then(() => {
            console.log("Successfully registered new high score!");
        });
    } catch (err) {
        console.log(err, "ERROR! Could not register new high score")
    }
}

// Updates the highscore of a user that exists in the database.

async function updateUserHighscore(userToken, highScore, db) {
    try {
        update(ref(db, 'users/' + userToken), {
            highScore: highScore
        }).then(() => {
            console.log("Successfully updated high score!");
        });
    } catch (err) {
        console.log(err, "ERROR! Could not update high score")
    }
}

// Gets all the users from the database.

async function getFromDatabase() {
    const db = getDatabase();

    try {
        const users = await get(ref(db, 'users'))
        const highscoresfromDB = users.val();

        const scores = Object.entries(highscoresfromDB).map(function ([key, value]) {
            return {
                ...value,
                id: key,
            }
        });
        console.log(scores)
        scores.sort(function (a, b) {
            let keyA = a.highScore
            let keyB = b.highScore
            // Compare the 2 dates
            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
            return 0;
        });
        console.log(scores)
        return scores

    } catch (err) {
        console.log(err, "ERROR! Could not get highscores")
    }
}

// Checks if the user already exists in the database

async function findUser() {
    let userStoredHighscore;
    const userToken = localStorage.getItem("user");
    const storedHighscores = await getFromDatabase();
    if (storedHighscores === undefined) {
        console.log("No highscores found")
        highScore = 0;
    } else {
        if (userStoredHighscore = storedHighscores.find(user => user.id === userToken)) {
            userStoredHighscore = storedHighscores.find(user => user.id === userToken);
            highScore = userStoredHighscore.highScore
        }
    }
}

async function appendHighscores() {
    const appendableHighscores = await getFromDatabase() || undefined;
    highscoreList.innerHTML = "";
    kindlyHighscoreList.innerHTML = "";
    if (appendableHighscores === undefined) {

    } else {
        appendableHighscores.forEach(user => {
            const userToken = localStorage.getItem("user");
            // Create a new list item with a text node
            const highscoreItem = document.createElement("li");
            const highscoreName = document.createElement("span");
            const highscoreScore = document.createElement("span");

            highscoreItem.classList.add("score-board__item");
            highscoreName.classList.add("score-board__item-name");
            highscoreScore.classList.add("score-board__item-highscore");

            highscoreName.innerHTML = user.username;
            highscoreScore.innerHTML = user.highScore;

            if (user.id === userToken) {
                highscoreName.innerHTML = `(You) ${user.username}` + ":";
            } else {
                highscoreName.innerHTML = `${user.username}` + ":";;
            }

            highscoreItem.appendChild(highscoreName);
            highscoreItem.appendChild(highscoreScore);
            highscoreList.appendChild(highscoreItem);
            kindlyHighscoreList.appendChild(highscoreItem.cloneNode(true)); // !!! To remove before release.
        });
        const bestPlayerImage = document.createElement("img");
        const bestPlayerContainer = document.getElementById("best-player-container");
        const bestPlayerItem = document.createElement("p");

        bestPlayerContainer.innerHTML = "";
        bestPlayerImage.src = "./../assets/star.png";
        bestPlayerImage.classList.add("top-player__star");

        const bestUser = appendableHighscores[0].username;
        const bestScore = appendableHighscores[0].highScore;

        bestPlayerContainer.appendChild(bestPlayerImage);
        bestPlayerContainer.appendChild(bestPlayerItem);
    }

}
