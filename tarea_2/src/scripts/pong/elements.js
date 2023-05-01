function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Paddle {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
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
  
    moveUp() {
        this.y -= 10;
    }
  
    moveDown() {
        this.y += 10;
    }

}

class Ball {
    constructor(x, y, radius, color) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.dx = 4.0; // x velocity
      this.dy = getRandomNumber(-5, 5); // y velocity
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

        if (this.x > canvas.width - this.radius || this.x < this.radius) {
            // Game over
            return false;
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

        if ((hitRight && insideHeightRight) || 
            (hitLeft && insideHeightLeft)) {
            this.dx = -(this.dx * 1.02);
        }

        console.log(this.dx);

        return true;
    }
  }