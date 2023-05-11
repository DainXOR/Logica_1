let publisher = new EventPublisher();

let player = new PlayerEntity();
publisher.subscribe(player, "mousemove");


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
        console.log("In queue: " + publisher.events.events.length);
        console.log("Events: " + publisher.events.events);
    }
});

function draw(pos, ctx) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
}

function clear(context, canvas){
    context.clearRect(0, 0, canvas.width, canvas.height);
}

document.addEventListener("DOMContentLoaded", () => {

    let cnv = document.getElementById("game_screen");
    let ctx = cnv.getContext('2d');

    cnv.addEventListener("mousemove", (event) => {
        publisher.newEvent(new GameEvent("mousemove", new Vector3(event.x, event.y, 0)));
    });
    
    let lastTime = 0;
    publisher.startNotifications(0.1);
    function gameLoop(time){
        dt = time - lastTime;
        lastTime = time;
    
        player.update(dt);
        // console.log(player.pos);
    
        clear(ctx, cnv);
        draw(player.pos, ctx);
        
        requestAnimationFrame(gameLoop);
    
    }
    
    gameLoop(0);
    

});