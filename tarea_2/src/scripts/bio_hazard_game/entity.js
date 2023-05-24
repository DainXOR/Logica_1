class Entity extends GraphicItem{

    constructor(pos = new Vector3(), bcRadius = 0, w = 0, h = 0, idComponent = ""){
        super(pos, w, h);

        this.id = generateID("e" + idComponent);
        this.type = 0;

        this.bc = new BC(pos, bcRadius);
        this.aabbSize = new Vector3(300, 300);
        this.aabb = new AABB(new Vector3(this.pos.x - this.aabbSize.x, this.pos.y - this.aabbSize.y, this.pos.z), this.aabbSize.x * 2, this.aabbSize.y * 2);
    
        this.collisionEventList = new EventArray();
    }

    setPos(x = 0, y = 0, z = 0, offset = new Vector3()){
        this.pos = new Vector3(x + offset.x, y + offset.y, z);
        this.bc.center = new Vector3(x + offset.x, y + offset.y, z);
        this.aabb.pos = new Vector3(x - this.aabbSize.x + offset.x, y - this.aabbSize.y + offset.y, z)

    }
    setBCRadius(newRadius){
        this.bc.radius = newRadius;
    }
    setAABBSize(w, h){
        this.aabbSize = new Vector3(w, h);
        this.aabb = new AABB(new Vector3(this.pos.x - this.aabbSize.x, this.pos.y - this.aabbSize.y, this.pos.z), this.aabbSize.x * 2, this.aabbSize.y * 2);
    }

    move(dt, offset = new Vector3()){
        this.setPos(this.pos.x,
                    this.pos.y, 
                    this.pos.z,
                    offset);
        return;
    }
    draw(ctx, castShadow = false, showBC = false, showAABB = false){
        if(castShadow){
            ctx.beginPath();
            ctx.ellipse(
                this.pos.x + this.width * -0.1, 
                this.pos.y + this.height, 
                this.width * 0.7,
                this.height * 0.4, 
                0, 0, Math.PI * 2);
            ctx.fillStyle = "#0000007f";
            ctx.fill();
            ctx.closePath();
        }
        super.draw(ctx, false);

        if(showBC){
            this.bc.draw(ctx);
        }
        if(showAABB){
            this.aabb.draw(ctx);
        }

    }

    update(dt, offset){
        this.move(dt, offset);
    }

    isCollidingBC(otherBC){return this.bc.isCollidingBC(otherBC);}
    isCollidingAABB(otherAABB){return this.bc.isCollidingAABB(otherAABB);}

    getSearchAABB(){return this.aabb;}

    isLiving(){return false;}
    isItem(){return false;}
    isStructure(){return false;}
    isProyectile(){return false;}
    isDamaging(){return false;}
    isPlayerDamaging(){return false;}

}

class DamageEntity extends Entity{
    constructor(
        idComponent, 
        pos = new Vector3(), 
        radius = new Vector3(), 
        damageBase = 0, 
        maxHits = -1,
        timeDuration = -1,
        damageFormula = (baseDmg)=>{return baseDmg;}, 
        onImpact = ()=>{}, 
        onExpire = ()=>{})
        {
        super(pos, radius, radius * 2, radius * 5, "DMG" + idComponent);


        this.type = 2;
        this.baseDamage = damageBase;
        this.damageFormula = damageFormula;
        
        this.hitCount = 0;
        this.maxHits = maxHits;

        this.age = 0;
        this.duration = timeDuration;
        this.onImpact = onImpact;
        this.onExpire = onExpire;
        this.state = true;

    }

    buff(...buffs){
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

    impact(...entities){
        for (let i = 0; i < entities.length; i++) {
            if(this.bc.isCollidingBC(entities[i].bc)){
                entities[i].hurt(this.damageFormula(this.baseDamage));
                this.hitCount++;
                continue;
            }
            
        }
    }

    checkTooFar(other){
        this.state &&= !(this.bc.distanceTo(other.bc) >= 4_000_000);
    }

    draw(ctx, shadow = false, showBC = false, showAABB = false){
        super.draw(ctx, shadow, showBC, showAABB);

    }

    isActive(){return this.state;}
    isDamaging(){return true;}
}
class AreaOfEffect extends DamageEntity {
    static args = {
        damage:     0b00000001,
        radius:     0b00000010,
        frequency:  0b00000100,
        duration:   0b00001000,
        age:        0b00010000,
        maxHits:    0b00100000,
        hits:       0b01000000,
    }

    constructor(originPos, spawnPos, damage, radius, frequency = 2, duration = -1, maxHits = -1, 
        damageFormula = (dmg, radius) => {return dmg / radius;}, 
        onImpact = () => {}
        )
    {
        super("-AOE", spawnPos, radius, damage, maxHits, duration, damageFormula, onImpact);
        
        this.castPos = new Vector3(originPos.x, originPos.y);
        this.spawnPos = new Vector3(spawnPos.x, spawnPos.y, 5);

        this.damageFrequency = frequency;
        this.lastHit = 0;
        this.msPerHit = 1000 / frequency;

        this.damageArguments = AreaOfEffect.args.damage | AreaOfEffect.args.radius;
        this.damageFormulaArgs = [this.baseDamage, this.damageFrequency, this.bc.radius, this.duration, this.age, this.maxHits, this.hitCount];

        this.damagePredicate = () => {return true;};

        this.color = "#ffff0010";
    }

    getDamage(posArgs, ...args){

        // Logic to pass the correct arguments to the damage formula callback
        let effectiveIndices = [];
        for (let i = 0; posArgs !== 0; i++) {
            effectiveIndices.push((posArgs & 1) * i);
            posArgs >>= 1; 
        }

        let effectiveArgs = [...args].filter((_, i)=>{
            return effectiveIndices.includes(i);
        });

        // Return callback result
        return this.damageFormula(...effectiveArgs);
    }

    update(dt, offset = new Vector3()){
        this.lastHit += dt;
        this.age += dt;
        this.damageFormulaArgs = [this.baseDamage, this.damageFrequency, this.bc.radius, this.duration, this.age, this.maxHits, this.hitCount];
        this.move(dt, offset);
    }

    isActive(){
        return this.age < this.duration;
    }

    impact(...entities){
        if(this.state && this.lastHit >= this.msPerHit){
            for (let i = 0; i < entities.length; i++) {
                if(this.damagePredicate(entities[i], i, entities) && this.bc.isCollidingBC(entities[i].bc)) {
                    entities[i].hurt(this.getDamage(this.damageArguments, ...this.damageFormulaArgs))
                    this.hitCount++;
                    (this.hitCount === this.maxHits) && (this.state = false);
                    this.onImpact(...entities);
                }
            }
            this.lastHit = 0;
        }
    }
    hasTarget(){return true;}
    isDamaging(){return true;}
}
class Magma extends AreaOfEffect{
    constructor(originPos, spawnPos){
        super(originPos, spawnPos, 20, 100, 2, 8_000, 1_000_000);

        this.setAABBSize(650, 650);
        this.color = "#e46400a2";
    }

    draw(ctx, showBC = false, showAABB = false){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.bc.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        super.draw(ctx, false, showBC, showAABB);
    }
}
class Void extends AreaOfEffect {
    constructor(originPos, spawnPos){
        super(new Vector3(), spawnPos, 1, 150, 10, 5_000, 1_000_000, 
            (dmg, hits) => {return dmg + hits;},
            (_) => {this.bc.radius += 1; this.setAABBSize(650 + this.hitCount, 650 + this.hitCount);});

        this.setAABBSize(650, 650);
        this.originalRadius = this.bc.radius; 
        this.damageArguments = AreaOfEffect.args.damage | AreaOfEffect.args.hits;
        this.color = "#000000";
    }

    draw(ctx, showBC = false, showAABB = false){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.bc.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        super.draw(ctx, false, showBC, showAABB);
    }
}

class Proyectile extends DamageEntity {
    static args = {
        damage:     0b00000001,
        speed:      0b00000010,
        radius:     0b00000100,
        age:        0b00001000,
        uses:       0b00010000,
        usesCount:   0b00100000,
    }

    constructor(pos, direction, speed, uses, damage, radius, 
        damageFormula = (dmg, speed, size)=>{return dmg + (speed * size);}, 
        onImpact = ()=>{}
        )
    {
        super("-PROY", new Vector3(pos.x, pos.y, 10), radius, damage, -1, -1, damageFormula, onImpact);
        this.baseSpeed = speed;
        this.baseUses = uses;
        this.origin = new Vector3(this.pos.x, this.pos.y, 10);
        this.direction = new Vector3(direction.x - this.pos.x, direction.y - this.pos.y);
        this.usesCount = 0;
        this.timeAlive = 0;

        this.damagePredicate = () => {return true;};

        this.damageArguments = Proyectile.args.damage | Proyectile.args.speed | Proyectile.args.radius;
        this.damageFormulaArgs = [this.baseDamage, this.baseSpeed, this.bc.radius, this.timeAlive, this.baseUses, this.usesCount];

        this.color = "#ffffff";
    }
    getDamage(posArgs, ...args){

        // Logic to pass the correct arguments to the damage formula callback
        let effectiveIndices = [];
        for (let i = 0; posArgs !== 0; i++) {
            effectiveIndices.push((posArgs & 1) * i);
            posArgs >>= 1; 
        }

        let effectiveArgs = [...args].filter((_, i)=>{return effectiveIndices.includes(i);});

        // Return callback result
        return this.damageFormula(...effectiveArgs);
    }

    hasTarget(){
        return true;
    }
    setUsed(){
        this.state = false;
    }

    limitSpeed(speedVector){
        let speedSqrX = speedVector.x * speedVector.x;
        let speedSqrY = speedVector.y * speedVector.y;
        
        // Well, this is weird, but im not complaining (in this use case)
        const speedNorm = Math.sqrt(speedSqrX + speedSqrY) || 1;
        speedVector.x /= speedNorm;
        speedVector.y /= speedNorm;

        speedVector.x *= this.baseSpeed;
        speedVector.y *= this.baseSpeed;

        return new Vector3(speedVector.x, speedVector.y);
    }
    move(dt, offset){
        let speed = this.limitSpeed(this.direction);
        
        speed.x = speed.x * dt * 0.01;
        speed.y = speed.y * dt * 0.01;

         this.setPos(this.pos.x + speed.x,
                    this.pos.y + speed.y, 
                    this.pos.z,
                    offset);
        return;
    }
    update(dt, offset = new Vector3()){
        this.damageFormulaArgs = [this.baseDamage, this.baseSpeed, this.bc.radius, this.timeAlive, this.baseUses, this.usesCount];
        this.timeAlive += dt;
        this.move(dt, offset);
    }

    impact(...entities){
        for (let i = 0; i < entities.length; i++) {

            if(this.damagePredicate(entities[i], i, entities) && this.bc.isCollidingBC(entities[i].bc)) {
                
                entities[i].hurt(this.getDamage(this.damageArguments, ...this.damageFormulaArgs))
                this.usesCount++;
                (this.usesCount === this.baseUses) && this.setUsed();
                this.onImpact(...entities);
                return;
            }
        }
    }

    draw(ctx, shadow = true, showBC = false, showAABB = false){

        super.draw(ctx, shadow, showBC, showAABB);

        ctx.beginPath();
        ctx.arc(this.bc.center.x, this.bc.center.y, this.bc.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        

    }

    isDamaging(){return true;}
    isProyectile(){return true;}

}
class ImpactProyectile extends Proyectile {
    constructor(pos, target, speed = 20, damage = 5){
        super(pos, target.pos, speed, 1, damage, 4, (dmg) => {return dmg;});

        this.damageArguments = Proyectile.args.damage;
        //this.color = "7c7cff";
    }

}
class PierceProyectile extends Proyectile {
    constructor(pos, target, speed, damage = 10, uses = 3){
        super(pos, target.pos, speed, uses, damage, 2, 
            (dmg, uses)=>{return dmg * (1 / uses);});

        this.damageArguments = Proyectile.args.damage | Proyectile.args.uses;
        this.color = "#3fff3f";
    }
    draw(ctx, showBC = false, showAABB = false){
        super.draw(ctx, true, showBC, showAABB);
    }
}
class FollowProyectile extends Proyectile {
    constructor(pos, target, speed, damage){
        super(pos, target.pos, speed, 1, damage, 4, 
            (dmg, size) => {return dmg * size;});

        this.target = target;
        this.damageArguments = Proyectile.args.damage | Proyectile.args.size;
        this.color = "#00ffcf";
    }

    hasTarget(){
        return this.target !== null && this.target.isAlive();
    }

    followTarget(){
        if(!this.hasTarget()){
            return new Vector3();
        }

        const xDistance = this.target.pos.x - this.pos.x;
        const yDistance = this.target.pos.y - this.pos.y;

        return new Vector3(xDistance, yDistance);
    }

    move(dt, offset){
        let speed = this.limitSpeed(this.followTarget());
        
        speed.x = speed.x * dt * 0.01;
        speed.y = speed.y * dt * 0.01;

         this.setPos(this.pos.x + speed.x,
                    this.pos.y + speed.y, 
                    this.pos.z,
                    offset);
        return;
    }
}
class RicochetProyectile extends Proyectile {
    constructor(pos, target, speed, damage = 4, uses = 5){
        super(pos, target.pos, speed, uses, damage, 12, 
            (dmg) => {return dmg;},
            (...e) => {
                let dx = 500_000;
                for (let i = 0; i < e.length; i++) {
                    let posibleDx = this.bc.distanceTo(e[i].bc);
                    if(posibleDx <= dx && e[i] !== this.target){
                        dx = posibleDx;
                        this.target = e[i];
                        if(posibleDx < 50_000){
                            return;
                        }
                    }
                }
            }
        );

        this.damagePredicate = (entity) => {return this.target === entity;};

        this.target = target;
        this.damageArguments = Proyectile.args.damage;
        this.center = "#ff0000";
        this.color = "#ff2a04";
        this.midRing = "#ffff00";
        this.outRing = "#fffff0";
    }

    hasTarget(){
        return this.target !== null && this.target.isAlive();
    }

    followTarget(){
        if(!this.hasTarget()){
            return new Vector3();
        }

        const xDistance = this.target.pos.x - this.pos.x;
        const yDistance = this.target.pos.y - this.pos.y;

        return new Vector3(xDistance, yDistance);
    }

    move(dt, offset){
        let speed = this.limitSpeed(this.followTarget());
        
        speed.x = speed.x * dt * 0.01;
        speed.y = speed.y * dt * 0.01;

         this.setPos(this.pos.x + speed.x,
                    this.pos.y + speed.y, 
                    this.pos.z,
                    offset);
        return;
    }

    draw(ctx, showBC = false, showAABB = false){

        super.draw(ctx, true, showBC, showAABB);

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.bc.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.outRing;
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.bc.radius - 3, 0, Math.PI * 2);
        ctx.fillStyle = this.midRing;
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.bc.radius - 6, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.bc.radius - 9, 0, Math.PI * 2);
        ctx.fillStyle = this.center;
        ctx.fill();
        ctx.closePath();

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
        cooldown = 2000, 
        attackType = Type.SINGLE | Type.LINE, 
        count = 1, 
        attackDirection = Direction.FRONT | Direction.STATIC,
        ){

        this.attack = attackClass;
        this.attackType = attackType;
        this.attackDirection = attackDirection;
        this.attackLevel = 1;

        this.cooldown = cooldown;
        this.downTime = cooldown;

        this.clusterCount = count;
    }

    
    #castProjectile(pos, dir, ...args){
        return new this.attack(new Vector3(pos.x, pos.y, 10), dir, ...args);
    }
    #castAOE(origin, target, ...args){
        let coords = getNRandom(2, -1000, 1000);
        return new this.attack(origin, new Vector3(...coords, 5), ...args);
    }

    cool(dt){
        this.downTime > 0 && (this.downTime -= dt);
    }
    onDownTime(){
        return this.downTime > 0;
    }

    upgrade(){
        this.attackLevel += 1;

    }

    shoot(pos, dir, ...attackArgs){
        if(!this.onDownTime()){
            this.downTime = this.cooldown;

            const attack = this.attackType & Type.AOE? 
                this.#castAOE(pos, dir, ...attackArgs) :
                this.#castProjectile(pos, dir, ...attackArgs);

            return attack;
        }
        return null;
    }
}

class Item extends Entity {
    constructor(pos, radius, idComponent = ""){
        super(pos, radius, radius * 2, radius * 2, "i-" + idComponent);

        this.type = 3;
        this.color = "#ffffff";

        this.collected = false;
    }

    isCollected(){
        return this.collected;
    }
    tooFar(player){
        return (Math.abs(player.pos.x - this.pos.x) > 5000) || (Math.abs(player.pos.y - this.pos.y) > 5000);
    }

    doEffect(entity){

    }

    isItem(){return true;}
    isObject(){return false;}
}
class Orb extends Item {
    constructor(pos, radius, exp, color, glowRadius){
        super(pos, radius, "orb");

        this.exp = exp;
        this.color = color;
        this.secondColor = "#" + this.lighterColor(color.replace("#", ""), 20);
        this.shineColor = "#" + this.lighterColor(color.replace("#", ""), 50);
        this.glowInner = "#" + this.darkerColor(color.replace("#", ""), 10) + "7f";
        this.glowMid = "#" + this.darkerColor(color.replace("#", ""), 10) + "3f";
        this.glowOuter = "#" + this.darkerColor(color.replace("#", ""), 20) + "1f";

        this.glowRadius = glowRadius;
    }

    doEffect(entity){
        entity.addExperience(this.exp);
        this.collected = true;
        this.exp = 0;
        return;
    }
    draw(ctx){

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.bc.radius + this.glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.glowOuter;
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.bc.radius + (this.glowRadius * 0.66), 0, Math.PI * 2);
        ctx.fillStyle = this.glowMid;
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.bc.radius + (this.glowRadius * 0.33), 0, Math.PI * 2);
        ctx.fillStyle = this.glowInner;
        ctx.fill();
        ctx.closePath();


        super.draw(ctx, false);

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.bc.radius * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = this.secondColor;
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(
            this.pos.x + this.bc.radius * 0.2, 
            this.pos.y - this.bc.radius * 0.1, 
            this.bc.radius * 0.20, 0, Math.PI * 2);
        ctx.fillStyle = this.shineColor;
        ctx.fill();
        ctx.closePath();
    }
}
class Hearth extends Item {
    constructor(pos, radius, heal = 30){
        super(pos, radius, "hearth");

        this.setTexture("hearth");

        this.healAmount = heal;
    }

    doEffect(entity){
        entity.addHitPoints(this.healAmount);
        this.collected = true;
        this.healAmount = 0;
        return;
    }

    draw(ctx){
        super.draw(ctx, true);
    }
}
class Artifact extends Item {

}

class Structure extends Entity {
    constructor(id){
        super("s-" + id);
        this.type = 4;
    }

    isStructure(){return true;}
}


class LivingEntity extends Entity {
    constructor(pos = new Vector3(), maxSpeed = 10, radius = 10, width = 20, height = 20, hp = 1, idComponent = ""){
        super(pos, radius, width, height, "l-" + idComponent);
        this.type = 1;

        this.maxSpeed = maxSpeed;
        this.hitPoints = hp;
        this.targetPos = new Vector3();

        this.setColors("000000", "ffffff", 5);

        this.inmunityMaxTime = 20; // Miliseconds
        this.inmunityTime = 0; // Seconds

        this.oneTimeAvaible = true;
        this.oneTimeHurt = () => {};
        this.onHurt = () => {};
    }

    isLiving(){return true;}
    isAlive(){return this.hitPoints > 0;}

    setColors(normal, hurt, steps){
        this.colorNormal = normal;
        this.colorHurt = hurt;
        this.gradientSteps = steps;
        this.hurtGradient = colorGradient(this.colorHurt, this.colorNormal, this.gradientSteps);
        this.color = "#" + this.colorNormal;
        this.gradientStep = steps;
    }

    followTarget(){
        const xDistance = this.targetPos.x - this.pos.x;
        const yDistance = this.targetPos.y - this.pos.y;

        return new Vector3(xDistance, yDistance);
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
                    this.pos.z,
                    offset);
        return;
    }

    hurt(damage){
        if(this.inmunityTime <= 0){
            this.hitPoints -= damage;
            !this.isAlive() && this.die();

            this.inmunityTime = this.inmunityMaxTime;
            this.color = "#" + this.colorHurt;
            this.gradientStep = 0;

            this.onHurt(damage);

            this.oneTimeAvaible && this.oneTimeHurt(damage);
            this.oneTimeAvaible = false;
        }

        return;
    }

    hurtRecover(dt){
        if(this.inmunityTime > 0){
            this.inmunityTime -= dt;
        }
        if(this.gradientStep < this.gradientSteps){
            this.color = "#" + this.hurtGradient[this.gradientStep];
            this.gradientStep++;
        }
        else if (this.gradientStep === this.gradientSteps){
            this.color = "#" + this.colorNormal;
            this.gradientStep++;
        }
    }


    die(){
        this.hitPoints = 0;
    }

    update(dt, offset){
        if(this.isAlive()) {
            this.move(dt, offset);
            this.hurtRecover(dt);
        }
    }
}
class PlayerEntity extends LivingEntity {

    constructor(pos = new Vector3(), canvas){
        super(pos, 20, 15, 20, 20, 200, "PE");

        this.type *= 10;
        this.type += 1;

        this.setTexture("pc0");
        this.height = this.height * (this.texture.height / this.texture.width);

        this.setAABBSize(500, 500);
        this.controlRange = 100;    // Distance from mouse for max speed
        this.inmunityMaxTime = 300; // Miliseconds

        // You know js is shit when all params are references and need something like this
        this.targetPos = new Vector3(pos.x, pos.y, pos.z);

        this.collisionEventList = new EventArray();
        this.mousemoveEventList = new EventArray();

        this.maxHP = this.hitPoints;
        this.hpBar = new ProgressBar(
            new Vector3(this.pos.x - this.width, this.pos.y + (this.height) + 20),
            this.width * 2, 8,
            "#000000", "#ff2020",
            new Vector3(1, 1)
        );
        this.hpBar.progressPercentage(this.hitPoints / this.maxHP);
        //this.onHurt = () => {this.hpBar.progressPercentage(this.hitPoints / this.maxHP);}


        this.level = 0;
        this.experience = 0;
        this.levelRequirement = 10;
        this.levelsUpgraded = false;
        this.normalLevelColor = "#5c5cff";
        this.specialLevelColor = "#5cff5c";
        this.expBar = new ProgressBar(
            new Vector3(canvas.width * 0.10, 5), 
            canvas.width * 0.80, 25,
            "#000000", "#5c5cff",
            new Vector3(3, 3)
        );
        this.overSpecialLevel = false;

        this.attacks = [new Weapon(ImpactProyectile, 1000)]; // new Weapon(ImpactProyectile, 1000), new Weapon(PierceProyectile, 1500), new Weapon(FollowProyectile, 1500)
        this.attacksArgs = [[50, 5]]; // [25, 5], [30, 3, 2], [20, 3]
        this.attackEntities = [];

        this.interactRange = 50;
        this.objects = [];

        this.setColors("BD93F9", "FF0000", 30);
        
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
    getAttackEntities(){
        return this.attackEntities;
    }
    getExpProgress(){
        return this.experience / this.levelRequirement;
    }
    hasLevelUp(){
        return this.levelsUpgraded > 0;
    }

    updateHP(){
        this.hpBar.progressPercentage(this.hitPoints / this.maxHP);
    }

    addExperience(amount){
        if(!this.isAlive() || amount === 0){
            return false;
        }

        this.experience += amount;

        while(this.levelRequirement <= this.experience){
            this.experience -= this.levelRequirement;
            this.level++;
            this.levelRequirement = Math.ceil(this.levelRequirement * 1.1);
            this.levelsUpgraded += 1;
            
            const specialLevel = this.level !== 0 && this.level % 10 === 0;
            if(specialLevel){
                this.expBar.changeColor(this.specialLevelColor);
                this.overSpecialLevel = true;
            }
            else{ 
                if(this.overSpecialLevel){
                    (this.levelsUpgraded += 4);
                    this.overSpecialLevel = false;
                }
                this.expBar.changeColor(this.normalLevelColor);
            }
        }

        this.expBar.progressPercentage(this.getExpProgress());

        return this.levelsUpgraded;
    }
    addHitPoints(amount){
        this.hitPoints += amount;
        this.hitPoints > this.maxHP && (this.hitPoints = this.maxHP);
    }

    consumeLevel(){
        return this.levelsUpgraded > 0 && this.levelsUpgraded--;
    }
    newAttack(attackClass, attackArgs, cooldown, ...weaponArgs){
        this.attacks.push(new Weapon(attackClass, cooldown, ...weaponArgs));
        this.attacksArgs.push(attackArgs);
    }

    updateTarget(){

        if(!this.mousemoveEventList.finish() && 
            this.mousemoveEventList.getLast() !== EventArray.noneEvent){

            this.targetPos = this.mousemoveEventList.getLast().eventInfo;
            this.mousemoveEventList.reset();
        }
    }
    followTarget(){
        const xDistance = this.targetPos.x - this.pos.x;
        const yDistance = this.targetPos.y - this.pos.y;

        const farEnought = (xDistance * xDistance) + (yDistance * yDistance) > (this.bc.radius * this.bc.radius);
        // Mainly for the player to stand still when the mouse is inside its bounding box

        return new Vector3(xDistance * farEnought, yDistance * farEnought);
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

    interact(...structures){
        for (let i = 0; i < structures.length; i++) {
            let result = structures[i].interact();
            (result.isObject() && this.objects.push(result)) || this.collect(result);
        }

    }
    collect(...items){
        for (let i = 0; i < items.length; i++) {
            if(this.bc.distanceTo(items[i].bc) <= this.interactRange * this.interactRange){
                items[i].doEffect(this);
            }
        }
    }
    shoot(...enemies){
        let avaibleIndexes = [];
        const avaible = this.attacks.filter((a, i) => {return !a.onDownTime() && (avaibleIndexes.push(i), true)});

        let closer = 300_000;
        let closerEnemy = null;
        this.attackEntities = [];

        enemies.forEach(e => { // pos, speed, damage
            const de = this.bc.distanceTo(e.bc);
            if(de <= closer){
                closer = de;
                closerEnemy = e;
            } 
        });

        if(closerEnemy !== null){
            for (let i = 0; i < avaible.length; i++) {
                this.attackEntities.push(avaible[i].shoot(this.pos, closerEnemy, ...this.attacksArgs[avaibleIndexes[i]]));
                
            }
            //avaible.forEach(a => {
            //    this.attackEntities.push(
            //        a.shoot(this.pos, closerEnemy, ...this.attacksArgs)
            //    );
            //});
        }

        this.attackEntities = this.attackEntities.filter(a => a !== null);
        return this.attackEntities;
    }
    move(dt){
        let secondsDt = dt * 0.01;

        let speed = this.followTarget();
        speed
        speed = this.limitSpeed(speed);

        speed.x *= secondsDt;
        speed.y *= secondsDt;

        const offset = new Vector3(-speed.x, -speed.y);
        return offset;
    }
    draw(ctx, showBC = true, showAABB = false){
        super.draw(ctx, true, showBC, showAABB);

    }
    update(dt){
        let offset = new Vector3();
        this.updateHP();

        if(this.isAlive()){
            this.updateTarget();
            offset = this.move(dt);
            this.hurtRecover(dt);
            this.attacks.forEach(a => a.cool(dt));
        }

        return offset;
    }

}

class EnemyEntity extends LivingEntity { "el-E"
    static target = null;

    constructor(target = null, pos = new Vector3(), damage = 0,  speed = 15, radius = 5, hp = 1, idComponent = ""){
        super(pos, speed, radius, radius * 2, radius * 2, hp, "E" + idComponent);

        this.type *= 10;
        this.type += 2;

        this.setTarget(target);
        this.targetPos = new Vector3(this.getTarget().pos.x, this.getTarget().pos.y);

        this.baseDamage = damage;
        this.deathExp = 0;

        this.setColors("000000", "ffffff", 5);

        this.damageFormula = () => { return this.baseDamage; };
        this.afterHurt = ()=>{};
    }

    setTarget(entity){
        EnemyEntity.target = entity;
    }
    getTarget(){
        return EnemyEntity.target;
    }
    updateTarget(){
        if(this.getTarget() === null){
            this.targetPos = this.pos;
            return;
        }
        this.targetPos = this.getTarget().pos;
    }
    hurtTarget(){
        this.getTarget().hurt(this.damageFormula());
        this.afterHurt();
        return true;
    }
    cathTarget(){
        this.isCollidingBC(this.getTarget().bc) &&
        this.hurtTarget();
    }
    tooFar(){
        return (Math.abs(this.getTarget().pos.x - this.pos.x) > 20_000) || (Math.abs(this.getTarget().pos.y - this.pos.y) > 20_000);
    }
    claimExp(){
        return this.deathExp;
    }

    update(dt, offset){
        if(this.isAlive()){
            this.move(dt, offset);
            this.cathTarget();
            this.hurtRecover(dt);
        }
        this.updateTarget();
    }
    draw(ctx, shadow = true, showBC = false, showAABB = false){
        if(this.texture){
            super.draw(ctx, shadow, showBC, showAABB);
        }
        else{
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.bc.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    }
}
class NormalEnemy extends EnemyEntity { "el-EN"
    constructor(target = null, pos = new Vector3()){
        super(target, pos, 10, 12, 10, 10, "N");

        this.deathExp = 1;
        this.damageFormula = ()=>{ return this.baseDamage + this.bc.radius; };

        this.setTexture("en0");
    }
}
class SuicideEnemy extends EnemyEntity { "el-EK"
    constructor(target = null, pos = new Vector3()){
        super(target, pos, 0, 21, 10, 6, "K");

        this.colorCenter = "ffffff";
        this.centerRadius = this.bc.radius * 0.7;
        this.rageMode = false;
        this.deathExp = 2;

        this.damageFormula = ()=>{ return this.bc.radius * this.maxSpeed; };
        this.afterHurt = ()=>{ this.die(); };

        this.oneTimeAvaible = true;
        this.oneTimeHurt = () => {
            this.colorCenter = "ff0000";
            this.setTexture("esr0");
            this.maxSpeed = 30;
            this.centerRadius = this.bc.radius * 0.4;
            this.rageMode = true;
        }

        this.setTexture("es0");
    }

    updateTarget(){
        if(this.rageMode){
            if(this.getTarget() === null){
                this.targetPos = this.pos;
                return;
            }
            this.targetPos = this.getTarget().pos;
        }
    }

    followTarget(){
        const xDistance = this.targetPos.x - this.pos.x;
        const yDistance = this.targetPos.y - this.pos.y;

        if(!this.rageMode){
            const norm = Math.sqrt((xDistance * xDistance) + (yDistance * yDistance));

            this.targetPos.x += (xDistance / norm) * this.maxSpeed;
            this.targetPos.y += (yDistance / norm) * this.maxSpeed;
        }

        return new Vector3(xDistance, yDistance);
    }

    draw(ctx, shadow = true, showBC = false, showAABB = false){
        super.draw(ctx, shadow, showBC, showAABB);

        if(!this.texture){
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.centerRadius, 0, Math.PI * 2);
            ctx.fillStyle = "#" + this.colorCenter;
            ctx.fill();
            ctx.closePath();
        }
    }

}
class TankyEnemy extends EnemyEntity { "el-ET"
    constructor(target = null, pos = new Vector3()){
        super(target, pos, 5, 12, 15, 30, "T");

        this.deathExp = 2;
        this.damageFormula = ()=>{ return this.baseDamage + this.bc.radius; };

        this.setTexture("et0");
    }

    draw(ctx, shadow = true, showBC = false, showAABB = false){
        super.draw(ctx, shadow, showBC, showAABB);

        if(!this.texture){
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.bc.radius * 0.666, 0, Math.PI * 2);
            ctx.fillStyle = "#ffff00";
            ctx.fill();
            ctx.closePath();
        }
    }

}
class NormalBigEnemy extends EnemyEntity { "el-ENB"
    constructor(target = null, pos = new Vector3()){
        super(target, pos, 15, 12, 50, 70, "NB");

        this.deathExp = 5;
        this.damageFormula = ()=>{ return this.baseDamage + this.bc.radius; };

        this.setTexture("en0");
    }
}
class TankyBigEnemy extends EnemyEntity { "el-ETB"
    constructor(target = null, pos = new Vector3()){
        super(target, pos, 25, 10, 50, 300, "TB");

        this.deathExp = 8;
        this.damageFormula = ()=>{ return this.baseDamage + this.bc.radius; };

        this.setTexture("et0");
    }

    draw(ctx, shadow = true, showBC = false, showAABB = false){
        super.draw(ctx, shadow, showBC, showAABB);


        if(!this.texture){
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.bc.radius * 0.666, 0, Math.PI * 2);
            ctx.fillStyle = "#ffff00";
            ctx.fill();
            ctx.closePath();
        }
    }

}
class RevengefulEnemy extends EnemyEntity { "el-EREV"
    constructor(target = null, pos = new Vector3()){
        super(target, pos, 0, 17, 40, 150, "REV");

        this.colorCenter = "ffffff";
        this.centerRadius = this.bc.radius * 0.7;
        this.rageMode = false;
        this.deathExp = 15;

        this.damageFormula = ()=>{ return this.bc.radius * this.maxSpeed; };
        this.afterHurt = ()=>{ this.die(); };

        this.oneTimeAvaible = true;
        this.oneTimeHurt = () => {
            this.colorCenter = "ff0000";
            this.setTexture("esra0");
            this.hitPoints = 200;
            this.maxSpeed = 35;
            this.centerRadius = this.bc.radius * 0.4;
            this.rageMode = true;
        }

        this.setTexture("es0");
    }

    updateTarget(){
        if(this.rageMode){
            if(this.getTarget() === null){
                this.targetPos = this.pos;
                return;
            }
            this.targetPos = this.getTarget().pos;
        }
    }

    followTarget(){
        const xDistance = this.targetPos.x - this.pos.x;
        const yDistance = this.targetPos.y - this.pos.y;

        if(!this.rageMode){
            const norm = Math.sqrt((xDistance * xDistance) + (yDistance * yDistance));

            this.targetPos.x += (xDistance / norm) * this.maxSpeed;
            this.targetPos.y += (yDistance / norm) * this.maxSpeed;
        }

        return new Vector3(xDistance, yDistance);
    }

    draw(ctx, shadow = true, showBC = false, showAABB = false){
        super.draw(ctx, shadow, showBC, showAABB);


        if(!this.texture){
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.centerRadius, 0, Math.PI * 2);
            ctx.fillStyle = "#" + this.colorCenter;
            ctx.fill();
            ctx.closePath();
        }
    }

}
class GiantEnemy extends EnemyEntity { "el-EG"
    constructor(target = null, pos = new Vector3()){
        super(target, pos, 20, 0, 300, 100_000, "G");

        this.deathExp = 5000;
        this.damageFormula = ()=>{ return this.baseDamage; };
        this.setColors("101010", "151515", 10);
        this.setTexture("eg0");

        
    }

    move(_, offset){
        this.setPos(this.pos.x, this.pos.y, this.pos.z, offset);
    }
    hurt(_){
        super.hurt(1);
        return;
    }
    draw(ctx, _, showBC = false, showAABB = false){
        super.draw(ctx, false, showBC, showAABB);
    }
}