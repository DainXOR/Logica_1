let publisher = new EventPublisher();

let player = new PlayerEntity();
publisher.subscribe(player, "mousemove");

let e1 = new EnemyEntity(player, new Vector3(500, 500), 8, 10);
let e2 = new EnemyEntity(player, new Vector3(0, 500), 5, 15);
let e3 = new EnemyEntity(player, new Vector3(500), 12, 3);


function generateEnemies(amount){
    let enemies = [];
    for (let i = 0; i < amount; i++) {
        let x = getRandomNumber(0, 1000);
        let y = getRandomNumber(0, 1000);

        let speed = getRandomNumber(1, 14);
        let radius = getRandomNumber(5, 50);

        enemies.push(new EnemyEntity(player, new Vector3(x, y), speed, radius));        
    }
    return enemies;
}


let enemies = generateEnemies(5);



document.addEventListener("keypress", (event) => {
    publisher.newEvent(new GameEvent("keypress", event));

    if(event.key === "s"){
        publisher.startNotifications();
        console.log("Notifications enabled!");
    }
    if(event.key === "p"){
        publisher.stopNotifications();
        console.log("Notifications stopped!");
    }

    if(event.key === "i"){
        console.log("In queue: " + publisher.events.events.length);
        console.log("Events: " + publisher.events.events);
    }
});

function draw(pos, ctx) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
}

function clear(context, canvas){
    context.clearRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener("DOMContentLoaded", () => {

    let cnv = document.getElementById("game_screen");
    let ctx = cnv.getContext('2d');

    cnv.addEventListener("mousemove", (event) => {
        publisher.newEvent(new GameEvent("mousemove", new Vector3(event.x, event.y, 0)));
    });
    
    let lastTime = 0;
    let deleteEnemy = [];

    function gameLoop(time){
        dt = time - lastTime;
        lastTime = time;
    
        clear(ctx, cnv);

        player.update(dt * 0.01);
        player.draw(ctx);
        for (let i = 0; i < enemies.length; i++) {
            let e = enemies[i];

            e.update(dt * 0.01);
            e.draw(ctx);

            if(!e.isAlive()){
                deleteEnemy.push(i);
            }
            
        };
        
        if(deleteEnemy.length > 0){
            let aux = [];
            for (let i = 0; i < deleteEnemy.length; i++) {
                if(!deleteEnemy.includes(i)){
                    aux.push(enemies[i]);
                }
            }
            enemies = aux;
            deleteEnemy = [];
        }

        requestAnimationFrame(gameLoop);
    
    }

    publisher.startNotifications(0);
    gameLoop(0);
    

});