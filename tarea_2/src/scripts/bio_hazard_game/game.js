class game {
    constructor(width, height){
        this.width = width;
        this.height = height;

        this.setupCanvas("game_screen");
        this.setupPublisher();
        


    }

    setupCanvas(id){
        this.canvas = document.getElementById(id);
        this.context = cnv.getContext('2d');

        cnv.width = 1000;
        cnv.height = 1000;
    }
    setupActors(){
        this.player = new PlayerEntity();


        return [[this.player, "mousemove"], ];
    }
    setupPublisher(...subscribers){
        this.publisher = new EventPublisher();

        for (let i = 0; i < subscribers.length; i++) {
            this.publisher.subscribe(subscribers[i][0], subscribers[i][1]);
            
        }
        this.publisher.subscribe(player, "mousemove");
        
    }
    setupUtilities(level){
        this.startOrFinish = true;
        this.isPaused = false;
        this.onPauseScreen = false;
        this.onLevelScreen = false;
        this.onArtifactScreen = false;

        this.enemiesGenerate = [1];
        this.enemieSpawnTime = 1000;
        this.spawnTimer = 0;
        this.timesInvoked = 0;
        this.spawnLevel = 0;

        this.screenFadeStep = 0;
        this.screenFadeGradient = [];
        colorGradient("ffffff", "000000", 300).forEach(color => {
            screenFadeGradient.push("#000000" + color[4] + color[5]);
        });

    }
    setupGame(){
        
        

        this.enemies = generateEnemies(3, 2);

        this.publisher.startNotifications();

        this.canvas.width = 1920;
        this.canvas.height = 1080;
    
        const canvasScaleX = this.canvas.width / this.canvas.clientWidth;
        const canvasScaleY = this.canvas.height / this.canvas.clientHeight;
    
        this.canvas.addEventListener("mousemove", (event) => {
            console.log("Original:", event.clientX, event.clientY);
            console.log("Scaled: ",
                event.clientX * canvasScaleX, 
                event.clientY * canvasScaleY);
    
            publisher.newEvent(new GameEvent(
                "mousemove", 
                new Vector3(
                    event.clientX * canvasScaleX, 
                    event.clientY * canvasScaleY
                    )
                ));
        });

        this.lastTime = 0;
        this.update(0);
    }

    getGenerators(){
        function orbGenerators(canvas){
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
        function enemyGenerators(canvas){
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

        return {
            orb: orbGenerators,
            enemy: enemyGenerators
        }
    }

    startEvents(){
        for (const eventType in this.publisher.eventLines) {
            document.addEventListener(eventType, (event) => {
                publisher.newEvent(new GameEvent(eventType, event));
            });
        } 

        this.publisher.clearEvents();
        publisher.startNotifications();
    }
    stopEvents(){
        publisher.stopNotifications();
    }

    generateEnemies(target, normalAmount, suicideAmount){
        let enemies = [];
        let minDistance = (x, y)=>{return (x*x)+(y*y) >= 2_250_000;};
    
        for (let i = 0; i < normalAmount; i++) {
    
            let coords = getNRandom(2, -1500, 1500, minDistance);
            let x = coords[0];
            let y = coords[1];
    
            console.log(x, y, minDistance(x, y));
    
            enemies.push(new NormalEnemy(target, new Vector3(x, y)));        
        }
        for (let i = 0; i < suicideAmount; i++) {
    
            let coords = getNRandom(2, -1500, 1500, minDistance);
            let x = coords[0];
            let y = coords[1];
    
            console.log(x, y, minDistance(x, y))
    
            enemies.push(new SuicideEnemy(target, new Vector3(x, y)));        
        }
        return enemies;
    }

    createEnemies(target, dt){
        let newEnemies = [];
    
        if(this.spawnTimer >= this.enemieSpawnTime){
            this.spawnTimer = 0;
            newEnemies = generateEnemies(target, ...enemiesGenerate);
    
            if(this.timesInvoked === 5){
                enemiesGenerate[getRandomNumber(0, this.spawnLevel)]++;
                this.spawnLevel++;
                this.timesInvoked = 0;
            }
        }
    
        this.spawnTimer += dt;
    
        return newEnemies;
    }

    fadeScreen(){
        ctx.beginPath();
        ctx.rect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = this.screenFadeGradient[this.screenFadeStep];
        ctx.fill();
        ctx.closePath();

        this.screenFadeStep++;
    }

    update(timeStamp){
        let dt = timeStamp - lastTime;
        lastTime = timeStamp;
    
        clear(ctx, cnv);

        player.update(dt);

        enemies.forEach((e) => {
            e.update(dt);
        });

        enemies = enemies.filter(e => e.isAlive());

        requestAnimationFrame(this.update);
    }

    draw(){
        player.draw(ctx);
        enemies.forEach((e) => {
            e.update(dt * 0.01);
            e.draw(ctx);
        });

        this.startOrFinish && this.fadeScreen();

    }

    clear(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    startLoop(){

    }
    stopLoops(){
        this.publisher.startNotifications();
        cancelAnimationFrame(this.update);
    }
}