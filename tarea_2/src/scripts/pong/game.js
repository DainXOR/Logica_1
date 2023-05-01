const paddleHight = 150;
const paddleWidth = 20;

const borderDistance = 10;
const borderLeftDistance = borderDistance;
const borderRightDistance = paddleWidth + borderDistance;

function update(ballObj, paddleLeftObj, paddleRightObj, keyPresses, canvas) {

    for(const key in keyPresses){
        if(!keyPresses[key]){
            continue;
        }

        switch(key){
            case "w":
                paddleLeftObj.moveUp();
                continue;
            case "s":
                paddleLeftObj.moveDown();
                continue;

            case "ArrowUp":
                paddleRightObj.moveUp();
                continue;
            case "ArrowDown":
                paddleRightObj.moveDown();
                continue;

            default:
                continue;
        }
    }
    
    return ballObj.update(canvas, paddleLeftObj, paddleRightObj);


}

function draw(context, ...toDraw){
    for(let i = 0; i < toDraw.length; i += 1){
        toDraw[i].draw(context);
    }

    return;
}
function clear(context, canvas){
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function loop(b, pl, pr, kp, cv, ctx) {
    const state = update(b, pl, pr, kp, cv);
    clear(ctx, cv);
    draw(ctx, b, pl, pr);

    return state;
}

document.addEventListener("DOMContentLoaded", ()=>{
    let canvas = document.getElementById('pong-canvas');
    let context = canvas.getContext('2d');
    let keyEventQueue = {};

    let ball = new Ball(canvas.width / 2, canvas.height / 2, 10, 'red');
    let paddleLeft = new Paddle(borderLeftDistance, (canvas.height / 2) - (paddleHight / 2), 
                                paddleWidth, paddleHight, 'white');
    let paddleRight = new Paddle(canvas.width - borderRightDistance, canvas.height / 2 - (paddleHight / 2), 
                                paddleWidth, paddleHight, 'white');

    ball.draw(context);
    paddleLeft.draw(context);
    paddleRight.draw(context);

    window.addEventListener('keydown', function (event) {
        keyEventQueue[event.key] = true;
    });
    
    window.addEventListener('keyup', function (event) {
        keyEventQueue[event.key] = false;
    });

    function loopWrap(){
        if(loop(ball, paddleLeft, paddleRight, keyEventQueue, canvas, context)){
            //requestAnimationFrame(loopWrap);
        }

        requestAnimationFrame(loopWrap);
    }

    loopWrap();

});

