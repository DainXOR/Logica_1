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
    isDamaging(){return false;}
    isPlayerDamaging(){return false;}

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
    isAlive(){return this.hitPoints > 0;}

    followTarget(){return new Vector3();}
    limitSpeed(speedVector){
        let speedSqrX = speedVector.x * speedVector.x;
        let speedSqrY = speedVector.y * speedVector.y;
        
        // Well, this is weird, but im not complaining (in this use case)
        const speedNorm = Math.sqrt(speedSqrX + speedSqrY) || 1;
        speedVector.x /= speedNorm;
        speedVector.y /= speedNorm;

        speedVector.x *= this.maxSpeed;
        speedVector.y *= this.maxSpeed;

        return new Vector3(speedVector.x, speedVector.y);
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
    hurt(damage){
        this.hitPoints -= damage;
    }
    die(){
        this.hitPoints = 0;
    }

    update(dt){
        this.isAlive() && this.move(dt);
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

class DamageEntity extends Entity{
    constructor(
        typeName, 
        pos = new Vector3(), 
        radius = new Vector3(), 
        baseDamage = 0, 
        duration = -1, 
        damageChangeFormula = (baseDmg)=>{return baseDmg;}, 
        onImpact = ()=>{}, 
        onExpire = ()=>{})
        {
        super(pos, radius, "DMG" + typeName);

        this.typeName = typeName;
        this.damageBase = baseDamage;
        this.damageFormula = damageChangeFormula;
        this.age = 0;
        this.duration = duration;
        this.onImpact = onImpact;
        this.onExpire = onExpire;
    }

    draw(ctx){

    }

    update(dt){

    }
}

class Proyectile extends DamageEntity {
    constructor(pos, speed, uses, damage, 
        damageFormula = (dmg, uses)=>{return dmg * (1 / uses);}, 
        onImpact = ()=>{})
    {
        super("-PRC_PROY", pos, 2, damage, -1, damageFormula, onImpact);

        this.baseSpeed = speed;
        this.baseUses = uses;
        this.usesCount = 0;
    }

    move(dt){
        let speed = new Vector3();
        
        speed.x = this.baseSpeed * dt;
        speed.y = this.baseSpeed * dt;

        this.setPos(this.pos.x + speed.x,
                    this.pos.y + speed.y);
        return;
    }

    isDamaging(){return true;}
    isProyectile(){return true;}

}
class PierceProyectile extends Proyectile {
    constructor(pos, speed, uses, damage, 
        damageFormula = (dmg, uses)=>{return dmg * (1 / uses);}, 
        onImpact = ()=>{})
        {
        super("-PRC_PROY", pos, 2, damage, -1, damageFormula, onImpact);

        this.baseSpeed = speed;
        this.baseUses = uses;
        this.usesCount = 0;
    }

    isDamaging(){return true;}
    isProyectile(){return true;}
}
class ImpactProyectile extends Proyectile {
    constructor(pos, radius){
        super(pos, radius, "")
    }

}
class FollowProyectile extends Proyectile {
    
}


class AreaOfEffect extends DamageEntity {

}


class PlayerEntity extends LivingEntity {

    constructor(pos = new Vector3()){
        super(pos, 15, 10, 200, "PE");

        this.collisionEventList = new EventArray();
        this.mousemoveEventList = new EventArray();
        this.targetPos = new Vector3(pos.x, pos.y, pos.z);
        // You know js is shit when all params are references and need something like this

        this.inmunityTime = 60; // Cicles

    }

    getEventList(eventName){
        switch(eventName){
            case "collision": return this.collisionEventList;
            case "mousemove": return this.mousemoveEventList;
            default: return this.genericEventList;
        }
    }

    followTarget(){
        if(!this.mousemoveEventList.finish() && 
            this.mousemoveEventList.getLast() !== EventArray.noneEvent){

            this.targetPos = this.mousemoveEventList.getLast().eventInfo;
            this.mousemoveEventList.reset();
        }
        
        const xDistance = this.targetPos.x - this.pos.x;
        const yDistance = this.targetPos.y - this.pos.y;

        return new Vector3(xDistance, yDistance, 0);
    }
    /*
    limitSpeed(speedVector){
        const sqrtNormalizer = 7.07; // Sqrt(50) aprox. For 50px radius
        const isNegativeX = speedVector.x < 0;
        const isNegativeY = speedVector.y < 0;

        speedVector.x = Math.sqrt(Math.abs(speedVector.x)) / sqrtNormalizer;
        speedVector.y = Math.sqrt(Math.abs(speedVector.y)) / sqrtNormalizer;

        speedVector.x > 1 && (speedVector.x = 1);
        speedVector.y > 1 && (speedVector.y = 1);

        speedVector.x *= this.maxSpeed;
        speedVector.y *= this.maxSpeed;

        isNegativeX && (speedVector.x *= -1);
        isNegativeY && (speedVector.y *= -1);

        return new Vector3(speedVector.x, speedVector.y);
    }*/

    hurt(damage){
        if(this.inmunityTime === 0){
            this.hitPoints -= damage;
            this.inmunityTime = 60;
            console.log(this.hitPoints);
            return;
        }
        return;
    }
    draw(ctx){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.aabb.radius, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    }

    update(dt){
        this.isAlive() && this.move(dt);
        this.inmunityTime > 0 && (this.inmunityTime -= 1);
    }

}

class EnemyEntity extends LivingEntity {
    constructor(target = null, pos = new Vector3(), speed = 8, radius = 5, hp = 1){
        super(pos, speed, radius, hp, "EE");
        this.target = target;
        
    }

    setTarget(entity){
        this.target = entity;
    }

    followTarget(){
        if(this.target === null){
            return this.pos;
        }
           
        const xDistance = this.target.pos.x - this.pos.x;
        const yDistance = this.target.pos.y - this.pos.y;

        return new Vector3(xDistance, yDistance, 0);
    }

    hurtTarget(){
        this.target.hurt((this.aabb.radius * this.maxSpeed) / 2);
        this.die();
        return true;
    }

    cathTarget(){
        this.aabb.isColliding(this.target.aabb) &&
        this.hurtTarget();
    }


    draw(ctx){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.aabb.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#00ff00";
        ctx.fill();
        ctx.closePath();
    }

    update(dt){
        if(this.isAlive()){
            this.move(dt);
            this.cathTarget();
        }
    }
}