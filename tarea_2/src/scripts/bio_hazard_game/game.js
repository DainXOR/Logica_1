class Game {
    constructor(width, height, level = 1){
        this.width = width;
        this.height = height;

        
    }

    // Fix all this mess
    getGenerators(){
        
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
    constructor(itemClass, typesNames = [], typesArgs = [[]], minType = 0, maxType = 0, cooldownSeconds = 1, spawnArea = new BC()){
        if(typesNames.length !== typesArgs.length){
            throw new Error("Arguments amounts missmatch.");
        }

        this.types = {};
        this.typesOrder = typesNames;
        for(let i = 0; i < typesNames.length; i++){
            this.types[typesNames[i]] = typesArgs[i];

        }
        this.class = itemClass;
        generateAmounts = [];
        for (let i = 0; i < this.arguments.length; i++) {
            this.generateAmounts[i] = 1;
            
        }
        this.minSpawnType = minType;
        this.maxSpawnType = maxType;
        this.spawnTime = 1000 * cooldownSeconds;
        this.spawnTimer = 0;
        this.succedSpawnsCount = 0;

        this.spawnArea = spawnArea;
        this.spawnPredicate = () => true;
        this.hasSpawnCallback = false;
        this.onSpawn = () => {};
    }

    setGenAmounts(amounts){
        this.generateAmounts = amounts;
    }
    setMinMaxTypes(minMax = {min: -1, max: -1}){
        minMax.min > 0 && (this.minSpawnType = minMax.min);
        minMax.max > 0 && (this.maxSpawnType = minMax.max);
    }
    setSpawnTime(ms){
        this.spawnTime = ms;
    }
    setSpawnArea(area){
        this.spawnArea = area;
    }
    setSpawnPredicate(predicate){
        this.spawnPredicate = predicate;
    }
    setOnSpawnCallback(callback, internalArgs){
        this.onSpawn = callback;
        this.internalArgs = internalArgs;
    }

    addType(...objArgs){
        this.arguments.push(objArgs);
        this.generateAmounts.push(0);
    }
    addSpawnAmount(typeIndex, amount){
        this.generateAmounts[typeIndex] += amount;
    }

    createNew(typeName, zIndex = 0){
        let coords = getNRandom(2, this.spawnArea.center.x - this.spawnArea.radius, 
                                   this.spawnArea.center.y + this.spawnArea.radius, 
                                   (x, y) => {return this.spawnArea.contains(x, y) && predicate(x, y)});
        let x = coords[0];
        let y = coords[1];

        return new this.class(new Vector3(x, y, zIndex), ...this.types[typeName]);
    }
    createMany(amounts, zIndexes){
        let objects = [];

        for (let i = 0; i < amounts.length; i++) {
            for (let j = 0; j < amounts[i]; j++) {
                objects.push(this.createNew(...this.types[this.typesOrder[j]], zIndexes[i]));   
            }
        }
        return objects;
    }

    generate(dt){
        let newObjects = [];
        this.spawnTimer += dt;

        if(this.spawnTimer >= this.spawnTime){
            this.spawnTimer = 0;
            this.succedSpawnsCount++;
            newObjects = this.createMany(this.generateAmounts, 0);

            if(this.hasSpawnCallback){

                let effectiveIndices = [];
                let posArgs = this.internalArgs;
                let posibleArgs = [this.minSpawnType, this.maxSpawnType, this.succedSpawnsCount, this.spawnArea];

                for (let i = 0; posArgs !== 0; i++) {
                    effectiveIndices.push((posArgs & 1) * i);
                    posArgs >>= 1; 
                }
        
                let effectiveArgs = posibleArgs.filter((_, i)=>{return effectiveIndices.includes(i);});

                this.onSpawn(...effectiveArgs);

            }
        }

        return newObjects;
    }

    orbGenerators(canvas){
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
    enemyGenerators(canvas){
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
    structureGenerators(canvas){

    }
}
