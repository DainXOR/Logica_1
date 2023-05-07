let publisher = new EventPublisher();

console.log(publisher.subscribe("a", "mousemove"));
console.log(publisher.subscribe("a", "generic"));
console.log(publisher.subscribe("a", "keypress"));
console.log(publisher.subscribe("b", "keypress"));
console.log(publisher.subscribe("c", "keypress"));

console.log(publisher.unsubscribe("c", "generic"));
console.log(publisher.unsubscribe("c", "keypress"));