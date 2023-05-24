let publisher = new EventPublisher();

function enemy(canvas){
    let enemiesGenerate = [10, 0, 0, 0, 0, 0, 0];
    let enemyTypes = enemiesGenerate.length;
    let enemySpawnTime = 1000 * 2;
    let spawnTimer = 0;
    let timesInvoked = 0;
    let spawnLevel = 3;

    function newEnemy(enemyClass, amount, target, area = new BC(new Vector3(), 1500), predicate = () => true){

        let condition = (x, y) => {return !area.containsBC(new BC(new Vector3(x, y), 1)) && predicate(x, y)};

        let enemies = [];
        for (let i = 0; i < amount; i++) {
            let x = getRandomNumber(area.center.x - area.radius, area.center.x + area.radius);
            let y = getRandomNumber(area.center.y - area.radius, area.center.y + area.radius);

            if(!condition(x, y)){
                x += area.radius * (1 + ((x < 0) * -2));
                y += area.radius * (1 + ((y < 0) * -2));
            }
            enemies.push(new enemyClass(target, new Vector3(x, y)));
        }
        return enemies;    
    }
    function createEnemies(target, amounts, area = new BC(new Vector3(), 1500)){
        let enemies = [];

        enemies = enemies.concat(
            newEnemy(NormalEnemy,       amounts[0], target, area),
            newEnemy(TankyEnemy,        amounts[1], target, area),
            newEnemy(NormalBigEnemy,    amounts[2], target, area),
            newEnemy(SuicideEnemy,      amounts[3], target, area),
            newEnemy(TankyBigEnemy,     amounts[4], target, area),
            newEnemy(RevengefulEnemy,   amounts[5], target, area),
            newEnemy(GiantEnemy,        amounts[6], target, area)
        );
    
        return enemies;
    }
    function generateEnemies(target, dt, area = new BC(new Vector3(), 1500)){
        let newEnemies = [];
        spawnTimer += dt;
    
        if(spawnTimer >= enemySpawnTime){
            spawnTimer = 0;
            timesInvoked += 1;
            newEnemies = createEnemies(target, enemiesGenerate, area);
    
            if(timesInvoked >= 10){
                enemiesGenerate[getRandomInt(0, Math.min(spawnLevel, enemyTypes - 1))]++;
                spawnLevel++;
                timesInvoked = 0;
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

                orbsGenerate[random] += Math.ceil(50 / ((random * 10) + 1));
                if(maxOrbType >= 4 && minOrbType >= 1){
                    orbsGenerate[0] -= orbsGenerate[0] - 10 >= 50? 10 : 0;
                }

                orbsGenerate[1] -= getRandomNumber(0, minOrbType) < 1;
                orbsGenerate[2] -= getRandomNumber(0, minOrbType) < 2;
                orbsGenerate[3] -= getRandomNumber(0, minOrbType) < 3;
                orbsGenerate[4] -= getRandomNumber(0, minOrbType) < 4;
                orbsGenerate[5] -= getRandomNumber(0, minOrbType) < 5;

                orbSpawnLevel++;
                orbTimesInvoked = 0;
                orbUpgradeInvokes += 50 * orbSpawnLevel;

                minOrbType += getRandomInt(0, maxOrbType) <= 1;
                maxOrbType += orbsGenerate[0] >= 100 && getRandomInt(0, orbSpawnLevel) <= 1;
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
function hearth(canvas){
    let hearthSpawnTime = 1000 * 40;
    let hearthSpawnTimer = 0;

    function newHearth(radius = 3000, 
        center = new Vector3(canvas.width * 0.5, canvas.height * 0.5),
        predicate = () => {return true;}){

        let coords = getNRandom(2, center.x - radius, center.y + radius, predicate);
        let x = coords[0];
        let y = coords[1];
    
        return new Hearth(new Vector3(x, y), 8, 30);
    }
    function generateHearth(dt){
        let hearth = [];
        hearthSpawnTimer += dt;
    
        if(hearthSpawnTimer >= hearthSpawnTime){
            hearthSpawnTimer = 0;
            for (let i = 0; i < 5; i++) {
                hearth.push(newHearth());   
            }
        }
    
        return hearth;
    }

    return {
        createNew: newHearth,
        generate: generateHearth
    }
}

//document.addEventListener("keypress", (event) => {
//    publisher.newEvent(new GameEvent("keypress", event));
//
//    if(event.key === "s"){
//        publisher.startNotifications();
//        console.log("Notifications enabled!");
//    }
//    if(event.key === "p"){
//        publisher.stopNotifications();
//        console.log("Notifications stopped!");
//    }
//
//});

function clear(context, canvas){
    context.clearRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener("DOMContentLoaded", () => {

    let game = new Game(1000, 1000, 1);
    game.setupCanvas("game_screen");
    game.setupActors();

    let cnv = document.getElementById("game_screen");
    let ctx = cnv.getContext('2d');

    cnv.width = 1000;
    cnv.height = 1000;

    let canvasScaleX = cnv.width / cnv.clientWidth;
    let canvasScaleY = cnv.height / cnv.clientHeight;

    let player = new PlayerEntity(new Vector3(cnv.width * 0.5, cnv.height * 0.5), cnv);
    publisher.subscribe(player, "mousemove");

    let bg = new Background(cnv.width, cnv.height, "bg6");

    let orbFactory = orb(cnv);
    let orbs = orbFactory.createMany(500);

    let hearthFactory = hearth(cnv);
    let hearths = hearthFactory.generate(0);
    
    let lastTime = 0;
    let totalTime = 0;
    let playerAttacks = [];

    let exp = 0;

    let enemyFactory = enemy(cnv);
    let enemies = enemyFactory.createMany(player, [10, 0, 0, 0, 0, 0, 0], 
                                        new BC(new Vector3(cnv.width * 0.5, cnv.height * 0.5), cnv.width));
    //enemies = [];

    let timeCounter = 0;
    let qtree = new QuadTree(new Vector3(-500, -500), cnv.width + (500 * 2), cnv.height + (500 * 2));

    for (let i = 0; i < enemies.length; i++) {
        qtree.insert(enemies[i]);
    }

    cnv.addEventListener("mousemove", (event) => {
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
            qtree.insert(newEnemy) && (newEnemy.color = "#00ff00");
            enemies.push(newEnemy);
            timeCounter = 0;
        }

        let insidePoints = qtree.getElementsInside(area);

        insidePoints.forEach(e => {
            e.color = "#00ff00";
        });

        clear(ctx, cnv)
        qtree.draw(ctx);
        enemies.forEach((e) => {
            e.draw(ctx);
        });
        area.draw(ctx);

        insidePoints.forEach(e => {
            e.color = "#ffffff";
        });

        requestAnimationFrame(quadTreeTesting);
    }

    let offset = new Vector3();

    function gameLoop(timeStamp){
        dt = timeStamp - lastTime;
        lastTime = timeStamp;

        if(!player.isAlive()){
            dt *= 0.166666666;
        }

        enemies.length <= 500 &&
        (enemies = enemies.concat(enemyFactory.generate(player, dt, new BC(new Vector3(cnv.width * 0.5, cnv.height * 0.5), 1500))));
        enemies.filter(e => !e.isAlive())
               .forEach(e => {exp += e.claimExp();});

        enemies = enemies.filter(e => e.isAlive() && !e.tooFar());

        orbs.length <= 4000 &&
        (orbs = orbs.concat(orbFactory.generate(dt)));
        orbs = orbs.filter(o => !o.isCollected() && !o.tooFar(player));

        hearths <= 50 &&
        (hearths = hearths.concat(hearthFactory.generate(dt)));

        offset = player.update(dt);cnv.width

        qtree = new QuadTree(new Vector3(-500, -500), cnv.width + (500 * 2), cnv.height + (500 * 2));
        let allEntities = [];
        allEntities = allEntities.concat(orbs, enemies, hearths);
        for (let i = 0; i < allEntities.length; i++) {
            qtree.insert(allEntities[i]);
            allEntities[i].update(dt, offset);
        }

        
        if(exp !== 0){
            player.addExperience(exp);
            exp = 0;
        }
        
        while (player.hasLevelUp()) {
            console.log(player.levelsUpgraded);

            if(getRandomInt(0, 1000) > 850){
                player.newAttack(ImpactProyectile, [50, 10], 680);
            }
            if(getRandomInt(0, 1000) > 900){
                player.newAttack(PierceProyectile, [60, 5, 2], 1000);
            }
            if(getRandomInt(0, 1000) > 900){
                player.newAttack(FollowProyectile, [20, 8], 1000);
            }
            if(getRandomInt(0, 1000) > 850){
                player.newAttack(RicochetProyectile, [60, 4, 5], 1500);
            }
            if(getRandomInt(0, 1000) > 950){
                player.newAttack(Magma, [], 9_000, Type.AOE);
            }
            if(getRandomInt(0, 1000) > 500){
                player.newAttack(Void, [], 12_000, Type.AOE);
            }
            player.consumeLevel();
        }

        

        let enemyEntities = qtree.queryElements(player.aabb, "collide", (entity) => entity.type === 12);
        // let giantEnemies = enemyEntities.filter((enemy) => enemy.id === -1971176318);

        playerAttacks = playerAttacks.concat(player.shoot(...enemyEntities));
        clear(ctx, cnv);
        
        bg.update(ctx, offset);
        //qtree.draw(ctx);


        orbs = orbs.filter(o => !o.isCollected() && !o.tooFar(player));
        orbs.forEach((o) => {
            //o.update(dt, offset);
            o.draw(ctx);
        });

        hearths = hearths.filter(o => !o.isCollected() && !o.tooFar(player));
        hearths.forEach((h) => {
            //h.update(dt, offset);
            h.draw(ctx, true);
        });

        
        player.collect(...qtree.queryElements(player.aabb, "collide", (entity) => entity.type === 3));

        playerAttacks = playerAttacks.sort((a, b) => {return a.pos.z - b.pos.z;});
        playerAttacks.forEach((attack) => {
            attack.checkTooFar(player);

            attack.update(dt, offset);

            let nearbyEnemies = qtree.queryElements(attack.aabb, "inside", (entity) => entity.type === 12);

            attack.impact(...nearbyEnemies);
            attack.draw(ctx);
        });


        player.draw(ctx, false, false);
        
        enemies.forEach((e) => {
            //e.update(dt, offset);
            e.draw(ctx, true);
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

        
        player.hpBar.draw(ctx);
        player.expBar.draw(ctx);
        
        //qtree.draw(ctx);
        //totalTime += dt;

        //if(totalTime > 30_000){
        //    enemies.forEach(e => e.hurt(0)); 
        //    totalTime *= -1;
        //}

        requestAnimationFrame(gameLoop);
    
    }

    //quadTreeTesting(0);

    //publisher.startNotifications(1);
    //gameLoop(0);

});