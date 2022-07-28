import * as global from "./../global.js";
import { settings } from "./../settings.js";

class Player {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.width = global.playerWidth;
        this.height = global.playerHeight;
        this.ySpeed = 3 * global.scaleRatio;
        this.xSpeed = 0;
    }

    show() {
        // Draw a circle at the player's position / makes the player a circle.
        global.c.beginPath();
        global.c.arc(this.x + 15 * global.scaleRatio, this.y, this.r, 0, (2 * Math.PI), false);
        global.c.fillStyle = "#1cd300"; // Kindly green

        global.c.closePath();
        global.c.fill();
        global.c.stroke();
        if (settings.currentPlayerFace === "default") {
            global.c.drawImage(global.playerFace[0].image, this.x + 5 * global.scaleRatio, this.y - 10 * global.scaleRatio, this.height, this.width);
        } else if (settings.currentPlayerFace === "hurt") {
            global.c.drawImage(global.playerFace[1].image, this.x + 5 * global.scaleRatio, this.y - 10 * global.scaleRatio, this.height, this.width);
        } else if (settings.currentPlayerFace === "shocked") {
            global.c.drawImage(global.playerFace[2].image, this.x + 5 * global.scaleRatio, this.y - 10 * global.scaleRatio, this.height, this.width);
        }
    }

    update() {
        this.x += this.xSpeed; // Move the player on the x-axis.

        // When player exits the screen, move them back to the other side of the screen.
        if (this.x < 0 - this.width) {
            this.x = global.canvas.width + this.width;
        } else if (this.x > global.canvas.width + this.width) {
            this.x = 0 - this.width;
        }
    }
}

export default Player;