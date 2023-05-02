const paddleHight = 150;
const paddleWidth = 20;

const borderDistance = 10;
const borderLeftDistance = borderDistance;
const borderRightDistance = paddleWidth + borderDistance;

const BALLS_MAX = 10;
const BALL_GEN_RATE = 500;

let playerScores = [0, 0];

let ballCount = 0;

function getRandomColor() {
    let letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    // color += "A7"; // Opacity 
    return color;
}
function generateBall(canvas, context){

    let ball = new Ball(canvas.width / 2, canvas.height / 2, 10, getRandomColor());
    ball.draw(context);
    return ball;
}

function addScore(playerNumber){ // if statement is python slow, array indexing better <3
    playerScores[--playerNumber]++;

    let scoreP1 = document.getElementById("score-player-1");
    let scoreP2 = document.getElementById("score-player-2");

    scoreP1.innerHTML = "Puntaje jugador 1: " + playerScores[0];
    scoreP2.innerHTML = "Puntaje jugador 2: " + playerScores[1];
}

function update(paddleLeftObj, paddleRightObj, ballList, keyPresses, canvas) {

    for(const key in keyPresses){
        if(!keyPresses[key]){
            continue;
        }

        switch(key){
            case "w":
                paddleLeftObj.update(canvas, 2);
                continue;
            case "s":
                paddleLeftObj.update(canvas, 0);
                continue;

            case "ArrowUp":
                paddleRightObj.update(canvas, 2);
                continue;
            case "ArrowDown":
                paddleRightObj.update(canvas, 0);
                continue;

            default:
                paddleLeftObj.update(canvas, 1);
                paddleRightObj.update(canvas, 1);
                continue;
        }
    }

    for(let i = 0; i < ballList.length; i++){
        const result = ballList[i].update(canvas, paddleLeftObj, paddleRightObj);
        if(!result[0]){
            ballList.splice(i, 1);
            ballCount--;
            addScore(result[1])
            continue;
        }
    }

    paddleLeftObj.update(canvas, 1);
    paddleRightObj.update(canvas, 1);
    return ballCount != 0;
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
function loop(paddleLeft, paddleRight, balls, keyPresses, canvas, context) {
    const state = update(paddleLeft, paddleRight, balls, keyPresses, canvas);
    clear(context, canvas);
    draw(context, paddleLeft, paddleRight, ...balls);

    return state;
}
function updateBallAmount(element, count){
    element.innerHTML = count;

    switch(count){
        case 2: element.style.color = '#fff'; break;
        case 3: 
        case 4: element.style.color = '#ff0'; break;
        case 5:
        case 7: element.style.color = '#f90'; break;
        case 8:
        case 9: element.style.color = '#f30'; break;
        case 10: element.style.color = '#f00'; break;
        default: break;
    }

}

document.addEventListener("DOMContentLoaded", ()=>{
    let canvas = document.getElementById('pong-canvas');
    let context = canvas.getContext('2d');
    let keyEventQueue = {};

    let paddleLeft = new Paddle(borderLeftDistance, (canvas.height / 2) - (paddleHight / 2), 
                                paddleWidth, paddleHight, 'white');
    let paddleRight = new Paddle(canvas.width - borderRightDistance, canvas.height / 2 - (paddleHight / 2), 
                                paddleWidth, paddleHight, 'white');

    paddleLeft.draw(context);
    paddleRight.draw(context);

    window.addEventListener('keydown', function (event) {
        if(event.key === "w" || event.key === "s" || event.key === "ArrowUp" || event.key === "ArrowDown"){
            keyEventQueue[event.key] = true;
        }else{
            keyEventQueue[0] = true;
        }
    });
    
    window.addEventListener('keyup', function (event) {
        if(event.key === "w" || event.key === "s" || event.key === "ArrowUp" || event.key === "ArrowDown"){
            keyEventQueue[event.key] = false;
        }else{
            keyEventQueue[0] = false;
        }
    });

    let ballAmout = document.getElementById("ball-record-text");

    let ballsArray = [generateBall(canvas, context)];
    ballCount = 1;

    let ballTimer = 0;

    function loopWrap(){
        updateBallAmount(ballAmout, ballCount);
        

        if(loop(paddleLeft, paddleRight, ballsArray, keyEventQueue, canvas, context)){
            if(ballCount < BALLS_MAX && ballTimer >= BALL_GEN_RATE){
                ballsArray.push(generateBall(canvas, context));
                ballTimer = 0;
                ballCount++;
            }

            ballTimer++;
            requestAnimationFrame(loopWrap);
        } else { // Idk man, this feels wrong
            function restartGame(event){
                if(event.key === " "){
                    window.removeEventListener('keydown', restartGame);
                    ballsArray = [generateBall(canvas, context)];
                    ballCount = 1;
                    ballTimer = 0
                    playerScores = [0, 0];
                    addScore(3);
                    loopWrap();
                }
            }
            if(playerScores[0] > playerScores[1]){
                ballCount = "Jugador 1 gana!";
            }else if (playerScores[0] < playerScores[1]){
                ballCount = "Jugador 2 gana!";
            } else {
                ballCount = "Empate!";
            }
            updateBallAmount(ballAmout, ballCount);

            window.addEventListener('keydown', restartGame);
        }
    }

    function startGame(event){
        if(event.key === " "){
            window.removeEventListener('keydown', startGame);
            loopWrap();
        }
    }
    
    window.addEventListener('keydown', startGame);

});