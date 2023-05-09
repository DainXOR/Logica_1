class Entity extends GraphicItem{

    constructor(id, pos = new Vector3(), radius = 0){
        super(pos);

        this.id = "e" + id;

        this.aabb = new AABB(this.pos, radius);
    
        this.genericEventList = new EventArray();
        this.collisionEventList = new EventArray();
        this.keypressEventList = new EventArray();
        this.clickEventList = new EventArray();
        this.mousemoveEventList = new EventArray();
    }

    setPos(...coords){
        this.pos = new Vector3().init(...coords);
        this.aabb.center.x = this.pos.x + (this.width * 0.5);
        this.aabb.center.y = this.pos.y + (this.heigh * 0.5);
    }
    setAABBRadius(newRadius){
        this.aabb.radius = newRadius;
    }

    getEventList(eventName){
        switch(eventName){
            case "collision":   return this.collisionEventList;
            case "keypress":    return this.keypressEventList;
            case "click":       return this.clickEventList;
            case "mousemove":   return this.mousemoveEventList;
            default:            return this.genericEventList;
        }
    }

    isLiving(){return false;}
    isItem(){return false;}
    isStructure(){return false;}
    isProyectile(){return false;}

}



class LivingEntity extends Entity {
    constructor(id){
        super("l-" + id);
    }

    isLiving(){return true;}
}

class Item extends Entity {
    constructor(id){
        super("i-" + id);
    }

    isItem(){return true;}
}

class Structure extends Entity {
    constructor(id){
        super("s-" + id);
    }

    isStructure(){return true;}
}

class Proyectile extends Entity {
    constructor(id){
        super("p-" + id);
    }

    isProyectile(){return true;}
}