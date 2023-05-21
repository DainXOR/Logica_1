class GraphicItem{
    constructor(pos = new Vector3(), h = 0, w = 0){
        this.pos = pos;
        this.height = h;
        this.width = w;
        this.color = "#ffffff";

        this.texture = "";
        this.textureState = 0;
        this.textureFrame = 0;
        this.textureStates = 0;
        this.textureMaxFrame = {0: 0};
        this.textureFrameSize = {h: 0, w: 0};

        this.genericEventList = new EventArray();
        this.visibilityState = true;

    }

    getEventList(listName){return genericEventList;}

    setTexture(texture){this.texture = texture;}
    setTextureStateData(maxStates, ...maxStateFrames){
        if(maxStates === maxStateFrames.length){
            for (let i = 0; i < maxStates; i++) {
                this.#addPosibleState(i, maxStateFrames[i]);
            }
            return true;
        }
        return false;
    }
    setFrameSize(heigh, width){this.textureFrameSize.h = heigh; this.textureFrameSize.w = width;}
    setTextureState(state){
        if(this.#isPosibleState(state)){
            this.textureState = state;
            this.#resetFrame();
            return true;
        }
        return false;
    }

    lighterColor(color, level, generated = 60){
        let gradient = colorGradient(color, "ffffff", generated);
        return gradient[level];
    }
    darkerColor(color, level, generated = 60){
        let gradient = colorGradient(color, "000000", generated);
        return gradient[level];
    }


    setPos(x = 0, y = 0, z = 0, offset = new Vector3()){
        this.pos = new Vector3(x + offset.x, y + offset.y, z + offset.z);
    }

    onEvent(){}

    show() {this.visibilityState = true;}
    hide() {this.visibilityState = false;}
    toggleVisibility() {this.visibilityState = !this.visibilityState;}

    draw(ctx, showHitBox){

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.aabb.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        if(showHitBox){
            ctx.beginPath();
            ctx.arc(this.aabb.center.x, this.aabb.center.y, this.aabb.radius, 0, Math.PI * 2);
            ctx.fillStyle = "#ffff007f";
            ctx.fill();
            ctx.closePath();
        }
    }
    
    update(dt, offset){ // dt = delta miliseconds
        if(!this.genericEventList.finish()){
            this.onEvent();
        }

        this.#nextTextureFrame();

        if(this.visibilityState){
            this.draw(arguments[1]);
        }
    }

    // Private stuff
    #addPosibleState(state, frames){
        this.textureStates = Math.max(this.textureStates, state);
        this.textureMaxFrame[state] = frames;
    }

    #isPosibleState(state){return state <= this.textureStates;}
    #verifyFrame(frame){return this.textureMaxFrame[this.textureState] >= frame;}
    #resetFrame(){this.textureFrame = 0;}

    #nextTextureFrame(){
        if(this.#verifyFrame(this.textureFrame + 1)) {
            this.textureFrame += 1;
        } else {
            this.#resetFrame();
        }
    }

}

class ProgressBar extends GraphicItem {
    constructor(pos, width, height, bgColor = "#000000", progressColor = "#ffffff", progressMargins = new Vector3(0, 0)){
        super(pos, height, width);

        this.bg = bgColor;
        this.color = progressColor;
        this.margins = progressMargins;
        this.progress = 0;
    }

    progressPercentage(progress){
        this.progress = progress;
    }
    changeColor(barColor){
        this.color = barColor;
    }

    draw(ctx){
        ctx.beginPath();
        ctx.rect(this.pos.x, this.pos.y, this.width, this.height);
        ctx.fillStyle = this.bg;
        ctx.fill();
        ctx.closePath();


        ctx.beginPath();
        ctx.rect(
            this.pos.x + this.margins.x, 
            this.pos.y + this.margins.y, 
            (this.width - (this.margins.x * 2)) * this.progress, 
            this.height - (this.margins.y * 2));
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    move(dt, offset){
        this.setPos(this.pos.x, this.pos.y, this.pos.z, offset);
    }
    update(dt, offset = new Vector3()){
        this.move(dt, offset);
    }
}

class Background extends GraphicItem {
    constructor(gameWidth, gameHeight, imageElementID){
        super(new Vector3(), gameHeight, gameWidth);

        this.image = document.getElementById(imageElementID);

        this.imageRatio = this.image.width / this.image.height;
    }

    draw(ctx){
        ctx.drawImage(this.image, 
            this.pos.x, this.pos.y, 
            this.width, this.height / this.imageRatio);

        ctx.drawImage(this.image, 
            this.pos.x + this.width, this.pos.y, 
            this.width, this.height / this.imageRatio);
        ctx.drawImage(this.image, 
            this.pos.x, this.pos.y + this.height, 
            this.width, this.height / this.imageRatio);
        ctx.drawImage(this.image, 
            this.pos.x + this.width, this.pos.y + this.height, 
            this.width, this.height / this.imageRatio);

        ctx.drawImage(this.image, 
            this.pos.x - this.width, this.pos.y, 
            this.width, this.height / this.imageRatio);
        ctx.drawImage(this.image, 
            this.pos.x, this.pos.y - this.height, 
            this.width, this.height / this.imageRatio);
        ctx.drawImage(this.image, 
            this.pos.x - this.width, this.pos.y - this.height, 
            this.width, this.height / this.imageRatio);

        ctx.drawImage(this.image, 
            this.pos.x + this.width, this.pos.y - this.height, 
            this.width, this.height / this.imageRatio);
        ctx.drawImage(this.image, 
            this.pos.x - this.width, this.pos.y + this.height, 
            this.width, this.height / this.imageRatio);
    }
    move(_, offset){
        this.setPos(this.pos.x, this.pos.y, this.pos.z, offset);

        this.pos.x *= !((this.pos.x + this.width < 0) || (this.pos.x - this.width > 0));

        this.pos.y *= !((this.pos.y + this.height < 0) || (this.pos.y - this.height > 0));

    }
    update(ctx, offset){
        this.move(0, offset);
        this.draw(ctx);
    }
}

class GUIElement extends GraphicItem{
    constructor(){
        
    }
}
