class Game {
    constructor(width, height, level = 1){
        this.width = width;
        this.height = height;

        
    }

    // Fix all this mess
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
        
            this.Test = 0;
            let orbsGenerate = [20, 0, 0, 0, 0, 0];
            let orbTypes = orbsGenerate.length;
            let orbSpawnTime = 1000 * 0.5;
            let orbSpawnTimer = 0;
            let orbTimesInvoked = 0;
            let orbSpawnLevel = 0;
        
            let minOrbType = 0;
            let maxOrbType = 0;
            let orbUpgradeInvokes = 100;

            function settings(){
                this.orbsGenerate = [20, 0, 0, 0, 0, 0];
                this.orbTypes = orbsGenerate.length;
                this.orbSpawnTime = 1000 * 0.5;
                this.orbSpawnTimer = 0;
                this.orbTimesInvoked = 0;
                this.orbSpawnLevel = 0;
            
                this.minOrbType = 0;
                this.maxOrbType = 0;
                this.orbUpgradeInvokes = 100;

                return {
                    amounts: orbsGenerate,
                    spawnTime: orbSpawnTime,
                    spawnLevel: orbSpawnLevel,
                    minType: minOrbType,
                    maxType: maxOrbType,
                    upgradeTimer: orbUpgradeInvokes,
                    test: this.Test
                }
            }
        
            function createNew(type, radius = 3000, 
                center = new Vector3(canvas.width * 0.5, canvas.height * 0.5),
                predicate = () => {return true;}){
        
                let coords = getNRandom(2, center.x - radius, center.y + radius, predicate);
                let x = coords[0];
                let y = coords[1];
            
                return new Orb(new Vector3(x, y), ...orbType[type]);
            }
            function createMany(...amounts){
                let orbs = [];
            
                for (let i = 0; i < amounts[0]; i++) {
                    orbs.push(createNew("blue"));
                }
                for (let i = 0; i < amounts[1]; i++) {
                    orbs.push(createNew("green"));
                }
                for (let i = 0; i < amounts[2]; i++) {
                    orbs.push(createNew("yellow"));
                }
                for (let i = 0; i < amounts[3]; i++) {
                    orbs.push(createNew("violet"));
                }
                for (let i = 0; i < amounts[4]; i++) {
                    orbs.push(createNew("red"));
                }
                for (let i = 0; i < amounts[5]; i++) {
                    orbs.push(createNew("black"));
                }
                
                return orbs;
            }
            function generate(dt){
                let newOrbs = [];
                orbSpawnTimer += dt;
            
                if(orbSpawnTimer >= orbSpawnTime){
                    orbSpawnTimer = 0;
                    orbTimesInvoked += 1;
                    newOrbs = createMany(...orbsGenerate);
            
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
                createNew,
                createMany,
                generate,
                settings
            };
        }
        function enemyGenerators(canvas){
            this.enemyStartAmounts = [10, 0, 0, 0, 0, 0, 0];
            this.enemyTypeCount = this.enemyStartAmounts.length;
            this.enemySpawnTime = 1000 * 2;
            this.enemySpawnTimer = 0;
            this.enemySpawnCount = 0;
            this.enemySpawnLevel = 3;
        
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
                this.enemySpawnTimer += dt;
            
                if(this.enemySpawnTimer >= this.enemySpawnTime){
                    this.enemySpawnTimer = 0;
                    this.enemySpawnCount += 1;
                    newEnemies = createEnemies(target, ...this.enemyStartAmounts);
            
                    if(this.enemySpawnCount >= this.enemyLevelUpSpawnCount){
                        this.enemyStartAmounts[getRandomInt(0, Math.min(this.enemySpawnLevel, this.enemyTypeCount - 1))]++;
                        this.enemySpawnLevel++;
                        this.enemySpawnCount = 0;
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
        function structureGenerators(canvas){

        }

        return {
            orb: orbGenerators,
            enemy: enemyGenerators,
            structs: structureGenerators
        }
    }

    setupCanvas(id){
        this.canvas = document.getElementById(id);
        this.context = this.canvas.getContext('2d');

        this.canvas.width = 1000;
        this.canvas.height = 1000;
    }
    setupActors(){
        this.player = new PlayerEntity(new Vector3(this.canvas.width * 0.5, this.canvas.height * 0.5), this.canvas);

        this.orbGenerator = this.getGenerators().orb(this.canvas);
        this.enemyGenerator = this.getGenerators().enemy(this.canvas);
        this.structGenerator = this.getGenerators().structs(this.canvas);

        this.enemies = this.enemyGenerator.createMany(this.player, 10);
        this.orbs = this.orbGenerator.createMany(500);

        this.allEntities = this.orbs.concat(this.enemies);

        return;
    }
    setupPublisher(...subscribers){
        this.publisher = new EventPublisher();

        for (let i = 0; i < subscribers.length; i++) {
            this.publisher.subscribe(subscribers[i][0], subscribers[i][1]);
            
        }
        this.publisher.subscribe(this.player, "mousemove");
        
    }
    setupUtilities(level){
        this.startOrFinish = true;
        this.isPaused = false;
        this.onPauseScreen = false;
        this.onLevelScreen = false;
        this.onArtifactScreen = false;

        this.enemyStartAmounts = [20 * level, 0, 5 * ((level * level) - 1)];
        this.enemySpawnTime = 1000 * 2; // ms * seconds
        this.enemySpawnTimer = 0;
        this.enemySpawnCount = 0;
        this.enemySpawnLevel = 0;
        this.enemyLevelUpSpawnCount = 0;
        
        this.screenFadeStep = 0;
        this.screenFadeGradient = [];
        colorGradient("ffffff", "000000", 300).forEach(color => {
            this.screenFadeGradient.push("#000000" + color[4] + color[5]);
        });

    }
    setupGame(level){
        this.setupUtilities(level);
        this.setupCanvas("game_screen");
        this.setupActors();
        this.setupPublisher();

        this.qtree = new QuadTree(new Vector3(-5000, -5000), 10_000, 10_000, 8);
        for (let i = 0; i < this.allEntities.length; i++) {
            qtree.insert(this.allEntities[i]);
        }

        this.lastTime = 0;
    }

    startEvents(){
        for (const eventType in this.publisher.eventLines) {
            document.addEventListener(eventType, (event) => {
                publisher.newEvent(new GameEvent(eventType, event));
            });
        } 

        const canvasScaleX = this.canvas.width / this.canvas.clientWidth;
        const canvasScaleY = this.canvas.height / this.canvas.clientHeight;
    
        this.canvas.addEventListener("mousemove", (event) => {
            publisher.newEvent(new GameEvent(
                "mousemove", 
                new Vector3(
                    event.clientX * canvasScaleX, 
                    event.clientY * canvasScaleY
                    )
                ));
        });

        this.publisher.clearEvents();
        publisher.startNotifications();
    }
    stopEvents(){
        publisher.stopNotifications();
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
            e.draw(ctx);
        });

        this.startOrFinish && this.fadeScreen();

    }

    clear(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    startGame(){

    }
    stopGame(){
        this.publisher.startNotifications();
        cancelAnimationFrame(this.update);
    }
}

class Generator {
    
}