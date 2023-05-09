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

// publisher.newEvent(new GameEvent("keypress"));
publisher.newEvent(new GameEvent("generic", e1, e3));
publisher.notifyAllEvents();

console.log(e1.genericEventList);
console.log(e2.genericEventList);
console.log(e3.genericEventList);
console.log(e4.genericEventList);

console.log(e1);
console.log(e2);
console.log(e3);
console.log(e4);


