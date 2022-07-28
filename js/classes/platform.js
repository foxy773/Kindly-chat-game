import * as global from "./../global.js";
import { settings } from "./../settings.js";
import { playSound, updateScore, generateplatforms} from "./../gameUtils.js";

class Platform {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.width = global.platformWidth;
        this.height = global.platformHeight;
        this.ySpeed = 3 * global.scaleRatio;
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
            global.c.drawImage(this.image[4], this.x, this.y, this.width, this.height);
        } else if (this.visible && this.oneJumpOnly === false && this.hasSpring === false) {
            // Draws the normal platform.
            /* c.drawImage(this.x, this.y, this.width, ); */
            global.c.drawImage(this.image[0], this.x, this.y, this.width, this.height);
        } else if (this.visible && this.oneJumpOnly) {
            // Draws the platform that only allows the player to jump once.
            global.c.drawImage(this.image[1], this.x, this.y, this.width, this.height);
        } else if (this.visible && this.hasSpring) {
            // Draws the platform that has a spring.
            global.c.drawImage(this.image[2], this.x, this.y, this.width, this.height);
        }

        if (this.broken) {
            // Draws the broken platform.
            global.c.clearRect(this.x, this.y, this.width, this.height);
            global.c.fillRect(this.x, this.y, this.width, this.height);
            /*             c.fillStyle = "red"; */
            global.c.drawImage(this.image[3], this.x, this.y, this.width, this.height);
        }
    }

    update() {
        // Removes the platforms that are below the player and out of frame
        if (this.y > global.canvas.height + (150 * global.scaleRatio)) {
            this.visible = false;
        }

        // If the platform is above the player.
        if (settings.player.y < this.y - (21 * global.scaleRatio)) {
            this.wasAbove = true;
        }

        // Collision Detection between player and platform
        if (settings.player.x < this.x + this.width && settings.player.x + settings.player.width > this.x
            && settings.player.y < this.y + this.height
            && settings.player.y + settings.player.height > this.y
            && this.wasAbove && this.visible
            && settings.player.ySpeed > 0
            && this.broken === false) {
            settings.player.ySpeed = global.defaultJumpHeight;// The player speed on the y-axis upon collision.
            playSound("playerJump", 0.5);
            updateScore();

            settings.currentPlayerFace = "hurt";

            settings.enemyDisabled = false;
            if (this.oneJumpOnly && this.broken === false) {
                this.broken = true;
                playSound("woodPlatformBreakes", 1);
            } else if (this.hasSpring) {
                settings.player.ySpeed = global.springJumpHeight;
                settings.enemyDisabled = true;
                playSound("launchPlatform", 0.5);
            }
        }

        // Auto generates platforms and additions the level + 1
        // If the player is above the 10th platform from the bottom.
        if (settings.player.y < settings.platforms[settings.platforms.length - 10].y) {
            generateplatforms();
            /*  console.log("Generate new platforms", this.ySpeed, "ySpeed") */
        }

        if (settings.player.ySpeed >= 0) {
            settings.currentPlayerFace = "default";
        } else if (settings.player.ySpeed < -500 * global.scaleRatio) {
            settings.currentPlayerFace = "shocked";
        }

        this.y -= settings.player.ySpeed * 0.03;
    }
}

export default Platform;