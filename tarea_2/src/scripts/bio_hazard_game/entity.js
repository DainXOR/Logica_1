class Entity extends GraphicItem{

    constructor(pos = new Vector3(), radius = 0, idComponent = ""){
        super(pos, radius * 2, radius * 2);

        this.id = generateID("e" + idComponent);

        this.aabb = new AABB(pos, radius);
    
        this.collisionEventList = new EventArray();
    }

    setPos(x = 0, y = 0, z = 0, offset = new Vector3()){
        this.pos = new Vector3(x + offset.x, y + offset.y, z);
        this.aabb.center = new Vector3(x + offset.x, y + offset.y, z);


        // this.aabb.center.x = this.pos.x + (this.width * 0.5);
        // this.aabb.center.y = this.pos.y + (this.heigh * 0.5);
    }
    setAABBRadius(newRadius){
        this.aabb.radius = newRadius;
    }

    move(dt, offset = new Vector3()){
        this.setPos(this.pos.x,
                    this.pos.y, 
                    0,
                    offset);
        return;
    }

    update(dt, offset){
        this.move(dt, offset);
    }

    isColliding(otherAABB){return this.aabb.isColliding(otherAABB);}
    isLiving(){return false;}
    isItem(){return false;}
    isStructure(){return false;}
    isProyectile(){return false;}
    isDamaging(){return false;}
    isPlayerDamaging(){return false;}

}

class DamageEntity extends Entity{
    constructor(
        typeName, 
        pos = new Vector3(), 
        radius = new Vector3(), 
        baseDamage = 0, 
        timeDuration = -1,
        damageFormula = (baseDmg)=>{return baseDmg;}, 
        onImpact = ()=>{}, 
        onExpire = ()=>{})
        {
        super(pos, radius, "DMG" + typeName);

        this.typeName = typeName;
        this.damageBase = baseDamage;
        this.damageFormula = damageFormula;
        this.age = 0;
        this.duration = timeDuration;
        this.onImpact = onImpact;
        this.onExpire = onExpire;
    }

    levelUpgrades(...buffs){
        this.test = {
            damageAdd: buffs[0],
            damageMult: buffs[1],
            radius: buffs[2],
            duration: buffs[3],
        };

        this.levelUpBuff = [...buffs];

    }

    upgrade(){
        return [];
    }

    isDamaging(){return true;}
}
class AreaOfEffect extends DamageEntity {

}
class Proyectile extends DamageEntity {
    constructor(pos, speed, uses, damage, radius, 
        damageFormula = (dmg, uses)=>{return dmg * (1 / uses);}, 
        onImpact = ()=>{}
        )
    {
        super("-PROY", pos, radius, damage, -1, damageFormula, onImpact);

        this.baseSpeed = speed;
        this.baseUses = uses;
        this.usesCount = 0;
    }

    move(dt, offset){
        let speed = new Vector3();
        
        speed.x = this.baseSpeed.x * dt;
        speed.y = this.baseSpeed.y * dt;

         this.setPos(this.pos.x + speed.x,
                    this.pos.y + speed.y, 
                    0,
                    offset);
        return;
    }

    draw(ctx){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.aabb.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.closePath();
    }

    update(dt, offset = new Vector3()){
        this.move(dt, offset);
    }

    isProyectile(){return true;}

}
class PierceProyectile extends Proyectile {
    constructor(pos, speed, uses, damage, 
        damageFormula = (dmg, uses)=>{return dmg * (1 / uses);}, 
        onImpact = ()=>{})
        {
        super(pos, 2, damage, -1, damageFormula, onImpact);

        this.baseSpeed = speed;
        this.baseUses = uses;
        this.usesCount = 0;
    }

    isDamaging(){return true;}
    isProyectile(){return true;}
}
class ImpactProyectile extends Proyectile {
    constructor(pos, speed, damage){
        super(pos, speed, 1, damage, 2);
    }

}
class FollowProyectile extends Proyectile {
    constructor(pos, speed, damage, target){
        super(pos, speed, 1, damage, 2);
    }
}

const Type = {
    SINGLE:     0b0_00_0,
    MULTIPLE:   0b0_00_1,

    LINE:       0b0_00_0,
    ARCH:       0b0_01_0,
    CLUSTER:    0b0_10_0,
    DIAGONAL:   0b0_11_0,

    AOE:        0b1_00_0,

};
const Direction = {
    FRONT:      0b00_00,
    BACK:       0b00_01,
    SIDES:      0b00_10,
    DIAGONAL:   0b00_11,

    STATIC:     0b00_00,
    ROTATE:     0b01_00,
    OSCILATE:   0b10_00,

};

class Weapon {
    constructor(
        attackClass = Proyectile, 
        cooldown = 200, 
        attackType = Type.SINGLE | Type.LINE, 
        count = 1, 
        attackDirection = Direction.FRONT | Direction.STATIC,
        ){

        this.attack = attackClass;
        this.attackType = attackType;
        this.attackDirection = attackDirection;
        this.attackLevel = 1;

        this.cooldown = cooldown;
        this.downTime = 0;

        this.clusterCount = count;
    }

    
    #castAttack(pos, ...args){
        return new this.attack(pos, ...args);
    }

    cool(dt){
        this.downTime > 0 && (this.downTime -= dt);
    }
    onDownTime(){
        return this.downTime === 0;
    }

    upgrade(){
        this.attackLevel += 1;

    }

    shoot(dtMs, ...attackArgs){
        if(!this.onDownTime()){
            this.downTime = this.cooldown;
            const attack = this.#castAttack(...attackArgs);
            return attack;
        }
        this.cool(dtMs);
        return null;
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


class LivingEntity extends Entity {
    static count = 0;

    constructor(pos = new Vector3(), maxSpeed = 10, radius = 10, hp = 1, idComponent = ""){
        super(pos, radius, "l-" + LivingEntity.count + idComponent);
        LivingEntity.count += 1;

        this.maxSpeed = maxSpeed;
        this.hitPoints = hp;
        this.targetPos = new Vector3();
    }

    isLiving(){return true;}
    isAlive(){return this.hitPoints > 0;}

    followTarget(){
        const xDistance = this.targetPos.x - this.pos.x;
        const yDistance = this.targetPos.y - this.pos.y;

        const farEnought = (xDistance * xDistance) + (yDistance * yDistance) > (this.aabb.radius * this.aabb.radius);
        new Vector3(xDistance * farEnought, yDistance * farEnought);

        return new Vector3(xDistance * farEnought, yDistance * farEnought);
    }
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

    move(dt, offset = new Vector3()){
        let secondsDt = dt * 0.01;

        let speed = this.followTarget();
        speed = this.limitSpeed(speed);

        speed.x *= secondsDt;
        speed.y *= secondsDt;

        this.setPos(this.pos.x + speed.x,
                    this.pos.y + speed.y, 
                    0,
                    offset);
        return;
    }
    hurt(damage){
        this.hitPoints -= damage;
    }
    die(){
        this.hitPoints = 0;
    }

    update(dt, offset){
        this.isAlive() && this.move(dt, offset);
    }
}
class PlayerEntity extends LivingEntity {

    constructor(pos = new Vector3()){
        super(pos, 15, 15, 200, "PE");

        this.color = "#BD93F9";
        this.controlRange = 200;

        this.collisionEventList = new EventArray();
        this.mousemoveEventList = new EventArray();
        this.targetPos = new Vector3(pos.x, pos.y, pos.z);
        // You know js is shit when all params are references and need something like this

        this.inmunityTime = 0; // Seconds
        this.help = 0;

        this.keydownEventList = new EventArray();
        this.keyupEventList = new EventArray();

        this.level = 0;
        this.experience = 0;
        this.attacks = [new Weapon(ImpactProyectile, 500)];
    }

    getEventList(eventName){
        switch(eventName){
            case "collision": return this.collisionEventList;
            case "mousemove": return this.mousemoveEventList;
            case "keydown": return this.keydownEventList;
            case "keyup": return this.keyupEventList;
            default: return this.genericEventList;
        }
    }
    updateTarget(){
        if(!this.mousemoveEventList.finish() && 
            this.mousemoveEventList.getLast() !== EventArray.noneEvent){

            this.targetPos = this.mousemoveEventList.getLast().eventInfo;
            this.mousemoveEventList.reset();
        }
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
    interactObject(){
        if(this.collisionEventList.finish()){
            return;
        }

    }
    dxFromRealPos(){
        return new Vector3(
            this.pos.x - this.realPos.x,
            this.pos.y - this.realPos.y
        );
    }
    limitSpeed(speedVector){
        const speedSqrX = speedVector.x * speedVector.x;
        const speedSqrY = speedVector.y * speedVector.y;
        const rangeSqr = this.controlRange * this.controlRange

        const speedNorm = (speedSqrX + speedSqrY) < rangeSqr ? 
            this.controlRange : 
            Math.sqrt(speedSqrX + speedSqrY);

        speedVector.x /= speedNorm;
        speedVector.y /= speedNorm;

        speedVector.x *= this.maxSpeed;
        speedVector.y *= this.maxSpeed;

        return new Vector3(speedVector.x, speedVector.y);
    }

    move(dt){
        let secondsDt = dt * 0.01;

        let speed = this.followTarget();
        speed = this.limitSpeed(speed);

        speed.x *= secondsDt;
        speed.y *= secondsDt;

        const offset = new Vector3(-speed.x, -speed.y);
        return offset;
    }

    hurt(damage){
        if(this.inmunityTime <= 0){
            this.hitPoints -= damage;
            this.inmunityTime = 1000;
            this.color = "#ff0000";
            this.help = 0;
            return;
        }
        return;
    }

    hurtRecover(dt){
        if(this.inmunityTime > 0){
            this.color = "#" + colorFader("ff0000", "BD93F9", this.help / 60);
            console.log(colorFader("ff0000", "BD93F9", this.help / 60));

            this.inmunityTime -= dt;
            this.help++;
        }
        //this.color = "#BD93F9";
    }

    update(dt){
        let offset = new Vector3();

        if(this.isAlive()){
            this.updateTarget();
            offset = this.move(dt);
            this.hurtRecover(dt);
        }

        return offset;
    }

}

class EnemyEntity extends LivingEntity {
    constructor(target = null, pos = new Vector3(), speed = 8, radius = 5, hp = 1, idComponent = ""){
        super(pos, speed, radius, hp, "E" + idComponent);
        this.target = target;
        this.targetPos = this.target.pos;
        this.color = "#00ff00"; // Temporal
    }

    setTarget(entity){
        this.target = entity;
    }
    updateTarget(){
        if(this.target === null){
            this.targetPos = this.pos;
            return;
        }
        this.targetPos = this.target.pos;
    }
    hurtTarget(){
        this.target.hurt(this.aabb.radius + this.maxSpeed);
        return true;
    }

    cathTarget(){
        this.isColliding(this.target.aabb) &&
        this.hurtTarget();
    }

    update(dt, offset){
        if(this.isAlive()){
            this.move(dt, offset);
            this.cathTarget();
        }
        this.updateTarget();
    }
}

class SuicideEnemy extends EnemyEntity {
    constructor(target = null, pos = new Vector3()){
        super(target, pos, 15, 10, 10, "K");
        this.color = "#ff00ff";
    }

    hurtTarget(){
        this.target.hurt(this.aabb.radius * this.maxSpeed);
        this.die();
        return true;
    }
}
