class game {
    constructor(width, height){
        this.width = width;
        this.height = height;

        this.canvas = document.getElementById("game_screen");
        this.context = cnv.getContext('2d');
    
        cnv.width = 1000;
        cnv.height = 1000;

        this.publisher = new EventPublisher();
    
    }

    generateEnemies(normalAmount, suicideAmount){
        let enemies = [];
        for (let i = 0; i < normalAmount; i++) {
            let x = getRandomNumber(0, this.canvas.width);
            let y = getRandomNumber(0, this.canvas.height);
    
            let radius = getRandomNumber(10, 50);
            let speed = 10 - ((5 / 50) * radius);
    
            enemies.push(new EnemyEntity(player, new Vector3(x, y), speed, radius));        
        }
        for (let i = 0; i < suicideAmount; i++) {
            let x = getRandomNumber(0, this.canvas.width);
            let y = getRandomNumber(0, this.canvas.height);
    
            enemies.push(new SuicideEnemy(player, new Vector3(x, y)));        
        }
        return enemies;
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