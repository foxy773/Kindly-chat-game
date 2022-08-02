import * as global from "../global.js";
import settings from "../settings.js";

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
        global.c.drawImage(this.image, this.x, this.y);
    }

    update() {
        this.x -= this.xSpeed * global.scaleRatio;
        if (settings.clouds.every((cloud) => cloud.x < global.cloudDistanceBetween)) {
            this.x = global.canvas.width + (100 * global.scaleRatio);
        }
    }
}

export default Cloud;
