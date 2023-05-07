class GameEvent{
    #type = "generic";
    #source = null;
    #destination = null;
    #timeStamp = 0;
    #expiracyDate = -1;
    #cyclesAge = 0;

    GameEvent(type = "generic", src = null, dest = null, expiracy = -1){
        this.#type = type;
        this.#source = src;
        this.#destination = dest;

        this.#timeStamp = +(new Date());
        this.#expiracyDate = +(new Date()) + expiracy;
    }

    getType(){return this.#type;}
    getSource(){return this.#source;}
    getDestination(){return this.#destination;}
    getTimeStamp(){return this.#timeStamp;}
    getExpiracyDate(){return this.#expiracyDate;}
    getCyclesAge(){return this.#cyclesAge;}

    addAge(){
        this.#cyclesAge += 1;
    }

    longevity(){
        return +(new Date()) - this.#timeStamp;
    }
    expires(){
        return this.#timeStamp > this.#expiracyDate;
    }
    expired(){
        return this.expires() && +(new Date()) < this.#expiracyDate;
    }
}

class EventArray{
    events = [new GameEvent()];
    nullEvent = new GameEvent("none");
    #ignored = [new GameEvent()];

    checkState = false;

    EventArray(...events){
        this.events.pop();
        this.#ignored.pop();

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
        this.events = this.#ignored;
        this.#ignored = [];
    }

    get(){
        return this.events[0];
    }

    // Handle methods
    dispatch(){
        return this.shift();
    }
    ignore(){
        let e = this.shift();
        e.addAge();
        this.#ignored.push(e);
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
                case "discard": this.dispatch(); return this.nullEvent;
                case "get": return this.get();
                case "next": this.ignore(); return this.get();
                case "reset": this.reset(); return this.nullEvent;
                default: return this.nullEvent;
            }
        }
    }

    // Get info methods
    length(){
        return this.events.length;
    }
    finish(){
        return this.length === 0;
    }

}

class EventBus{
    eventType = "generic";
    subscribers = [];
    events = new EventArray();

    EventBus(type = "generic"){
        this.eventType = type;
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
            sub.getEvent(this.events.get());
        });
        this.events.shift();
    }

    sendAllEvents(){
        for (let i = 0; i < this.events.length; i++) {
            this.sendNextEvent();
        }
    }

}

class EventPublisher{
    events = new EventArray();
    eventLines = {"generic": new EventBus()};

    isSubscribed(sub, eventType){
        return this.eventLines[eventType].isSubscribed(sub);
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

        if(result >= 0b10){
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
        return this.eventLines[eventType].unsubscribe(sub);
    }

    newEvent(event){
        this.events.push(event);
    }

    notifyNextEvent(){
        if(this.events.finish()){
            return;
        }

        this.eventLines.forEach(bus =>{
            bus.newEvent(this.events.get());
        });
        this.events.dispatch();
    }

    notifyAllEvents(){
        while(!this.events.finish()) {
            this.eventLines.forEach(bus =>{
                bus.newEvent(this.events.get());
            });
            this.events.dispatch();
        }
    }
}