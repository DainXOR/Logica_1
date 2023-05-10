class Entity extends GraphicItem{

    constructor(pos = new Vector3(), radius = 0, idComponent = ""){
        super(pos, radius * 2, radius * 2);

        this.id = generateID("e" + idComponent);

        this.aabb = new AABB(this.pos, radius);
    
        this.genericEventList = new EventArray();
    }

    setPos(...coords){
        let newPosVector = new Vector3();
        if(coords.length >= 2){
            newPosVector = new Vector3(...coords);
        } else if(coords[0] instanceof Vector3){
            newPosVector = coords[0];
        }

        this.pos = newPosVector;

        this.aabb.center.x = this.pos.x + (this.width * 0.5);
        this.aabb.center.y = this.pos.y + (this.heigh * 0.5);
    }
    setAABBRadius(newRadius){
        this.aabb.radius = newRadius;
    }

    getEventList(eventName){
        return this.genericEventList;
    }

    isLiving(){return false;}
    isItem(){return false;}
    isStructure(){return false;}
    isProyectile(){return false;}

}

let entityCounts = [0, 0, 0, 0, 0];

class LivingEntity extends Entity {
    static count = 0;

    constructor(pos = new Vector3(), maxSpeed = 10, radius = 10, hp = 1, idComponent = ""){
        super(pos, radius, "l-" + LivingEntity.count + idComponent);
        LivingEntity.count += 1;

        this.maxSpeed = maxSpeed;
        this.hitPoints = hp;
    }

    isLiving(){return true;}

    followTarget(){return new Vector3(0, 0, 0);}
    limitSpeed(speedVector){
        let speedSqrX = speedVector.x * speedVector.x;
        let speedSqrY = speedVector.y * speedVector.y;

        if (speedSqrX + speedSqrY > (this.maxSpeed * this.maxSpeed)){
            const speedNorm = Math.sqrt(speedSqrX + speedSqrY);
            speedSqrX /= speedNorm;
            speedSqrY /= speedNorm;
        }

        return new Vector3(speedSqrX, speedSqrY, 0);
    }

    move(dt){
        let speed = this.followTarget();
        speed = this.limitSpeed(speed);

        speed.x *= dt;
        speed.y *= dt;

        this.setPos(this.pos.x + speed.x,
                    this.pos.y + speed.y);
        return;
    }

    update(dt){
        this.move(dt);
        

    }
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

class PlayerEntity extends LivingEntity {

    constructor(pos){
        super(pos, 8, 5, "PE");

    }

}

class EnemyEntity extends LivingEntity {
    constructor(pos){
        super(pos, 10, 5, "EE");
        
    }
}