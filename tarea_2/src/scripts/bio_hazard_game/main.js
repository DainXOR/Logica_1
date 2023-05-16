let publisher = new EventPublisher();

function generateEnemies(target, normalAmount, suicideAmount){
    let enemies = [];
    for (let i = 0; i < normalAmount; i++) {
        let x = getRandomNumber(0, 1000);
        let y = getRandomNumber(0, 1000);

        let radius = getRandomNumber(10, 50);
        let speed = 10 - ((5 / 50) * radius);

        enemies.push(new EnemyEntity(target, new Vector3(x, y), speed, radius));        
    }
    for (let i = 0; i < suicideAmount; i++) {
        let x = getRandomNumber(0, 1000);
        let y = getRandomNumber(0, 1000);

        enemies.push(new SuicideEnemy(target, new Vector3(x, y)));        
    }
    return enemies;
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

    if(event.key === "i"){
        // console.log("In queue: " + publisher.events.events.length);
        // console.log("Events: " + publisher.events.events);
        console.log(player.pos);
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

    canvasScaleX = cnv.width / cnv.clientWidth;
    canvasScaleY = cnv.height / cnv.clientHeight;

    let player = new PlayerEntity(new Vector3(cnv.width * 0.5, cnv.height * 0.5));
    publisher.subscribe(player, "mousemove");

    let enemies = generateEnemies(player, 3, 2);
    // enemies = [];

    cnv.addEventListener("mousemove", (event) => {
        //console.log("Original:", event.x, event.y);
        //console.log("Scaled:",
        //    event.x * canvasScaleX, 
        //    event.y * canvasScaleY);

        publisher.newEvent(new GameEvent(
            "mousemove", 
            new Vector3(
                event.x * canvasScaleX, 
                event.y * canvasScaleY
                )
            ));
    });
    
    let lastTime = 0;

    function gameLoop(timeStamp){
        dt = timeStamp - lastTime;
        lastTime = timeStamp;
    
        clear(ctx, cnv);

        const offset = player.update(dt);
        player.draw(ctx, false, false);

        enemies.forEach((e) => {
            e.update(dt, offset);
            e.draw(ctx, false);
        });

        enemies = enemies.filter(e => e.isAlive());

        requestAnimationFrame(gameLoop);
    
    }

    publisher.startNotifications(1);
    gameLoop(0);
    

});