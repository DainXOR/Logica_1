function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pickRandom(...choices){
    const choice = Math.round(getRandomNumber(0, choices.length - 1));
    return choices[choice];
}
function getRandomAvoid(min, max, ...toAvoid){
    const avoidArray = [...toAvoid];
    let value = 0;
    do{
        value = getRandomNumber(min, max);
    }while(avoidArray.includes(value));

    return value;
}

class Paddle {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.move = 0;
        this.width = width;
        this.height = height;
        this.color = color;
    }
  
    draw(ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    update(canvas, moveDirection){

        this.move = 10 - (10 * moveDirection);

        if (!((this.y > canvas.height - this.height && this.move > 0) || (this.y < 0 && this.move < 0))){
            this.y += this.move;
        }

    }

}

class Ball {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dx = pickRandom(-3, 3); // x velocity
        this.dy = getRandomAvoid(-4, 4, 0); // y velocity
    }
  
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
  
    update(canvas, paddleL, paddleR) {
        // Check if ball hits the walls
        this.x += this.dx;
        this.y += this.dy;


        if (this.x > canvas.width - this.radius || this.x < 0) {
            // Game over
            return [false, (this.x > 0) + ((this.x < 0) * 2)];
        }
        else if (this.y > canvas.height - this.radius || 
                this.y < this.radius){
            this.dy = -this.dy;
        }

        const rightBorder = this.x + this.radius;
        const leftBorder = this.x - this.radius;

        const hitRight = rightBorder >= paddleR.x && rightBorder <= paddleR.x + paddleR.width;
        const insideHeightRight = this.y >= paddleR.y && this.y <= (paddleR.y + paddleR.height);

        const hitLeft = leftBorder <= paddleL.x + paddleL.width && leftBorder >= paddleL.x;
        const insideHeightLeft = this.y >= paddleL.y && this.y <= (paddleL.y + paddleL.height);

        if ((hitRight && insideHeightRight) || (hitLeft && insideHeightLeft)) {
            let multiplier = Math.abs(this.dx) <= 20? 1.01 : 1;
            this.dx = -(this.dx * multiplier);

            this.dy += ((hitRight * paddleR.move) + (hitLeft * paddleL.move)) * 0.3;

        }

        return [true, 0];
    }
  }