export const canvas = document.getElementById("game");
export const c = canvas.getContext("2d");
/* export export constkindlyFont = new FontFace('IBMPlexSans', 'url("../fonts/IBMPlexSans-Bold.ttf")');
export export constgameContainer = document.querySelector('.game-window'); */
export const gameMenu = document.querySelector(".game-window__menu");
export const gameWindow = document.querySelector(".game-window__game");
export const startGameButton = document.querySelector("#start-game");
export const highscoreList = document.getElementById("highscore-list");
export const changeUsernameButton = document.getElementById("change-username");
export const gameMenuBar = document.querySelector(".game__menu-bar");
export const audioSwitch = document.querySelector("#audio-on-off");
export const audioIcon = document.querySelector(".menu-bar__audio-image");
export const pauseGameButton = document.querySelector("#pause-game");
export const resumeGameButton = document.querySelector("#paused-resume-game");
export const pauseGameContainer = document.querySelector(".game__pause-container");
export const goToMainMenuButton = document.querySelector("#paused-to-main-menu");
export const pausedChangeUsernameButton = document.querySelector("#paused-change-username");

export const musicSwitch = document.querySelector("#music-on-off");
export const musicIcon = document.querySelector(".menu-bar__music-image");

export const worldElem = document.querySelector("[data-world]");

// Scaling the canvas to the screen.
export const WORLD_WIDTH = 600;
export const WORLD_HEIGHT = 600;

export const scaleRatio = setPixelToWorldScale();

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

// platform / Platform attributes
export const platformHeight = 15 * scaleRatio;
export const platformWidth = 60 * scaleRatio;
export const distanceBetweenPlatforms = 100 * scaleRatio;
export const numberOfplatforms = 100;
export const firstPlatformWidth = 1000 * scaleRatio;
export const firstPlatformHeight = 800 * scaleRatio;

// Enemies / Enemy attributes
export const enemyRadius = 20 * scaleRatio;
export const enemyHeight = enemyRadius * 2;
export const enemyWidth = enemyRadius * 2;
export const enemyDistanceBetween = 400 * scaleRatio;

// Clouds / Cloud attributes
export const cloudHeight = 100 * scaleRatio;
export const cloudWidth = 200 * scaleRatio;
export const cloudMinSpeed = 1;
export const cloudMaxSpeed = 1.2;
export const cloudDistanceBetween = -400 * scaleRatio;
export const numberOfClouds = 20;

// General game attributes
export const fps = 60;
export const interval = 1000 / fps;
export const defaultJumpHeight = -400 * scaleRatio;
export const springJumpHeight = -2000 * scaleRatio;
export const maximumUsernameLength = 10;
export const minimumUsernameLength = 1;
export const defaultUsername = "Anonymous";
export const databaseDocumentName = "users";

// Audio
export const music = "../sounds/Bicycle.mp3";
export const backgroundMusic = new Audio(music);

// Global Variables.

canvas.width = WORLD_WIDTH * scaleRatio;
canvas.height = WORLD_HEIGHT * scaleRatio;

// Player / Character attributes.
export const playerRadius = 20 * scaleRatio;

export const playerHeight = playerRadius;
export const playerWidth = playerRadius + 10;

export const playerStartX = 300 * scaleRatio;
export const playerStartY = 400 * scaleRatio;

export const playerXSpeed = 7 * scaleRatio;

function createImage(path) {
    const image = new Image();
    image.src = path;
    return image;
}

export const images = {
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

export const playerFace = [
    { expression: "default", eyes: "open", image: images.player[0] },
    { expression: "hurt", eyes: "closed", image: images.player[1] },
    { expression: "shocked", eyes: "open", image: images.player[2] },
];
