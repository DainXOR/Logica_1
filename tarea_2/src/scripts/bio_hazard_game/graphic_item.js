class GraphicItem{
    constructor(pos = new Vector3()){
        this.pos = pos;
        this.heigh = 0;
        this.width = 0;

        this.texture = "";
        this.textureState = 0;
        this.textureFrame = 0;
        this.textureStates = 0;
        this.textureMaxFrame = {0: 0};
        this.textureFrameSize = {h: 0, w: 0};

        this.genericEventList = new EventArray();
        this.visibilityState = true;

    }

    getEventList(listName){return null;}

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

    draw(context){}
    
    update(dt){ // dt = delta seconds, arguments = [canvas, context]
        if(this.genericEventList.finish()){
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
