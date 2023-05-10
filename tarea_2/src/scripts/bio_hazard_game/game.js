let publisher = new EventPublisher();

let e1 = new Entity("e1");
let e2 = new Entity("e2");
let e3 = new Entity("e3");
let e4 = new Entity("e4");


console.log(publisher.subscribe(e1, "mousemove"));
console.log(publisher.subscribe(e1, "generic"));
console.log(publisher.subscribe(e1, "keypress"));
console.log(publisher.subscribe(e2, "keypress"));
publisher.subscribe(e4, "generic");


console.log(publisher.unsubscribe(e3, "generic"));
console.log(publisher.unsubscribe(e3, "keypress"));


document.addEventListener("keypress", (event)=>{
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
    }
});

function gameLoop(){

}
