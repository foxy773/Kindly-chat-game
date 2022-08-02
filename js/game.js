import {
    getDatabase, ref, update,
    // eslint-disable-next-line import/no-unresolved, import/extensions
} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";

import * as global from "./global.js";
import settings from "./settings.js";
import {
    startNewGame, togglePause, appendHighscores, gameOver, getFromDatabase, generateEnemies, generatePlatforms,
} from "./gameUtils.js";

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

// Updates the game every frame.

let lastFrameTime = 0;

function updateGame(timestamp) {
    if (timestamp < lastFrameTime + (global.interval)) {
        window.requestAnimationFrame(updateGame);
        return;
    }
    settings.delta += timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    while (settings.delta >= global.interval) {
        if (!settings.gamePaused) {
            updateItems(global.interval);
        }
        settings.delta -= global.interval;
    }

    if (settings.RIGHT) {
        settings.player.xSpeed = global.playerXSpeed;
    } else if (settings.LEFT) {
        settings.player.xSpeed = 0 - global.playerXSpeed;
    } else {
        settings.player.xSpeed = 0;
    }

    if (!settings.gamePaused) {
        draw();
    }
    window.requestAnimationFrame(updateGame);
}

function draw() {
    global.c.fillStyle = "lightblue";
    global.c.fillRect(0, 0, global.canvas.width, global.canvas.height);

    for (let i = 0; i < settings.clouds.length; i += 1) {
        settings.clouds[i].show();
    }

    for (let i = 0; i < settings.platforms.length; i += 1) {
        settings.platforms[i].show();
    }

    for (let i = 0; i < settings.enemies.length; i += 1) {
        settings.enemies[i].show();
    }

    settings.player.show();
    drawScores();
}

function updateItems(dt) {
    for (let i = 0; i < settings.clouds.length; i += 1) {
        settings.clouds[i].update();
    }

    for (let i = 0; i < settings.platforms.length; i += 1) {
        settings.platforms[i].update();
    }

    for (let i = 0; i < settings.enemies.length; i += 1) {
        settings.enemies[i].update();
    }
    settings.player.update();
    settings.player.ySpeed += settings.gravity * dt * global.scaleRatio;

    settings.lastIndex = settings.platforms.map((platform) => platform.visible).lastIndexOf(false);
    if (settings.platforms[settings.lastIndex]?.y < settings.player.y - 500 * global.scaleRatio || settings.platforms[0].y < settings.player.y - 500 * global.scaleRatio) {
        gameOver();
    }
    if (settings.gameOver) {
        gameOver();
        settings.gameOver = false;
    }
    if (settings.generateEnemies) {
        generateEnemies();
        settings.generateEnemies = false;
    }
    if (settings.generatePlatforms) {
        generatePlatforms();
        settings.generatePlatforms = false;
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

function goToMainMenu() {
    global.gameWindow.classList.add("hidden");
    global.gameMenu.classList.remove("hidden");
    global.canvas.classList.remove("hidden");
}
