import {
    getDatabase, ref, set, update, get,
    // eslint-disable-next-line import/no-unresolved, import/extensions
} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";
import * as global from "./global.js";
import { settings } from "./settings.js";
import Platform from "./classes/platform.js";
import Enemy from "./classes/enemy.js";
import Player from "./classes/player.js";
import Cloud from "./classes/cloud.js";


export function playSound(audio, soundVolume) { // Plays sounds based on method call strings
    const playerJump = "../sounds/SFX_Jump_42.wav";
    const woodPlatformBreakes = "../sounds/stick-breaking.wav";
    const launchPlatform = "../sounds/mixkit-fast-rocket-whoosh.wav";
    const pauseGame = "../sounds/pause-game.mp3";
    const resumeGame = "../sounds/resume-game.mp3";
    if (audio === "playerJump") {
        audio = new Audio(playerJump);
        audio.volume = soundVolume;
    } else if (audio === "woodPlatformBreakes") {
        audio = new Audio(woodPlatformBreakes);
        audio.volume = soundVolume;
    } else if (audio === "launchPlatform") {
        audio = new Audio(launchPlatform);
        audio.volume = soundVolume;
    } else if (audio === "pauseGame") {
        audio = new Audio(pauseGame);
        audio.volume = soundVolume;
    } else if (audio === "resumeGame") {
        audio = new Audio(resumeGame);
        audio.volume = soundVolume;
    }
    if (settings.audioEnabled) {
        audio.play("");
    }
}

export const updateScore = () => {
    settings.score = settings.platforms.filter((platform) => platform.visible === false).length + 2;
};

export function gameOver() {
    if (settings.highScore < settings.score || settings.highScore === undefined) {
        settings.highScore = settings.score;
        registerNewHighScore(settings.highScore);
    }

    resetGlobalVariables();
    console.log("GAME OVER!");
}

export function resetGlobalVariables() {
    settings.enemyDisabled = false;
    settings.platforms = [];
    settings.enemies = [];
    settings.clouds = [];
    settings.gravity = 1;
    settings.player.ySpeed = 3;
    settings.player.xSpeed = 0;
    startNewGame();
}

// Generates the platforms.
export function generateplatforms() {
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
}

export function generateEnemies() {
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
}

// Starts a new game.
export function startNewGame() {
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
}

// Checks if the user already exists in the database

async function findUser() {
    let userStoredHighscore;
    const userToken = localStorage.getItem("user");
    const storedHighscores = await getFromDatabase();
    console.log(storedHighscores, "storedHighscores");
    if (storedHighscores === undefined || storedHighscores === null || storedHighscores === []) {
        console.log("No highscores found");
        settings.highScore = 0;
    } else {
        userStoredHighscore = storedHighscores.find((user) => user.id === userToken);
        settings.highScore = userStoredHighscore.highScore;
        console.log("foundUser and got highscore");
    }
}

export async function appendHighscores() {
    const appendableHighscores = await getFromDatabase() || undefined;
    global.highscoreList.innerHTML = "";
    if (appendableHighscores !== undefined) {
        let i = 0;
        appendableHighscores.forEach((user) => {
            const userToken = localStorage.getItem("user");
            // Create a new list item with a text node
            const highscoreItem = document.createElement("li");
            const highscoreName = document.createElement("span");
            const highscoreScore = document.createElement("span");

            highscoreItem.classList.add("score-board__item");
            highscoreName.classList.add("score-board__item-name");
            highscoreScore.classList.add("score-board__item-highscore");

            let you = "";
            if (user.id === userToken) {
                you = "(You)";
                highscoreItem.id = "you";
            }

            if (i === 0) {
                highscoreName.textContent = `${you} 🥇 ${user.username}`;
            } else if (i === 1) {
                highscoreName.textContent = `${you} 🥈 ${user.username}`;
            } else if (i === 2) {
                highscoreName.textContent = `${you} 🥉 ${user.username}`;
            } else {
                highscoreName.textContent = `${i + 1}. ${you} ${user.username}`;
            }

            /* highscoreName.textContent = user.username; */
            highscoreScore.textContent = user.highScore;

            highscoreItem.appendChild(highscoreName);
            highscoreItem.appendChild(highscoreScore);
            global.highscoreList.appendChild(highscoreItem);
            i += 1;
        });
    }
}

function generateBackground() {
    generateClouds();
}

function generateClouds() {
    for (let i = 0; i < global.numberOfClouds; i += 1) {
        const cl = new Cloud(
            getRandomNumber(global.canvas.width - 500, global.canvas.width + (5000 * global.scaleRatio)),
            getRandomNumber(0 - global.canvas.height, global.canvas.height + (300 * global.scaleRatio)),
            global.cloudHeight,
            global.cloudWidth,
            getRandomNumber(global.cloudMinSpeed, global.cloudMaxSpeed),
            global.images.clouds[getRandomNumber(0, global.images.clouds.length - 1)],
        );
        settings.clouds.push(cl);
    }
}

// Gets a random number between two numbers.
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Gets all the users from the database.

export async function getFromDatabase() {
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

export function togglePause() {
    if (settings.gamePaused) {
        settings.gamePaused = false;
        global.pauseGameButton.innerHTML = "Pause";
        global.pauseGameContainer.classList.add("hidden");
        if (settings.musicEnabled) {
            global.backgroundMusic.play();
        } else if (settings.audioEnabled) {
            playSound("resumeGame", 0.5);
        }
    } else {
        settings.gamePaused = true;
        global.pauseGameButton.innerHTML = "Resume";
        global.pauseGameContainer.classList.remove("hidden");
        global.backgroundMusic.pause();
        playSound("pauseGame", 0.5);
    }
}