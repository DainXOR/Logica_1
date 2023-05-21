let publisher = new EventPublisher();

function enemy(canvas){
    let enemiesGenerate = [10, 0, 0, 0, 0, 0, 0];
    let enemyTypes = enemiesGenerate.length;
    let enemySpawnTime = 1000 * 2;
    let spawnTimer = 0;
    let timesInvoked = 0;
    let spawnLevel = 3;

    function newEnemy(enemyClass, amount, target, radius = 1500, 
        center = new Vector3(canvas.width * 0.5, canvas.height * 0.5),
        predicate = (x, y) => {return ((x * x) + (y * y) >= 1_500_000);}){

        let enemies = [];
        for (let i = 0; i < amount; i++) {
            let x = getConditionateRandom(center.x - radius, center.x + radius, () => true);
            let y = getConditionateRandom(center.y - radius, center.y + radius, () => true);
    
            enemies.push(new enemyClass(target, new Vector3(x, y)));
        }
        return enemies;    
    }
    function createEnemies(target, ...amounts){
        let enemies = [];

        enemies = enemies.concat(
            newEnemy(NormalEnemy, amounts[0], target),
            newEnemy(TankyEnemy, amounts[1], target, 1500),
            newEnemy(NormalBigEnemy, amounts[2], target, 1500),
            newEnemy(SuicideEnemy, amounts[3], target),
            newEnemy(TankyBigEnemy, amounts[4], target, 1500),
            newEnemy(RevengefulEnemy, amounts[5], target, 1500),
            newEnemy(GiantEnemy, amounts[6], target, 3000)
        );
    
        return enemies;
    }
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
                
                if(getRandomNumber(0, 1000) > 850){
                    target.newAttack(ImpactProyectile, [50, 10], 680);
                }
                if(getRandomNumber(0, 1000) > 900){
                    target.newAttack(PierceProyectile, [60, 5, 2], 1000);
                }
                if(getRandomNumber(0, 1000) > 900){
                    target.newAttack(FollowProyectile, [20, 8], 1000);
                }
                if(getRandomNumber(0, 1000) > 850){
                    target.newAttack(RicochetProyectile, [60, 2, 5], 1500);
                }
                if(getRandomNumber(0, 1000) > 950){
                    target.newAttack(Magma, [], 5000, Type.AOE);
                }
                if(getRandomNumber(0, 1000) > 990){
                    target.newAttack(Void, [], 8000, Type.AOE);
                }
            }
        }
    
    
        return newEnemies;
    }

    return {
        createNew: newEnemy,
        createMany: createEnemies,
        generate: generateEnemies
    }
}

function orb(canvas){
    const orbType = {
        blue:   [4, 1, "#0066ff", 4],
        green:  [4, 10, "#1aff75", 5],
        yellow: [4, 25, "#ffcc00", 6],
        violet: [5, 100, "#ff33cc", 7],
        red:    [5, 1000, "#ff133c", 8],
        black:  [6, 10000, "#090909", 9],
    }

    let orbsGenerate = [10, 0, 0, 0, 0, 0];
    let orbTypes = orbsGenerate.length;
    let orbSpawnTime = 1000 * 0.5;
    let orbSpawnTimer = 0;
    let orbTimesInvoked = 0;
    let orbSpawnLevel = 0;

    let minOrbType = 0;
    let maxOrbType = 0;
    let orbUpgradeInvokes = 100;

    function newOrb(type, radius = 3000, 
        center = new Vector3(canvas.width * 0.5, canvas.height * 0.5),
        predicate = () => {return true;}){

        let coords = getNRandom(2, center.x - radius, center.y + radius, predicate);
        let x = coords[0];
        let y = coords[1];
    
        return new Orb(new Vector3(x, y), ...orbType[type]);
    }
    function createOrbs(...amounts){
        let orbs = [];
    
        for (let i = 0; i < amounts[0]; i++) {
            orbs.push(newOrb("blue"));
        }
        for (let i = 0; i < amounts[1]; i++) {
            orbs.push(newOrb("green"));
        }
        for (let i = 0; i < amounts[2]; i++) {
            orbs.push(newOrb("yellow"));
        }
        for (let i = 0; i < amounts[3]; i++) {
            orbs.push(newOrb("violet"));
        }
        for (let i = 0; i < amounts[4]; i++) {
            orbs.push(newOrb("red"));
        }
        for (let i = 0; i < amounts[5]; i++) {
            orbs.push(newOrb("black"));
        }
        
        return orbs;
    }
    function generateOrbs(dt){
        let newOrbs = [];
        orbSpawnTimer += dt;
    
        if(orbSpawnTimer >= orbSpawnTime){
            orbSpawnTimer = 0;
            orbTimesInvoked += 1;
            newOrbs = createOrbs(...orbsGenerate);
    
            if(orbTimesInvoked >= orbUpgradeInvokes){
                let random = getRandomInt(minOrbType, Math.min(maxOrbType, orbTypes - 1));

                orbsGenerate[random] += Math.ceil(50 / ((random * 100) + 1));


                orbSpawnLevel++;
                orbTimesInvoked = 0;
                orbUpgradeInvokes += 50 * orbSpawnLevel;

                minOrbType += getRandomInt(0, maxOrbType) <= 1;
                maxOrbType += getRandomInt(0, orbSpawnLevel) <= 1;
            }
        }
    
        return newOrbs;
    }

    return {
        createNew: newOrb,
        createMany: createOrbs,
        generate: generateOrbs
    }
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

    let arr = [];
    arr.push()


    let cnv = document.getElementById("game_screen");
    let ctx = cnv.getContext('2d');

    cnv.width = 4000;
    cnv.height = 4000;

    let canvasScaleX = cnv.width / cnv.clientWidth;
    let canvasScaleY = cnv.height / cnv.clientHeight;

    let player = new PlayerEntity(new Vector3(cnv.width * 0.5, cnv.height * 0.5), cnv);
    publisher.subscribe(player, "mousemove");

    
    //enemies = generateEnemies(player, 0, 1);
    //enemies[0].setPos(50, 50);

    //let bg = new Background(cnv.width, cnv.height, "bg1");

    let orbFactory = orb(cnv);
    let orbs = orbFactory.createMany(500, 500, 500, 500, 500, 500);
    
    let lastTime = 0;
    let totalTime = 0;
    let playerAttacks = [];

    let exp = 0;

    let enemyFactory = enemy(cnv);
    let enemies = enemyFactory.createMany(player, 1000);
    enemies = [];

    let timeCounter = 0;
    let qt = new QuadTree(new Vector3(cnv.width * 0.25, cnv.height * 0.25), cnv.width * 0.5, cnv.height * 0.5);
    //for (let i = 0; i < enemies.length; i++) {
    //    qt.insert(enemies[i]) && (enemies[i].color = "#00ff00");
    //}

    let mouseEvent = {
        isPressed: false,
        x: 0,
        y: 0,
    }

    document.addEventListener("mousedown", (event) => {
        mouseEvent.isPressed = true;
        mouseEvent.x = event.x * canvasScaleX;
        mouseEvent.y = event.y * canvasScaleY;
    });

    document.addEventListener("mouseup", (event) => {
        mouseEvent.isPressed = false;
    });

    cnv.addEventListener("mousemove", (event) => {

        if(mouseEvent.isPressed){
            mouseEvent.x = event.x * canvasScaleX;
            mouseEvent.y = event.y * canvasScaleY;
        }

        publisher.newEvent(new GameEvent(
            "mousemove", 
            new Vector3(
                event.x * canvasScaleX, 
                event.y * canvasScaleY
                )
            ));

        
    });

    function quadTreeTesting(timeStamp){
        let dt = timeStamp - lastTime;
        lastTime = timeStamp;
        timeCounter += dt;

        if(mouseEvent.isPressed && (timeCounter >= 100)){
            let newEnemy = new NormalEnemy(player, new Vector3(mouseEvent.x, mouseEvent.y));
            qt.insert(newEnemy) && (newEnemy.color = "#00ff00");
            enemies.push(newEnemy);
            timeCounter = 0;
        }

        clear(ctx, cnv)
        qt.draw(ctx);
        enemies.forEach((e) => {
            e.draw(ctx);
        });

        console.log(qt.getElements().length);

        requestAnimationFrame(quadTreeTesting);
    }

    function gameLoop(timeStamp){
        dt = timeStamp - lastTime;
        lastTime = timeStamp;

        exp = 0;

        //enemies = enemies.concat(enemyFactory.generate(player, dt));
        if(orbs.length <= 1500){
            orbs = orbs.concat(orbFactory.generate(dt));
        }
        
        player.addExperience(exp);
        const offset = player.update(dt);
        playerAttacks = playerAttacks.concat(player.shoot(...enemies));
        clear(ctx, cnv);
        
        //bg.update(ctx, offset);

        enemies.forEach((en) => {
            en.move(0, offset);
            en.draw(ctx);
        });


        orbs = orbs.filter(o => !o.isCollected() && !o.tooFar(player));
        orbs.forEach((o) => {
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
        

        let killed = enemies.filter(e => !e.isAlive());
        killed.forEach(e => {
            exp += e.claimExp();
        });

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
        
        //totalTime += dt;

        //if(totalTime > 30_000){
        //    enemies.forEach(e => e.hurt(0)); 
        //    totalTime *= -1;
        //}
        console.log(orbs.length);

        requestAnimationFrame(gameLoop);
    
    }

    quadTreeTesting(0);
    //publisher.startNotifications(1);
    //gameLoop(0);

});