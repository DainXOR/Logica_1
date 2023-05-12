class GameEvent{
    constructor(type = "generic", info = null, src = null, dest = null, expiracy = -1){

        expiracy = expiracy <= 0? -100_000 : expiracy;

        this.type = type;
        this.eventInfo = info;
        this.source = src;
        this.destination = dest;

        if(type === "none"){
            this.timeStamp = 0;
            this.expiracyDate = 0;
    
        } else{
            this.timeStamp = +(new Date());
            this.expiracyDate = +(new Date()) + expiracy;
        }

        this.cyclesAge = 0;
    }

    getType(){return this.type;}
    getInfo(){return this.eventInfo;}
    getSource(){return this.source;}
    getDestination(){return this.destination;}
    getTimeStamp(){return this.timeStamp;}
    getExpiracyDate(){return this.expiracyDate;}
    getCyclesAge(){return this.cyclesAge;}

    addAge(){
        this.cyclesAge += 1;
    }

    longevity(){
        return +(new Date()) - this.timeStamp;
    }
    expires(){
        return this.timeStamp > this.expiracyDate;
    }
    expired(){
        return this.expires() && +(new Date()) < this.expiracyDate;
    }
}

class EventArray{

    static noneEvent = new GameEvent("none");

    constructor(...events){
        this.events = [new GameEvent()];
        this.nullEvent = new GameEvent("none");
        this.ignored = [new GameEvent()];
        this.checkState = false;

        this.events.shift();
        this.ignored.shift();

        if(events.length !== 0){
            this.events = [...events];
        }
    }

    // Add / remove element methods
    push(event){
        this.events.push(event);
    }
    add(...events){
        for (let i = 0; i < events.length; i++) {
            this.push(events[i]);
        }
    }
    emplace(...eventArgs){
        this.push(new GameEvent(...eventArgs));
    }
    shift(){
        return this.events.shift();
    }
    reset(){
        this.events = this.ignored;
        this.ignored = [];
    }

    get(){
        if (this.length === 0) {
            return EventArray.noneEvent;
        }
        return this.events[0];
    }
    getLast(){
        if (this.length === 0){
            return EventArray.noneEvent;
        }
        return this.events[this.length - 1];
    }

    // Handle methods
    dispatch(){
        return this.shift();
    }
    ignore(){
        let e = this.shift();
        e.addAge();
        this.ignored.push(e);
        return;
    }

    // Test -> Action
    if(predicate){
        this.checkState = false;
        if(predicate(this.get())){
            this.checkState = true;
        }
        return this;
    }
    then(action){
        if(this.checkState){
            switch (action) {
                case "dispatch": return this.dispatch();
                case "ignore": return this.ignore();
                case "discard": this.dispatch(); return EventArray.noneEvent;
                case "get": return this.get();
                case "next": this.ignore(); return this.get();
                case "reset": this.reset(); return EventArray.noneEvent;
                default: return this.nullEvent;
            }
        }
    }

    // Get info methods
    get length(){
        return this.events.length;
    }
    finish(){
        return this.length === 0;
    }

}

class EventBus{
    constructor(type = "generic"){
        this.eventType = type;
        this.subscribers = [];
        this.events = new EventArray();

        return this;
    }

    isSubscribed(sub){
        for (let i = 0; i < this.subscribers.length; i++) {
            if(this.subscribers[i] === sub){
                return i;
            }
        }
        return false;
    }

    subscribe(newSub){
        this.subscribers.push(newSub);
    }
    unsubscribe(sub){
        let spot = this.isSubscribed(sub);
        if(spot !== false){
            this.subscribers.splice(spot, 1);
            return true;
        }
        return false;
    }

    newEvent(event){
        this.events.push(event);
    }

    sendNextEvent(){
        this.subscribers.forEach(sub => {
            sub.getEventList(this.eventType).push(this.events.get());
        });
        this.events.dispatch();
    }

    sendAllEvents(){
        this.subscribers.forEach(sub => {
            sub.getEventList(this.eventType).events = this.events.events.slice();
        });
        this.events.reset();
        

        // for (let i = 0; i < this.events.length; i++) {
        //     this.sendNextEvent();
        // }
    }

}

class EventPublisher{
    constructor(){
        this.events = new EventArray();
        this.eventLines = {"generic": new EventBus()};

        this.enfID = 0;
        this.ennfID = 0;
    }

    isSubscribed(sub, eventType){
        return (eventType in this.eventLines) && this.eventLines[eventType].isSubscribed(sub);
    }

    checkSubscription(sub, eventType){
        let result = 0b00;

        if(eventType !== "generic" && this.isSubscribed(sub, "generic")){
            this.unsubscribe(sub, "generic");
            result += 0b01;
        }
        if(this.isSubscribed(sub, eventType) !== false){
            result += 0b10;
        }

        return result;

    }

    subscribe(sub, eventType){

        let result = this.checkSubscription(sub, eventType);

        if(result >= 0b010){
            return result;
        }

        if(!(eventType in this.eventLines)){
            this.eventLines[eventType] = new EventBus(eventType);
            result += 0b100;
        }

        this.eventLines[eventType].subscribe(sub);
        return result;
    }
    unsubscribe(sub, eventType){
        if(this.isSubscribed(sub, eventType)){
            return this.eventLines[eventType].unsubscribe(sub);
        }
        return false;
    }

    newEvent(event){
        this.events.push(event);
    }

    notifyNextEvent(){
        if(this.events.finish()){
            return false;
        }

        const eventType = this.events.get().type;
        this.eventLines[eventType].newEvent(this.events.get());
        this.eventLines["generic"].newEvent(this.events.dispatch());

        this.eventLines[eventType].sendNextEvent();
        this.eventLines["generic"].sendNextEvent();

        return true;
    }

    notifyAllEvents(){

        while(!this.events.finish()) {
            const event = this.events.get();

            this.eventLines[event.type].newEvent(this.events.get());
            this.eventLines["generic"].newEvent(this.events.dispatch());
        }

        for(let type in this.eventLines){
            this.eventLines[type].sendAllEvents();
        }

        
    }

    startNotifications(debugDelayMultiplier = 0){
        if(this.enfID !== 0 || this.ennfID !== 0){
            return;
        }

        let thisReference = this;

        function notifyAllWrapper(){
            thisReference.notifyAllEvents();
        }

        function notifyNextWrapper(){
            thisReference.notifyNextEvent();
        }

        this.enfID = setInterval(notifyAllWrapper, 5 * debugDelayMultiplier);
        this.ennfID = setInterval(notifyNextWrapper, 1 * debugDelayMultiplier);
    }
    stopNotifications(){
        clearInterval(this.enfID);
        clearInterval(this.ennfID);
    }

}
