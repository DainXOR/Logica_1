let publisher = new EventPublisher();

function newEnemy(enemyClass, amount, target, radius = 1000, center = 500, 
    predicate = (x, y) => {return ((x * x) + (y * y) >= 1_500_000);}){
    let enemies = [];
    for (let i = 0; i < amount; i++) {

        let coords = getNRandom(2, -center - radius, center + radius, predicate);
        let x = coords[0];
        let y = coords[1];

        enemies.push(new enemyClass(target, new Vector3(x, y)));
    }
    return enemies;
}

function createEnemies(target, ...amounts){
    let enemies = [];

    //enemies.push(...newEnemy(NormalEnemy, amounts[0], target));
    enemies.push(...newEnemy(SuicideEnemy, amounts[1], target));
    //enemies.push(...newEnemy(TankyEnemy, amounts[2], target, 1500));
    //enemies.push(...newEnemy(NormalBigEnemy, amounts[3], target, 1500));
    //enemies.push(...newEnemy(TankyBigEnemy, amounts[4], target, 1500));
    enemies.push(...newEnemy(RevengefulEnemy, amounts[5], target, 1500));
    //enemies.push(...newEnemy(GiantEnemy, amounts[6], target, 3000));

    return enemies;
}

let enemiesGenerate = [0, 10, 0, 0, 0, 10, 0];
let enemyTypes = enemiesGenerate.length;
let enemySpawnTime = 1000 * 2;
let spawnTimer = 0;
let timesInvoked = 0;
let spawnLevel = 3;

function generateEnemies(target, dt){
    let newEnemies = [];
    spawnTimer += dt;

    if(spawnTimer >= enemySpawnTime){
        spawnTimer = 0;
        timesInvoked += 1;
        newEnemies = createEnemies(target, ...enemiesGenerate);

        if(timesInvoked >= 1){
            enemiesGenerate[getRandomNumber(0, Math.min(spawnLevel, enemyTypes - 1))]++;
            spawnLevel++;
            timesInvoked = 0;
            
            if(getRandomNumber(0, 100) > 20){
                target.newAttack(ImpactProyectile, [50, 10], 680);

                //target.attacks.push(new Weapon(ImpactProyectile, 680));
                //target.attacksArgs.push([50, 10]);
            }
            if(getRandomNumber(0, 100) > 20){
                target.newAttack(PierceProyectile, [60, 5, 2], 1000);

                //target.attacks.push(new Weapon(PierceProyectile, 1000));
                //target.attacksArgs.push([60, 5, 2]);
            }
            if(getRandomNumber(0, 100) > 20){
                target.newAttack(FollowProyectile, [20, 8], 1000);

                //target.attacks.push(new Weapon(FollowProyectile, 1000));
                //target.attacksArgs.push([20, 8]);
            }
            if(getRandomNumber(0, 100) > 20){
                target.newAttack(RicochetProyectile, [60, 2, 5], 1500);

                //target.attacks.push(new Weapon(RicochetProyectile, 1500));
                //target.attacksArgs.push([60, 2, 5]);
            }
            if(getRandomNumber(0, 100) > 50){
                target.newAttack(Magma, [], 5000, Type.AOE);

                //target.attacks.push(new Weapon(Magma, 5000, Type.AOE));
                //target.attacksArgs.push([0]);
            }
            if(getRandomNumber(0, 100) > 10){
                target.newAttack(Void, [], 8000, Type.AOE);

                //target.attacks.push(new Weapon(Void, 8000, Type.AOE));
                //target.attacksArgs.push([0]);
            }
        }
    }


    return newEnemies;
}

const orbType = {
    blue:   [1, "#0066ff"],
    yellow: [5, "#ffcc00"],
    violet: [50, "#ff33cc"],
    black:  [1000, "#050505"],
}

function newOrb(type, radius = 3000, center = 500, 
    predicate = () => {return true;}){

    let coords = getNRandom(2, -center - radius, center + radius, predicate);
    let x = coords[0];
    let y = coords[1];

    return new Orb(new Vector3(x, y), 3, ...orbType[type]);
}
function createOrbs(...amounts){
    let orbs = [];

    for (let i = 0; i < amounts[0]; i++) {
        orbs.push(newOrb("blue"));
    }
    for (let i = 0; i < amounts[1]; i++) {
        orbs.push(newOrb("yellow"));
    }
    for (let i = 0; i < amounts[2]; i++) {
        orbs.push(newOrb("violet"));
    }
    for (let i = 0; i < amounts[3]; i++) {
        orbs.push(newOrb("black"));
    }
    
    return orbs;
}

let orbsGenerate = [200, 10, 1, 0];
let orbTypes = orbsGenerate.length;
let orbSpawnTime = 1000 * 5;
let orbSpawnTimer = 0;
let orbTimesInvoked = 0;
let orbSpawnLevel = 1;

function generateOrbs(dt){
    let newOrbs = [];
    orbSpawnTimer += dt;

    if(orbSpawnTimer >= orbSpawnTime){
        orbSpawnTimer = 0;
        orbTimesInvoked += 1;
        newOrbs = createOrbs(...orbsGenerate);

        if(orbTimesInvoked >= 50){
            console.log("Level up");
            let random = getRandomNumber(0, Math.min(orbSpawnLevel, orbTypes - 1));
            orbsGenerate[random] += Math.ceil(50 / ((random * 100) + 1));
            orbSpawnLevel++;
            orbTimesInvoked = 0;
        }
    }

    return newOrbs;
}

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


    cnv.addEventListener("mousemove", (event) => {

        publisher.newEvent(new GameEvent(
            "mousemove", 
            new Vector3(
                event.x * canvasScaleX, 
                event.y * canvasScaleY
                )
            ));
    });

    let enemies = [];
    //enemies = generateEnemies(player, 0, 1);
    //enemies[0].setPos(50, 50);

    let orbs = createOrbs(2000);
    
    let lastTime = 0;
    let totalTime = 0;
    let playerAttacks = [];

    function gameLoop(timeStamp){
        dt = timeStamp - lastTime;
        lastTime = timeStamp;

        //enemies.push(...generateEnemies(player, dt));
        orbs.push(...generateOrbs(dt));
    
        clear(ctx, cnv);

        const offset = player.update(dt);
        playerAttacks.push(...player.shoot(...enemies));

        orbs = orbs.filter(o => !o.isCollected() && !o.tooFar(player));
        orbs.forEach((o) => {
            if(o.color === "#050505"){
                console.log(Math.sqrt(o.aabb.distanceTo(player.aabb)));
            }

            o.update(dt, offset);
            o.draw(ctx, false);
        });
        player.collect(...orbs);

        playerAttacks = playerAttacks.sort((a, b) => {return a.pos.z - b.pos.z;});
        playerAttacks.forEach((attack) => {
            attack.checkTooFar(player);
            attack.update(dt, offset);
            attack.impact(...enemies);
            attack.draw(ctx, false);
        });
        player.draw(ctx, cnv, false, false);
        
        enemies = enemies.filter(e => e.isAlive() && !e.tooFar());
        enemies.forEach((e) => {
            e.update(dt, offset);
            e.draw(ctx, false);
        });
        
        
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

        if(totalTime > 30_000){
            enemies.forEach(e => e.hurt(0)); 
            totalTime *= -1;
        }

        requestAnimationFrame(gameLoop);
    
    }

    publisher.startNotifications(1);
    gameLoop(0);
    

});