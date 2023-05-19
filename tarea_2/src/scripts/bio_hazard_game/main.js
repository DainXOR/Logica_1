let publisher = new EventPublisher();

function newEnemy(enemyClass, amount, target, minCoord = -1500, maxCoord = 1500, predicate = (x, y) => {return (x * x) + (y * y) >= 1_500_000;}){
    let enemies = [];
    for (let i = 0; i < amount; i++) {

        let coords = getNRandom(2, minCoord, maxCoord, predicate);
        let x = coords[0];
        let y = coords[1];

        enemies.push(new enemyClass(target, new Vector3(x, y)));
    }
    return enemies;
}

function generateEnemies(target, ...amounts){
    let enemies = [];

    enemies.push(...newEnemy(NormalEnemy, amounts[0], target));
    enemies.push(...newEnemy(SuicideEnemy, amounts[1], target));
    enemies.push(...newEnemy(TankyEnemy, amounts[2], target));
    enemies.push(...newEnemy(NormalBigEnemy, amounts[3], target));
    enemies.push(...newEnemy(TankyBigEnemy, amounts[4], target));
    enemies.push(...newEnemy(RevengefulEnemy, amounts[5], target));

    return enemies;
}

let enemiesGenerate = [10, 5, 2, 1, 1, 0];
let enemyTypes = 6;
let enemySpawnTime = 2000;
let spawnTimer = 0;
let timesInvoked = 0;
let spawnLevel = 5;

function createEnemies(target, dt){
    let newEnemies = [];
    spawnTimer += dt;

    if(spawnTimer >= enemySpawnTime){
        spawnTimer = 0;
        timesInvoked += 1;
        newEnemies = generateEnemies(target, ...enemiesGenerate);

        if(timesInvoked === 5){
            enemiesGenerate[getRandomNumber(0, Math.min(spawnLevel, enemyTypes - 1))]++;
            spawnLevel++;
            timesInvoked = 0;
            
            if(getRandomNumber(0, 100) > 20){
                target.attacks.push(new Weapon(ImpactProyectile, 680)); // new Weapon(ImpactProyectile, 1000), new Weapon(PierceProyectile, 1500), new Weapon(FollowProyectile, 1500)
                target.attacksArgs.push([50, 10]);
            }
            if(getRandomNumber(0, 100) > 40){
                target.attacks.push(new Weapon(PierceProyectile, 1000));
                target.attacksArgs.push([60, 5, 2]);
            }
            if(getRandomNumber(0, 100) > 30){
                target.attacks.push(new Weapon(FollowProyectile, 1000));
                target.attacksArgs.push([20, 8]);
            }
            if(getRandomNumber(0, 100) > 60){
                target.attacks.push(new Weapon(RicochetProyectile, 3000));
                target.attacksArgs.push([60, 2, 5]);
            }
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
    let totalTime = 0;
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
            attack.checkTooFar(player);
            attack.update(dt, offset);
            attack.impact(...enemies);
            attack.draw(ctx, false);
        });
        
        enemies.forEach((e) => {
            e.update(dt, offset);
            e.draw(ctx, false);
        });
        
        enemies = enemies.filter(e => e.isAlive() && !e.tooFar());
        
        playerAttacks = playerAttacks.filter(a => a.isActive());
        let targetless = playerAttacks.filter(a => !a.hasTarget());

        targetless.forEach(a => {
            let closer = 1_000_000_000;
            let closerEnemy = null;
            enemies.forEach(e => { // pos, speed, damage
                const de = a.aabb.distanceTo(e.aabb);
                if(de <= closer){
                    closer = de;
                    closerEnemy = e;
                } 
            });
            a.target = closerEnemy;
        });
        
        
        totalTime += dt;
        //console.log(totalTime);
        if(totalTime > 30_000){
            enemies.forEach(e => e.hurt(1)); 
            totalTime *= -1;
        }

        requestAnimationFrame(gameLoop);
    
    }

    //publisher.startNotifications(1);
    //gameLoop(0);
    

});