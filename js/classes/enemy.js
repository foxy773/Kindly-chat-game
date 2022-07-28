import * as global from "./../global.js";
import { settings } from "./../settings.js";
import { playSound, updateScore, gameOver, resetGlobalVariables, generateEnemies} from "./../gameUtils.js";

function getDistance(x1, y1, x2, y2) {
    const xDis = x2 - x1;
    const yDis = y2 - y1;
    return Math.sqrt(xDis ** 2 + yDis ** 2);
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = global.enemyRadius;
        this.width = global.enemyWidth;
        this.height = global.enemyHeight;
        this.color = "red";
        this.ySpeed = 3 * global.scaleRatio;
        this.xSpeed = 6 * global.scaleRatio;
        this.visible = true;
        this.wasAbove = false;
        this.rotating = true;
        this.rotation = 90;
        this.chance = Math.floor(Math.random() * 100); // Not used
    }

    get moving() {
        return this.xSpeed || this.ySpeed;
    }

    show() {
        if (settings.enemyDisabled === false) {
            global.c.translate(this.x + 15 * global.scaleRatio, this.y);
            global.c.rotate(this.rotation);
            global.c.translate(-(this.x), -(this.y));
            global.c.drawImage(global.images.enemy[0], (this.x - this.r), (this.y - this.r), this.width, this.height);
            global.c.setTransform(1, 0, 0, 1, 0, 0);
        } else {
            global.c.translate(this.x, this.y);
            global.c.translate(-(this.x), -(this.y));
            global.c.drawImage(global.images.enemy[1], this.x, this.y, this.width, this.height);
            global.c.setTransform(1, 0, 0, 1, 0, 0);
        }
    }

    update() {
        // Removes the enemies that are below the player and out of frame
        if (this.y > global.canvas.height + (200 * global.scaleRatio)) {
            this.visible = false;
        }

        // If the enemy is above the player.
        if (settings.player.y < this.y - (21 * global.scaleRatio)) {
            this.wasAbove = true;
        }

        // Collision Detection between player and enemies
        const distanceBetweenPlayerEnemy = getDistance(this.x, this.y, settings.player.x, settings.player.y);

        if (distanceBetweenPlayerEnemy < this.r + settings.player.r && this.visible === true && settings.enemyDisabled === false) {
            gameOver();
            console.log("Died by enemy", this);
        }

        if (this.moving && settings.enemyDisabled === false) {
            this.x += this.xSpeed;
            if (this.x > global.canvas.width - this.width) {
                this.xSpeed -= 6 * global.scaleRatio;
            } else if (this.x < 0) {
                this.xSpeed = 6 * global.scaleRatio;
            }
        }

        // Auto generates platforms and additions the level + 1
        // If the player is above the 10th platform from the bottom.
        if (settings.player.y < settings.enemies[settings.enemies.length - 5].y) {
            generateEnemies();
        }

        // Counteracts the falling of the player to help the illusion of the player jumping
        this.y -= settings.player.ySpeed * 0.03;

        // Rotates the enemy
        this.rotation += 0.1;
    }
}

export default Enemy;