let publisher = new EventPublisher();

function generateEnemies(target, normalAmount, suicideAmount){
    let enemies = [];
    let minDistance = (x, y)=>{
        return (x * x) + (y * y) >= (target.pos.x * target.pos.x) + (target.pos.y * target.pos.y) + 2_250_000;
    };

    for (let i = 0; i < normalAmount; i++) {

        let coords = getNRandom(2, -1500, 1500, minDistance);
        let x = coords[0];
        let y = coords[1];

        enemies.push(new NormalEnemy(target, new Vector3(x, y)));        
    }
    for (let i = 0; i < suicideAmount; i++) {

        let coords = getNRandom(2, -1500, 1500);
        let x = coords[0];
        let y = coords[1];

        enemies.push(new SuicideEnemy(target, new Vector3(x, y)));        
    }
    return enemies;
}

let enemiesGenerate = [1, 0, 0, 0, 0];
let enemieSpawnTime = 2000;
let spawnTimer = 0;
let timesInvoked = 0;
let spawnLevel = 0;

function createEnemies(target, dt){
    let newEnemies = [];
    spawnTimer += dt;

    if(spawnTimer >= enemieSpawnTime){
        spawnTimer = 0;
        timesInvoked += 1;
        newEnemies = generateEnemies(target, ...enemiesGenerate);

        if(timesInvoked === 10){
            enemiesGenerate[getRandomNumber(0, spawnLevel)]++;
            spawnLevel++;
            timesInvoked = 0;
        }
    }


    return newEnemies;
}

//enemies = [];



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
        // console.log("In queue: " + publisher.events.events.length);
        // console.log("Events: " + publisher.events.events);
        console.log(player.pos);
    }
});

function clear(context, canvas){
    context.clearRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener("DOMContentLoaded", () => {

    let cnv = document.getElementById("game_screen");
    let ctx = cnv.getContext('2d');

    cnv.width = 1000;
    cnv.height = 1000;

    canvasScaleX = cnv.width / cnv.clientWidth;
    canvasScaleY = cnv.height / cnv.clientHeight;

    let player = new PlayerEntity(new Vector3(cnv.width * 0.5, cnv.height * 0.5));
    publisher.subscribe(player, "mousemove");

    
    let enemies = [];
    //enemies = generateEnemies(player, 0, 1);
    //enemies[0].setPos(50, 50);

    cnv.addEventListener("mousemove", (event) => {
        //console.log("Original:", event.x, event.y);
        //console.log("Scaled:",
        //    event.x * canvasScaleX, 
        //    event.y * canvasScaleY);

        publisher.newEvent(new GameEvent(
            "mousemove", 
            new Vector3(
                event.x * canvasScaleX, 
                event.y * canvasScaleY
                )
            ));
    });
    
    let lastTime = 0;

    function gameLoop(timeStamp){
        dt = timeStamp - lastTime;
        lastTime = timeStamp;

        enemies.push(...createEnemies(player, dt));
    
        clear(ctx, cnv);

        const offset = player.update(dt);
        player.draw(ctx, false, false);

        enemies.forEach((e) => {
            e.update(dt, offset);
            e.draw(ctx, false);
        });

        enemies = enemies.filter(e => e.isAlive() && !e.tooFar());
        console.log(enemies.length);

        if(getRandomNumber(0, 1000) < 1){
            enemies.forEach(e => e.hurt(1)); 
        }

        requestAnimationFrame(gameLoop);
    
    }

    publisher.startNotifications(1);
    gameLoop(0);
    

});