let publisher = new EventPublisher();

function generateEnemies(target, normalAmount, suicideAmount){
    let enemies = [];
    let minDistance = (x, y) => {
        return (x * x) + (y * y) >= 2_100_000;
    };

    for (let i = 0; i < normalAmount; i++) {

        let coords = getNRandom(2, -1500, 1500, minDistance);
        let x = coords[0];
        let y = coords[1];

        enemies.push(new NormalEnemy(target, new Vector3(x, y)));        
    }
    for (let i = 0; i < suicideAmount; i++) {

        let coords = getNRandom(2, -1500, 1500, minDistance);
        let x = coords[0];
        let y = coords[1];

        enemies.push(new SuicideEnemy(target, new Vector3(x, y)));        
    }
    return enemies;
}

let enemiesGenerate = [1, 0, 0, 0, 0];
let enemyTypes = 3;
let enemySpawnTime = 2000;
let spawnTimer = 0;
let timesInvoked = 0;
let spawnLevel = 0;

function createEnemies(target, dt){
    let newEnemies = [];
    spawnTimer += dt;

    if(spawnTimer >= enemySpawnTime){
        spawnTimer = 0;
        timesInvoked += 1;
        newEnemies = generateEnemies(target, ...enemiesGenerate);

        if(timesInvoked === 10){
            enemiesGenerate[getRandomNumber(0, Math.min(spawnLevel, enemyTypes))]++;
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

});

function clear(context, canvas){
    context.clearRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener("DOMContentLoaded", () => {

    let cnv = document.getElementById("game_screen");
    let ctx = cnv.getContext('2d');

    cnv.width = 1000;
    cnv.height = 1000;

    let canvasScaleX = cnv.width / cnv.clientWidth;
    let canvasScaleY = cnv.height / cnv.clientHeight;

    let player = new PlayerEntity(new Vector3(cnv.width * 0.5, cnv.height * 0.5));
    publisher.subscribe(player, "mousemove");

    
    let enemies = [];
    //enemies = generateEnemies(player, 0, 1);
    //enemies[0].setPos(50, 50);

    cnv.addEventListener("mousemove", (event) => {

        publisher.newEvent(new GameEvent(
            "mousemove", 
            new Vector3(
                event.x * canvasScaleX, 
                event.y * canvasScaleY
                )
            ));
    });
    
    let lastTime = 0;

    let playerAttacks = [];

    function gameLoop(timeStamp){
        dt = timeStamp - lastTime;
        lastTime = timeStamp;

        enemies.push(...createEnemies(player, dt));
    
        clear(ctx, cnv);

        const offset = player.update(dt);
        playerAttacks.push(...player.shoot(...enemies));
        player.draw(ctx, false, false);

        playerAttacks.forEach((attack) => {
            attack.update(dt, offset);
            attack.impact(...enemies);
            attack.draw(ctx, true);
        });
        console.log(playerAttacks.length);

        playerAttacks = playerAttacks.filter(a => a.isActive() && !a.tooFar(player));

        enemies.forEach((e) => {
            e.update(dt, offset);
            e.draw(ctx, false);
        });

        enemies = enemies.filter(e => e.isAlive() && !e.tooFar());

        //if(getRandomNumber(0, 1000) < 1){
        //    enemies.forEach(e => e.hurt(1)); 
        //}

        requestAnimationFrame(gameLoop);
    
    }

    publisher.startNotifications(1);
    gameLoop(0);
    

});