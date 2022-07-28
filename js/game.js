import {
    getDatabase, ref, set, update, get,
    // eslint-disable-next-line import/no-unresolved, import/extensions
} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";

import * as global from "./global.js";
import { settings } from "./settings.js";
import { playSound, updateScore, generateplatforms, generateEnemies, startNewGame, togglePause, appendHighscores, gameOver, getFromDatabase} from "./gameUtils.js";

document.ontouchmove = function (event) {
    event.preventDefault();
};

global.backgroundMusic.volume = 0.5;
global.backgroundMusic.loop = true;

if (global.gameWindow.classList.contains("hidden")) {
    global.startGameButton.addEventListener("click", () => {
        global.gameWindow.classList.remove("hidden");
        global.canvas.classList.remove("hidden");
        global.gameMenu.classList.add("hidden");
        window.requestAnimationFrame(updateGame);
        startNewGame();

        if (settings.musicEnabled) {
            global.backgroundMusic.play();
        } else {
            global.backgroundMusic.pause();
        }
    });
}

window.onload = (() => {
    appendHighscores();
});

import Cloud from "./classes/cloud.js";
import Player from "./classes/player.js";
import Platform from "./classes/platform.js";
import Enemy from "./classes/enemy.js";

/* // Starts a new game.
function startNewGame() {
    if (settings.gamePaused) {
        togglePause();
    }
    findUser();
    appendHighscores();
    settings.gamePaused = false;
    settings.score = 0;
    settings.startGenerationPlatforms = true;
    settings.startGenerationEnemies = true;
    settings.platforms = [];
    settings.enemies = [];
    // The start position x-axis, y-axis, and radius size of the player.
    settings.player = new Player(global.playerStartX, global.playerStartY, global.playerRadius);
    generateBackground();
    generateplatforms();
    generateEnemies();
    settings.player.xSpeed = 0;
    console.log("NEW GAME!");
} */

/* // Generates the platforms.
function generateplatforms() {
    if (settings.startGenerationPlatforms) {
        settings.platformY = global.canvas.height;
    } else {
        settings.platformY = settings.platforms[settings.platforms.length - 1].y - global.distanceBetweenPlatforms;
    }
    for (let i = 0; i < global.numberOfplatforms; i += 1) {
        const image = global.images.platforms;

        // Random x-axis position between 0 and 600.
        const ob = new Platform(Math.floor(Math.random()
            * (global.canvas.width - global.platformWidth)), settings.platformY, image);

        settings.platforms.push(ob);
        settings.platformY -= global.distanceBetweenPlatforms;
    }

    if (settings.startGenerationPlatforms) {
        settings.platforms[0].width = global.firstPlatformWidth;
        settings.platforms[0].x = 0;
        settings.platforms[0].chance = -1;
        settings.platforms[0].height = global.firstPlatformHeight;
        settings.startGenerationPlatforms = false;
    }

    console.log(settings.platforms);
} */

// Generates the platforms.
/* function generateEnemies() {
    if (settings.startGenerationEnemies) {
        settings.enemyY = global.canvas.height - global.enemyDistanceBetween;
        settings.startGenerationEnemies = false;
    } else {
        settings.enemyY = settings.enemies[settings.enemies.length - 1].y - global.enemyDistanceBetween;
    }
    const numberOfEnemies = 20;

    // Random x-axis position between 0 and 600.
    for (let i = 0; i < numberOfEnemies; i += 1) {
        const en = new Enemy(Math.floor(Math.random() * (global.canvas.width - global.enemyWidth)), settings.enemyY);
        settings.enemies.push(en);
        settings.enemyY -= global.enemyDistanceBetween;
    }
} */

// Updates the game
function updateGame() {
    window.requestAnimationFrame(updateGame);

    settings.now = performance.now();
    settings.delta = settings.now - settings.then;

    if (settings.delta > global.interval - 0.2) {
        settings.then = settings.now - (settings.delta % global.interval);

        if (settings.RIGHT) {
            settings.player.xSpeed = global.playerXSpeed;
        } else if (settings.LEFT) {
            settings.player.xSpeed = 0 - global.playerXSpeed;
        } else {
            settings.player.xSpeed = 0;
        }

        if (!settings.gamePaused) {
            draw();
            updateItems();
        }
    } else {
        window.cancelAnimationFrame(updateGame);
    }
}

function draw() {
    global.c.fillStyle = "lightblue";
    global.c.fillRect(0, 0, global.canvas.width, global.canvas.height);

    for (let i = 0; i < settings.clouds.length; i += 1) {
        settings.clouds[i].show();
        settings.clouds[i].update();
    }

    for (let i = 0; i < settings.platforms.length; i += 1) {
        settings.platforms[i].show();
        settings.platforms[i].update();
    }

    for (let i = 0; i < settings.enemies.length; i += 1) {
        settings.enemies[i].show();
        settings.enemies[i].update();
    }

    settings.player.show();
    drawScores();
}

function updateItems() {
    settings.player.update();
    settings.player.ySpeed += settings.gravity * 10 * global.scaleRatio;

    settings.lastIndex = settings.platforms.map((platform) => platform.visible).lastIndexOf(false);
    if (settings.platforms[settings.lastIndex]?.y < settings.player.y - 500 * global.scaleRatio || settings.platforms[0].y < settings.player.y - 500 * global.scaleRatio) {
        gameOver();
    }
}
// Event Listeners

// If the button is pressed the player will move on the x-axis with the direction chosen.
function keyDown(e) {
    if (e.keyCode === 39 || e.keyCode === 68) { // Right arrow key, or D key
        settings.RIGHT = true;
    } else if (e.keyCode === 37 || e.keyCode === 65) { // Left arrow key, or A key
        settings.LEFT = true;
    }
    /* console.log(e); */
}

// If the button is let go the x-axis speed of the player will halt.
function keyUp(e) {
    if (e.keyCode === 39 || e.keyCode === 68) { // Left arrow key, Right arrow key, A key, D key
        settings.RIGHT = false;
    } else if (e.keyCode === 65 || e.keyCode === 37) {
        settings.LEFT = false;
    } else if ((e.keyCode === 27 || e.keyCode === 13 || e.keyCode === 32)
        && changeUsernamePrompt.classList.contains("hidden")) { // pause the game
        togglePause();
    }
}

const mobileTouchLeft = document.getElementById("mobile-touch-left");
const mobileTouchRight = document.getElementById("mobile-touch-right");

mobileTouchLeft.addEventListener("touchstart", () => {
    settings.LEFT = true;
});

mobileTouchLeft.addEventListener("touchend", () => {
    settings.LEFT = false;
});

mobileTouchRight.addEventListener("touchstart", () => {
    settings.RIGHT = true;
});

mobileTouchRight.addEventListener("touchend", () => {
    settings.RIGHT = false;
});

function resetGlobalVariables() {
    settings.enemyDisabled = false;
    settings.platforms = [];
    settings.enemies = [];
    settings.clouds = [];
    settings.gravity = 1;
    settings.player.ySpeed = 3;
    settings.player.xSpeed = 0;
    startNewGame();
}

function drawScores() {
    //  Score
    global.c.font = `${60 * global.scaleRatio}px IBMPlexSans-Bold`;
    global.c.fillStyle = "orange";
    global.c.textAlign = "center";
    global.c.lineWidth = 4 * global.scaleRatio;
    global.c.fillText(settings.score, global.canvas.width / 2, 50 * global.scaleRatio);
    global.c.strokeText(settings.score, global.canvas.width / 2, 50 * global.scaleRatio);
    //  HighScore
    global.c.font = `${30 * global.scaleRatio}px IBMPlexSans-Bold`;
    global.c.fillStyle = "yellow";
    global.c.textAlign = "center";
    global.c.lineWidth = 2 * global.scaleRatio;
    global.c.fillText(settings.highScore, global.canvas.width / 2, 100 * global.scaleRatio);
    global.c.strokeText(settings.highScore, global.canvas.width / 2, 100 * global.scaleRatio);
}
document.onkeydown = keyDown;
document.onkeyup = keyUp;

// Generates a random uid for the user.
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
    const username = global.defaultUsername;
    let newUsername;

    if (username === undefined || username === null) {
        newUsername = global.defaultUsername;
    } else if (username.length > global.maximumUsernameLength) {
        newUsername = username.slice(0, 10);
    } else if (username.length < global.minimumUsernameLength) {
        newUsername = global.defaultUsername;
    }

    try {
        set(ref(db, `users/${newToken}`), {
            username: newUsername || username || global.defaultUsername,
            highScore: settings.highScore,
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

const changeUsernamePrompt = document.querySelector(".game__username-prompt");
const changeUsernamePromptInput = document.querySelector("#username-input");

const changeUsernamePromptSubmit = document.querySelector("#username-submit");
const changeUsernamePromptCancel = document.querySelector("#username-cancel");

async function changeUsername() {
    /* changeUsernamePromptInput.value = ""; */
    if (changeUsernamePrompt.classList.contains("hidden")) {
        changeUsernamePrompt.classList.remove("hidden");
        global.gameMenu.classList.add("hidden");
        global.gameWindow.classList.remove("hidden");
        global.gameMenuBar.classList.add("hidden");
    }
    const db = getDatabase();
    const getUserDatabase = await getFromDatabase();

    let newUsername = "";
    const userToken = localStorage.getItem("user");
    const foundUser = getUserDatabase.find((user) => user.id === userToken);
    newUsername = foundUser.username;
    changeUsernamePromptInput.value = newUsername;
    changeUsernamePromptInput.focus();
    if (localStorage.getItem("user") !== null || localStorage.getItem("user") !== undefined) {
        changeUsernamePromptSubmit.addEventListener("click", () => {
            changeUsernamePrompt.classList.add("hidden");
            global.gameMenu.classList.remove("hidden");
            global.gameWindow.classList.add("hidden");
            global.gameMenuBar.classList.remove("hidden");
            newUsername = changeUsernamePromptInput.value;
            if (newUsername.length > 1 && newUsername.length <= 10) {
                updateUsername(userToken, newUsername, db);
            } else {
                console.log("Username is too long or too short");
            }
        });

        changeUsernamePromptCancel.addEventListener("click", () => {
            changeUsernamePrompt.classList.add("hidden");
            global.gameMenu.classList.remove("hidden");
            global.gameWindow.classList.add("hidden");
            global.gameMenuBar.classList.remove("hidden");
            newUsername = changeUsernamePromptInput.value;
        });
    } else {
        console.log("Could not change username");
    }
}
global.changeUsernameButton.addEventListener("click", () => {
    changeUsername();
});

const audioSwitch = document.querySelector("#audio-on-off");
const audioIcon = document.querySelector(".menu-bar__audio-image");

const musicSwitch = document.querySelector("#music-on-off");
const musicIcon = document.querySelector(".menu-bar__music-image");

function toggleAudio() {
    if (settings.audioEnabled) {
        audioSwitch.classList.remove("on");
        audioSwitch.classList.add("off");
        settings.audioEnabled = false;
        audioIcon.src = "./assets/audio-off.png";
    } else {
        audioSwitch.classList.remove("off");
        audioSwitch.classList.add("on");
        settings.audioEnabled = true;
        audioIcon.src = "./assets/audio-on.png";
    }
}

function toggleMusic() {
    if (settings.musicEnabled) {
        musicSwitch.classList.remove("on");
        musicSwitch.classList.add("off");
        settings.musicEnabled = false;
        musicIcon.src = "./assets/music-off.png";
    } else {
        musicSwitch.classList.remove("off");
        musicSwitch.classList.add("on");
        settings.musicEnabled = true;
        musicIcon.src = "./assets/music-on.png";
    }
}

audioSwitch.addEventListener("click", (e) => {
    toggleAudio();
    console.log("audio clicked", e);
});

musicSwitch.addEventListener("click", (e) => {
    toggleMusic();
    if (settings.musicEnabled) {
        global.backgroundMusic.play();
    } else {
        global.backgroundMusic.pause();
    }
    console.log("music clicked", e);
});

global.pauseGameButton.addEventListener("click", () => {
    togglePause();
});

global.resumeGameButton.addEventListener("click", () => {
    togglePause();
});

global.goToMainMenuButton.addEventListener("click", () => {
    goToMainMenu();
});

global.pausedChangeUsernameButton.addEventListener("click", () => {
    changeUsername();
});

/* function togglePause() {
    if (settings.gamePaused) {
        settings.gamePaused = false;
        pauseGameButton.innerHTML = "Pause";
        pauseGameContainer.classList.add("hidden");
        if (settings.musicEnabled) {
            global.backgroundMusic.play();
        } else if (settings.audioEnabled) {
            playSound("resumeGame", 0.5);
        }
    } else {
        settings.gamePaused = true;
        pauseGameButton.innerHTML = "Resume";
        pauseGameContainer.classList.remove("hidden");
        global.backgroundMusic.pause();
        playSound("pauseGame", 0.5);
    }
} */

function goToMainMenu() {
    global.gameWindow.classList.add("hidden");
    global.gameMenu.classList.remove("hidden");
    global.canvas.classList.remove("hidden");
}
