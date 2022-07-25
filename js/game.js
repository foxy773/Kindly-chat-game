import {
    getDatabase, ref, set, update, get,
    // eslint-disable-next-line import/no-unresolved, import/extensions
} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";

if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    window.document.addEventListener("touchmove", (e) => {
        if (e.scale !== 1) {
            e.preventDefault();
        }
    }, { passive: false });
}

function createImage(path) {
    const image = new Image();
    image.src = path;
    return image;
}

const images = {
    player: [
        createImage("../assets/eyes.png"),
        createImage("../assets/eyes-closed.png"),
        createImage("../assets/eyes-shocked.png"),
    ],
    enemy: [
        createImage("../assets/enemy.png"),
        createImage("../assets/enemy-disabled.png"),
    ],
    clouds: [
        createImage("../assets/cloud-1.png"),
        createImage("../assets/cloud-2.png"),
        createImage("../assets/cloud-3.png"),
        createImage("../assets/cloud-4.png"),
        createImage("../assets/cloud-5.png"),
    ],
    platforms: [
        createImage("../assets/platform-normal-1.png"),
        createImage("../assets/platform-oneJump-1.png"),
        createImage("../assets/platform-spring-1.png"),
        createImage("../assets/platform-broken-1.png"),
        createImage("../assets/platform-ground.png"),
    ],
};

const canvas = document.getElementById("game");
const c = canvas.getContext("2d");
/* const kindlyFont = new FontFace('IBMPlexSans', 'url("../fonts/IBMPlexSans-Bold.ttf")');
const gameContainer = document.querySelector('.game-window'); */
const gameMenu = document.querySelector(".game-window__menu");
const gameWindow = document.querySelector(".game-window__game");
const startGameButton = document.querySelector("#start-game");
const highscoreList = document.getElementById("highscore-list");
const changeUsernameButton = document.getElementById("change-username");

const worldElem = document.querySelector("[data-world]");

if (gameWindow.classList.contains("hidden")) {
    startGameButton.addEventListener("click", () => {
        gameWindow.classList.remove("hidden");
        gameMenu.classList.add("hidden");
        window.requestAnimationFrame(updateGame);
        startNewGame();
        if (musicEnabled) {
            backgroundMusic.play();
        } else {
            backgroundMusic.pause();
        }
    });
}

window.onload = (() => {
    appendHighscores();
});

// Global Variables.
// Scaling the canvas to the screen.
const WORLD_WIDTH = 600;
const WORLD_HEIGHT = 600;

const scaleRatio = setPixelToWorldScale();
console.log(scaleRatio, "SCALE RATIO");

canvas.width = WORLD_WIDTH * scaleRatio;
canvas.height = WORLD_HEIGHT * scaleRatio;

// Player / Character attributes.
let player;
let platforms = [];
let platformY;
let enemies = [];
let enemyY;
let clouds = [];
let startGenerationPlatforms = true;
let startGenerationEnemies = true;
const playerRadius = 20 * scaleRatio;

const playerHeight = playerRadius;
const playerWidth = playerRadius + 10;

const playerStartX = 300 * scaleRatio;
const playerStartY = 400 * scaleRatio;

const playerXSpeed = 7 * scaleRatio;

const playerFace = [
    { expression: "default", eyes: "open", image: images.player[0] },
    { expression: "hurt", eyes: "closed", image: images.player[1] },
    { expression: "shocked", eyes: "open", image: images.player[2] },
];

let currentPlayerFace = "default";

// platform / Platform attributes
const platformHeight = 15 * scaleRatio;
const platformWidth = 60 * scaleRatio;

// Enemies / Enemy attributes
const enemyRadius = 20 * scaleRatio;
const enemyHeight = enemyRadius * 2;
const enemyWidth = enemyRadius * 2;
let enemyDisabled = false;

// Clouds / Cloud attributes
const cloudHeight = 100 * scaleRatio;
const cloudWidth = 200 * scaleRatio;
const cloudMinSpeed = 1;
const cloudMaxSpeed = 1.2;

// General game attributes
let gravity = 1;
let score;
let highScore = 0;
let lastIndex;
let audioEnabled = true;
let musicEnabled = true;

setPixelToWorldScale();
window.addEventListener("resize", setPixelToWorldScale);

function setPixelToWorldScale() {
    let worldToPixelScale;

    if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
        worldToPixelScale = window.innerWidth / WORLD_WIDTH;
    } else {
        worldToPixelScale = window.innerHeight / WORLD_HEIGHT;
    }

    worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`;
    worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`;
    return worldToPixelScale;
}

const music = "../sounds/Bicycle.mp3";
const backgroundMusic = new Audio(music);
backgroundMusic.volume = 1;
backgroundMusic.loop = true;

/* } */

class Cloud {
    constructor(x, y, width, height, xSpeed, image) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.ySpeed = 1;
        this.xSpeed = xSpeed;
        this.visible = true;
        this.moving = true; // Not used
        this.wasAbove = false;
        this.oneJumpOnly = false;
        this.broken = false;
        this.hasSpring = false;
        this.chance = Math.floor(Math.random() * 20);
        this.image = image;
        this.shouldUpdateCloud = true;
    }

    show() {
        c.drawImage(this.image, this.x, this.y);
    }

    update() {
        this.x -= this.xSpeed * scaleRatio;
        if (clouds.every((cloud) => cloud.x < -400 * scaleRatio)) {
            this.x = canvas.width + (100 * scaleRatio);
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
        this.ySpeed = 3 * scaleRatio;
        this.xSpeed = 0;
    }

    show() {
        // Draw a circle at the player's position / makes the player a circle.
        c.beginPath();
        c.arc(this.x + 15 * scaleRatio, this.y, this.r, 0, (2 * Math.PI), false);
        c.fillStyle = "#1cd300"; // Kindly green

        c.closePath();
        c.fill();
        c.stroke();
        if (currentPlayerFace === "default") {
            c.drawImage(playerFace[0].image, this.x + 5 * scaleRatio, this.y - 10 * scaleRatio, this.height, this.width);
        } else if (currentPlayerFace === "hurt") {
            c.drawImage(playerFace[1].image, this.x + 5 * scaleRatio, this.y - 10 * scaleRatio, this.height, this.width);
        } else if (currentPlayerFace === "shocked") {
            c.drawImage(playerFace[2].image, this.x + 5 * scaleRatio, this.y - 10 * scaleRatio, this.height, this.width);
        }
    }

    update() {
        this.x += this.xSpeed; // Move the player on the x-axis.

        // When player exits the screen, move them back to the other side of the screen.
        if (this.x < 0 - this.width) {
            this.x = canvas.width + this.width;
        } else if (this.x > canvas.width + this.width) {
            this.x = 0 - this.width;
        }
    }
}

class Platform {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.width = platformWidth;
        this.height = platformHeight;
        this.ySpeed = 3 * scaleRatio;
        this.visible = true;
        this.moving = false; // Not used
        this.wasAbove = false;
        this.oneJumpOnly = false;
        this.broken = false;
        this.hasSpring = false;
        this.image = image;
        this.chance = Math.floor(Math.random() * 20);
    }

    show() {
        /* if (this.y === platformY) {
            this.chance === 10;
        } */

        // 25% chance of a platform being one jump only.
        if (this.chance >= 0 && this.chance <= 5) {
            this.oneJumpOnly = true;
            //  5% chance of a platform having a spring.
        } else if (this.chance === 6) {
            this.hasSpring = true;
        }
        if (this.visible && this.chance === -1) {
            c.drawImage(this.image[4], this.x, this.y, this.width, this.height);
        } else if (this.visible && this.oneJumpOnly === false && this.hasSpring === false) {
            // Draws the normal platform.
            /* c.drawImage(this.x, this.y, this.width, ); */
            c.drawImage(this.image[0], this.x, this.y, this.width, this.height);
        } else if (this.visible && this.oneJumpOnly) {
            // Draws the platform that only allows the player to jump once.
            c.drawImage(this.image[1], this.x, this.y, this.width, this.height);
        } else if (this.visible && this.hasSpring) {
            // Draws the platform that has a spring.
            c.drawImage(this.image[2], this.x, this.y, this.width, this.height);
        }

        if (this.broken) {
            // Draws the broken platform.
            c.clearRect(this.x, this.y, this.width, this.height);
            c.fillRect(this.x, this.y, this.width, this.height);
            /*             c.fillStyle = "red"; */
            c.drawImage(this.image[3], this.x, this.y, this.width, this.height);
        }
    }

    update() {
        // Removes the platforms that are below the player and out of frame
        if (this.y > canvas.height + (150 * scaleRatio)) {
            this.visible = false;
        }

        // If the platform is above the player.
        if (player.y < this.y - (21 * scaleRatio)) {
            this.wasAbove = true;
        }

        // Collision Detection between player and platform
        if (player.x < this.x + this.width && player.x + player.width > this.x
            && player.y < this.y + this.height
            && player.y + player.height > this.y
            && this.wasAbove && this.visible
            && player.ySpeed > 0
            && this.broken === false) {
            player.ySpeed = -400 * scaleRatio; // The player speed on the y-axis upon collision.
            playSound("playerJump", 0.4);
            updateScore();

            currentPlayerFace = "hurt";

            enemyDisabled = false;
            if (this.oneJumpOnly && this.broken === false) {
                this.broken = true;
                playSound("woodPlatformBreakes", 1);
            } else if (this.hasSpring) {
                player.ySpeed = -2000 * scaleRatio;
                enemyDisabled = true;
                playSound("launchPlatform", 0.4);
            }
        }

        // Auto generates platforms and additions the level + 1
        // If the player is above the 10th platform from the bottom.
        if (player.y < platforms[platforms.length - 10].y) {
            generateplatforms();
            /*  console.log("Generate new platforms", this.ySpeed, "ySpeed") */
        }

        if (player.ySpeed >= 0) {
            currentPlayerFace = "default";
        } else if (player.ySpeed < -500 * scaleRatio) {
            currentPlayerFace = "shocked";
        }

        this.y -= player.ySpeed * 0.03;
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = enemyRadius;
        this.width = enemyWidth;
        this.height = enemyHeight;
        this.color = "red";
        this.ySpeed = 3 * scaleRatio;
        this.xSpeed = 6 * scaleRatio;
        this.visible = true;
        /* this.moving = true;   */
        this.wasAbove = false;
        this.rotating = true;
        this.rotation = 90;
        this.chance = Math.floor(Math.random() * 100); // Not used
    }

    get moving() {
        return this.xSpeed || this.ySpeed;
    }

    show() {
        if (enemyDisabled === false) {
            c.translate(this.x + 15, this.y);
            c.rotate(this.rotation);
            c.translate(-(this.x), -(this.y));
            c.drawImage(images.enemy[0], (this.x - this.r), (this.y - this.r), this.width, this.height);
            c.setTransform(1, 0, 0, 1, 0, 0);
        } else {
            c.translate(this.x, this.y);
            c.translate(-(this.x), -(this.y));
            c.drawImage(images.enemy[1], this.x, this.y, this.width, this.height);
            c.setTransform(1, 0, 0, 1, 0, 0);
        }

        /* ctx.setTransform(1, 0, 0, 1, x, y); // set the scale and the center pos
        ctx.rotate(rot); // set the rotation
        ctx.drawImage(img, -img.width /2, -img.height /2); // draw image offset
                                                           // by half its width
                                                           // and heigth
        ctx.setTransform(1, 0, 0, 1, 0, 0); // restore default transform */

        /* if (enemyDisabled && this.visible) {
            this.visible = false;
        } else if (enemyDisabled === false) {
            this.visible = true;
        } */
    }

    update() {
        // Removes the enemies that are below the player and out of frame
        if (this.y > canvas.height + (200 * scaleRatio)) {
            this.visible = false;
        }

        // If the enemy is above the player.
        if (player.y < this.y - (21 * scaleRatio)) {
            this.wasAbove = true;
        }

        // Collision Detection between player and enemies
        const distanceBetweenPlayerEnemy = getDistance(this.x, this.y, player.x, player.y);
        /* console.log(yDistanceBetweenPlayerAndEnemy, "playerEnemy"); */
        if (distanceBetweenPlayerEnemy < this.r + player.r && this.visible === true && enemyDisabled === false) {
            gameOver();
            console.log("Died by enemy", this);
        }

        if (this.moving && enemyDisabled === false) {
            this.x += this.xSpeed;
            if (this.x > canvas.width - this.width) {
                this.xSpeed -= 6 * scaleRatio;
            } else if (this.x < 0) {
                this.xSpeed = 6 * scaleRatio;
            }
        }
        /* console.log(getDistance(this.x, this.y, player.x, player.y)); */
        /* console.log((1 / (distanceBetweenPlayerEnemy)).toFixed(10)) */
        /* sawSound.volume = (1 / (distanceBetweenPlayerEnemy)).toFixed(2); */

        if ((player.y > this.y - 100 && player.y < this.y + 100)
            && player.x > this.x - 100 && player.x < this.x + 100
            && this.visible === true && enemyDisabled === false) {
            /* console.log(sawVolume); */
        }

        // Auto generates platforms and additions the level + 1
        // If the player is above the 10th platform from the bottom.
        if (player.y < enemies[enemies.length - 5].y) {
            generateEnemies();
        }

        /* Increases the fall speed/velocity of the enemy */
        this.y -= player.ySpeed * 0.03;
        /* player.ySpeed += (gravity / (level +1)); */

        /* this.x += this.xSpeed; */
        this.rotation += 0.1;
    }
}

// Starts a new game.
function startNewGame() {
    findUser();
    appendHighscores();
    score = 0;
    startGenerationPlatforms = true;
    startGenerationEnemies = true;
    platforms = [];
    enemies = [];
    // The start position x-axis, y-axis, and radius size of the player.
    player = new Player(playerStartX, playerStartY, playerRadius);
    generateBackground();
    generateplatforms();
    generateEnemies();
    player.xSpeed = 0;
    console.log("NEW GAME!");
}

// Generates the platforms.
function generateplatforms() {
    if (startGenerationPlatforms) {
        platformY = canvas.height;
        startGenerationPlatforms = false;
    } else {
        platformY = platforms[platforms.length - 1].y;
    }
    const numberOfplatforms = 100;
    for (let i = 0; i < numberOfplatforms; i += 1) {
        const image = images.platforms;

        // Random x-axis position between 0 and 600.
        const ob = new Platform(Math.floor(Math.random()
            * (canvas.width - platformWidth)), platformY, image);

        platforms.push(ob);
        platformY -= 100 * scaleRatio;
    }

    platforms[0].width = 1000 * scaleRatio;
    platforms[0].x = 0;
    platforms[0].chance = -1;
    platforms[0].height = 800 * scaleRatio;
    console.log(platforms);
}

// Generates the platforms.
function generateEnemies() {
    if (startGenerationEnemies) {
        enemyY = canvas.height - (400 * scaleRatio);
        startGenerationEnemies = false;
    } else {
        enemyY = enemies[enemies.length - 1].y - (400 * scaleRatio);
    }
    const numberOfEnemies = 20;

    // Random x-axis position between 0 and 600.
    for (let i = 0; i < numberOfEnemies; i += 1) {
        const en = new Enemy(Math.floor(Math.random() * (canvas.width - enemyWidth)), enemyY);
        enemies.push(en);
        enemyY -= 400 /* * (platforms.length / numberOfEnemies) */ * scaleRatio;
    }
}

function generateClouds() {
    /* const cloudX = canvas.width + 50 */

    const numberOfClouds = 20;

    // Random x-axis position between 0 and 600.
    for (let i = 0; i < numberOfClouds; i += 1) {
        const cl = new Cloud(
            getRandomNumber(canvas.width - 500, canvas.width + (5000 * scaleRatio)),
            getRandomNumber(0 - canvas.height, canvas.height + (300 * scaleRatio)),
            cloudHeight,
            cloudWidth,
            getRandomNumber(cloudMinSpeed, cloudMaxSpeed),
            images.clouds[getRandomNumber(0, images.clouds.length - 1)],
        );
        clouds.push(cl);
    }
}

function generateBackground() {
    generateClouds();
}
const fps = 60;
let now;
let then = performance.now();
const interval = 1000 / fps;
let delta;

// Updates the game
function updateGame() {
    window.requestAnimationFrame(updateGame);

    now = performance.now();
    delta = now - then;
    /*     console.log(delta, interval, "delta", "interval"); */
    if (delta > interval) {
        // update time stuffs

        // Just `then = now` is not enough.
        // Lets say we set fps at 10 which means
        // each frame must take 100ms
        // Now frame executes in 16ms (60fps) so
        // the loop iterates 7 times (16*7 = 112ms) until
        // delta > interval === true
        // Eventually this lowers down the FPS as
        // 112*10 = 1120ms (NOT 1000ms).
        // So we have to get rid of that extra 12ms
        // by subtracting delta (112) % interval (100).
        // Hope that makes sense.

        then = now - (delta % interval);
        /* console.log(then, "then"); */
        draw();
        updateItems();
    }

    /* console.log(fps) */
}

function draw() {
    c.fillStyle = "lightblue";
    c.fillRect(0, 0, canvas.width, canvas.height);

    // player
    // platforms

    for (let i = 0; i < clouds.length; i += 1) {
        clouds[i].show();
        clouds[i].update();
    }

    for (let i = 0; i < platforms.length; i += 1) {
        platforms[i].show();
        platforms[i].update();
    }

    for (let i = 0; i < enemies.length; i += 1) {
        enemies[i].show();
        enemies[i].update();
    }

    player.show();

    /* console.log(lastIndex, "lastIndex"); */
    /* console.log(score, "score"); */
    drawScores();
}

function updateItems() {
    player.update();
    player.ySpeed += gravity * 10 * scaleRatio;

    lastIndex = platforms.map((platform) => platform.visible).lastIndexOf(false);
    if (platforms[lastIndex]?.y < player.y - 500 * scaleRatio || platforms[0].y < player.y - 500 * scaleRatio) {
        gameOver();
    }
}
// Event Listeners

// If the button is pressed the player will move on the x-axis with the direction chosen.
function keyDown(e) {
    if (e.keyCode === 39 || e.keyCode === 68) { // Right arrow key, or D key
        player.xSpeed = playerXSpeed;
    } else if (e.keyCode === 37 || e.keyCode === 65) { // Left arrow key, or A key
        player.xSpeed = 0 - playerXSpeed;
    }
}

// If the button is let go the x-axis speed of the player will halt.
function keyUp(e) {
    if (e.keyCode === 39 || e.keyCode === 37
        || e.keyCode === 68 || e.keyCode === 65) { // Left arrow key, Right arrow key, A key, D key
        player.xSpeed = 0;
    }
}

const mobileTouchLeft = document.getElementById("mobile-touch-left");
const mobileTouchRight = document.getElementById("mobile-touch-right");

mobileTouchLeft.addEventListener("touchstart", () => {
    player.xSpeed = 0 - playerXSpeed;
});

mobileTouchLeft.addEventListener("touchend", () => {
    player.xSpeed = 0;
});

mobileTouchRight.addEventListener("touchstart", () => {
    player.xSpeed = playerXSpeed;
});

mobileTouchRight.addEventListener("touchend", () => {
    player.xSpeed = 0;
});

function gameOver() {
    if (highScore < score || highScore === undefined) {
        highScore = score;
        registerNewHighScore(highScore);
    }

    resetGlobalVariables();
    console.log("GAME OVER!");
}

function resetGlobalVariables() {
    enemyDisabled = false;
    platforms = [];
    enemies = [];
    clouds = [];
    gravity = 1;
    player.ySpeed = 3;
    player.xSpeed = 0;
    /* player.y = 1000; */
    startNewGame();
}

function getDistance(x1, y1, x2, y2) {
    const xDis = x2 - x1;
    const yDis = y2 - y1;
    return Math.sqrt(xDis ** 2 + yDis ** 2);
}

function playSound(audio, soundVolume) { // Plays sounds based on method call strings
    const playerJump = "../sounds/SFX_Jump_42.wav";
    const woodPlatformBreakes = "../sounds/stick-breaking.wav";
    const launchPlatform = "../sounds/mixkit-fast-rocket-whoosh.wav";
    if (audio === "playerJump") {
        audio = new Audio(playerJump);
        audio.volume = soundVolume;
    } else if (audio === "woodPlatformBreakes") {
        audio = new Audio(woodPlatformBreakes);
        audio.volume = soundVolume;
    } else if (audio === "launchPlatform") {
        audio = new Audio(launchPlatform);
        audio.volume = soundVolume;
    }
    if (audioEnabled) {
    audio.play("");
}
}

const updateScore = () => {
    score = platforms.filter((platform) => platform.visible === false).length + 2;
    console.log(score);
};

function drawScores() {
    //  Score
    c.font = `${60 * scaleRatio}px IBMPlexSans-Bold`;
    c.fillStyle = "orange";
    c.textAlign = "center";
    c.lineWidth = 4 * scaleRatio;
    c.fillText(score, canvas.width / 2, 50 * scaleRatio);
    c.strokeText(score, canvas.width / 2, 50 * scaleRatio);
    //  HighScore
    c.font = `${30 * scaleRatio}px IBMPlexSans-Bold`;
    c.fillStyle = "yellow";
    c.textAlign = "center";
    c.lineWidth = 2 * scaleRatio;
    c.fillText(highScore, canvas.width / 2, 100 * scaleRatio);
    c.strokeText(highScore, canvas.width / 2, 100 * scaleRatio);
}
document.onkeydown = keyDown;
document.onkeyup = keyUp;

// Gets a random number to be used to make an uid for each user.

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const rand = () => Math.random(0).toString(36).substr(2);
const token = (length) => (rand() + rand() + rand() + rand()).substr(0, length);

async function registerNewHighScore(loggedScore) {
    const db = getDatabase();
    const newToken = token(32);

    if (localStorage.getItem("user") === null) {
        localStorage.setItem("user", newToken);
        registerNewUser(newToken, db);
    } else {
        updateUserHighscore(localStorage.getItem("user"), loggedScore, db);
        console.log("updated");
    }
}

// Registers a new user in the database with the highscore they have.

async function registerNewUser(newToken, db) {
    const username = prompt("Please enter your username");
    let newUsername;

    if (username === undefined || username === null) {
        newUsername = "Anonymous";
    } else if (username.length > 10) {
        newUsername = username.slice(0, 10);
    } else if (username.length < 1) {
        newUsername = "Anonymous";
    }

    try {
        set(ref(db, `users/${newToken}`), {
            username: newUsername || username || "Anonymous",
            highScore,
        }).then(() => {
            console.log("Successfully registered new high score!");
        });
    } catch (err) {
        console.log(err, "ERROR! Could not register new high score");
    }
}

// Updates the highscore of a user that exists in the database.

async function updateUserHighscore(userToken, newScore, db) {
    try {
        update(ref(db, `users/${userToken}`), {
            highScore: newScore,
        }).then(() => {
            console.log("Successfully updated high score!");
        });
    } catch (err) {
        console.log(err, "ERROR! Could not update high score");
    }
}

// Updates the username of a user that exists in the database.

async function updateUsername(userToken, username, db) {
    try {
        update(ref(db, `users/${userToken}`), {
            username,
        }).then(() => {
            console.log("Successfully updated high score!");
        });
    } catch (err) {
        console.log(err, "ERROR! Could not update high score");
    }
}

// Gets all the users from the database.

async function getFromDatabase() {
    const db = getDatabase();

    try {
        const users = await get(ref(db, "users"));
        const highscoresfromDB = users.val();

        const scores = Object.entries(highscoresfromDB).map(([key, value]) => ({
            ...value,
            id: key,
        }));
        console.log(scores);
        scores.sort((a, b) => {
            const keyA = a.highScore;
            const keyB = b.highScore;
            // Compare the 2 dates
            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
            return 0;
        });
        console.log(scores);
        return scores;
    } catch (err) {
        console.log(err, "ERROR! Could not get highscores");
    }
}

// Checks if the user already exists in the database

async function findUser() {
    let userStoredHighscore;
    const userToken = localStorage.getItem("user");
    const storedHighscores = await getFromDatabase();
    console.log(storedHighscores, "storedHighscores");
    if (storedHighscores === undefined || storedHighscores === null || storedHighscores === []) {
        console.log("No highscores found");
        highScore = 0;
    } else {
        userStoredHighscore = storedHighscores.find((user) => user.id === userToken);
        highScore = userStoredHighscore.highScore;
        console.log("foundUser and got highscore");
    }
}

async function appendHighscores() {
    const appendableHighscores = await getFromDatabase() || undefined;
    highscoreList.innerHTML = "";
    if (appendableHighscores !== undefined) {
        appendableHighscores.forEach((user) => {
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
                highscoreName.innerHTML = `(You) ${user.username} :`;
            } else {
                highscoreName.innerHTML = `${user.username} :`;
            }

            highscoreItem.appendChild(highscoreName);
            highscoreItem.appendChild(highscoreScore);
            highscoreList.appendChild(highscoreItem);
        });
    }

    function changeUsername() {
        const db = getDatabase();
        if (localStorage.getItem("user") !== null || localStorage.getItem("user") !== undefined) {
            const newUsername = prompt("Please enter your username");
            const userToken = localStorage.getItem("user");
            updateUsername(userToken, newUsername, db);
        } else {
            alert("Please refresh the game to change your username");
        }
    }
    changeUsernameButton.addEventListener("click", () => {
        changeUsername();
    });
}

const audioSwitch = document.querySelector("#audio-on-off");
const audioIcon = document.querySelector(".audio-controller__audio-image");

const musicSwitch = document.querySelector("#music-on-off");
const musicIcon = document.querySelector(".audio-controller__music-image");

function toggleAudio() {
    if (audioEnabled) {
        audioSwitch.classList.remove("on");
        audioSwitch.classList.add("off");
        audioEnabled = false;
        audioIcon.src = "./assets/audio-off.png";
    } else {
        audioSwitch.classList.remove("off");
        audioSwitch.classList.add("on");
        audioEnabled = true;
        audioIcon.src = "./assets/audio-on.png";
    }
}

function toggleMusic() {
    if (musicEnabled) {
        musicSwitch.classList.remove("on");
        musicSwitch.classList.add("off");
        musicEnabled = false;
        musicIcon.src = "./assets/music-off.png";
    } else {
        musicSwitch.classList.remove("off");
        musicSwitch.classList.add("on");
        musicEnabled = true;
        musicIcon.src = "./assets/music-on.png";
    }
}

audioSwitch.addEventListener("click", (e) => {
    toggleAudio();
    console.log("audio clicked", e);
});

musicSwitch.addEventListener("click", (e) => {
    toggleMusic();
    if (musicEnabled) {
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
    console.log("music clicked", e);
});
