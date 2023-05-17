class game {
    constructor(width, height){
        this.width = width;
        this.height = height;

        this.canvas = document.getElementById("game_screen");
        this.context = cnv.getContext('2d');
    
        cnv.width = 1000;
        cnv.height = 1000;

        this.publisher = new EventPublisher();


        this.enemiesGenerate = [1];
        this.enemieSpawnTime = 1000;
        this.spawnTimer = 0;
        this.timesInvoked = 0;
        this.spawnLevel = 0;        
    
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

    update(timeStamp){
        let dt = timeStamp - lastTime;
        lastTime = timeStamp;
    
        clear(ctx, cnv);

        player.update(dt * 0.01);
        player.draw(ctx);

        enemies.forEach((e) => {
            e.update(dt * 0.01);
            e.draw(ctx);
        });

        enemies = enemies.filter(e => e.isAlive());

        requestAnimationFrame(this.update);
    }

    draw(){

    }

    clear(){
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    startLoop(){
        this.player = new PlayerEntity();
        publisher.subscribe(player, "mousemove");

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
    stopLoops(){
        this.publisher.startNotifications();
        cancelAnimationFrame(this.update);
    }
}