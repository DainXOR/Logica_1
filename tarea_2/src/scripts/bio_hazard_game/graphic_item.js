class GraphicItem{
    constructor(pos = new Vector3(), h = 0, w = 0){
        this.pos = pos;
        this.heigh = h;
        this.width = w;
        this.color = "ffffff";

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
            ctx.fillStyle = "#ffff0099";
            ctx.fill();
            ctx.closePath();
        }
    }
    
    update(dt, offset){ // dt = delta seconds, arguments = [canvas, context]
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

class GUIElement extends GraphicItem{
    constructor(){
        
    }
}
