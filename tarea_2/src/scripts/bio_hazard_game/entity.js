class Entity extends GraphicItem{

    constructor(pos = new Vector3(), radius = 0, idComponent = ""){
        super(pos, radius * 2, radius * 2);

        this.id = generateID("e" + idComponent);

        this.aabb = new AABB(pos, radius);
    
        this.genericEventList = new EventArray();
    }

    setPos(x = 0, y = 0, z = 0){
        this.pos = new Vector3(x, y, z);

        this.aabb.center.x = this.pos.x + (this.width * 0.5);
        this.aabb.center.y = this.pos.y + (this.heigh * 0.5);
    }
    setAABBRadius(newRadius){
        this.aabb.radius = newRadius;
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
            speedVector.x /= speedNorm;
            speedVector.y /= speedNorm;

            speedVector.x *= this.maxSpeed;
            speedVector.y *= this.maxSpeed;
        }

        return new Vector3(speedVector.x, speedVector.y, 0);
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

    constructor(pos = new Vector3()){
        super(pos, 20, 10, 100, "PE");

        this.collisionEventList = new EventArray();
        this.mousemoveEventList = new EventArray();
        this.targetPos = new Vector3(pos.x, pos.y, pos.z);
        // You know js is shit when all params are references
    }

    getEventList(eventName){
        switch(eventName){
            case "collision": return this.collisionEventList;
            case "mousemove": return this.mousemoveEventList;
            default: return this.genericEventList;
        }
    }

    followTarget(){
        if(!this.mousemoveEventList.finish()){
            this.targetPos = this.mousemoveEventList.getLast().eventInfo;
            this.mousemoveEventList.reset();
        }

        const xDistance = this.targetPos.x - this.pos.x;
        const yDistance = this.targetPos.y - this.pos.y;

        return new Vector3(xDistance, yDistance, 0);

    }

    draw(ctx){
        console.log(this.pos);

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.aabb.radius, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

}

class EnemyEntity extends LivingEntity {
    constructor(pos){
        super(pos, 10, 5, 5, "EE");
        
    }
}