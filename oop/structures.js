class vector{
    #coords;

    constructor(...coordinates){
        if(coordinates[0] instanceof vector){
            this.#coords = coordinates[0].#coords;
            return;
        } else {
            if(!isNumber(coordinates[0])){ // js is sh!t
                throw new Error("Invalid arguments to construct vector.");
            }
        }

        this.#coords = coordinates;
    }

    get x(){
        return this.#coords[0];
    }
    get y(){
        return this.#coords[1];
    }
    get z(){
        return this.#coords[2];
    }
    get w(){
        return this.#coords[3];
    }

    get rn(){
        return this.#coords.length;
    }

    get(index){
        return this.#coords[index];
    }

    set(index, value){
        if((index < 0) && (this.rn + index > 0)){
            this.#coords[this.rn + index] = value;
            return this.#coords[this.rn + index];

        } else if(this.rn + index < 0) {
            throw "Invalid index.";
        }

        if(index >= this.rn){
            for(i = this.rn; i < index; i++){
                this.#coords[i] = 0;
            }
        }

        this.#coords[index] = value;
        return this.#coords[index];
    }

    plus(other){
        if(isNumber(other)){
            for(let i = 0; i < this.rn; i++){
                this.#coords[i] += other;
            }
            return this;

        } else if(other instanceof vector && (this.rn === other.rn)){
            for(let i = 0; i < this.rn; i++){
                this.#coords[i] += other.#coords[i];
            }
            return this;
        }

        throw new Error("Invalid argument to perform operation.");
    }

    minus(other){
        if(isNumber(other)){
            for(let i = 0; i < this.rn; i++){
                this.#coords[i] -= other;
            }
            return this;

        } else if(other instanceof vector && (this.rn === other.rn)){
            for(let i = 0; i < this.rn; i++){
                this.#coords[i] -= other.#coords[i];
            }
            return this;
        }

        throw new Error("Invalid argument to perform operation.");
    }

    toArray() {
        return this.#coords;
    }

    clone(){
        return new vector(...this.#coords);
    }


}

class vertex_array{
    #points;
    #space;

    constructor(...args){
        if(args.length === 0){
            throw new Error("Invalid arguments to construct vertex_array.");
        }

        if(isNumber(args[0])){
            this.#space = args[0];
            this.#points = [];
            return;
        }

        let points = args;

        for (let i = 0; i < args.length; i++) {

            if(!(args[i] instanceof vector)){
                points[i] = new vector(...args[i]);
            }
            
            if(!(points[i].rn === points[0].rn)){
                throw "Space miss-match.";
            }
            
        }
        
        this.#points = points;
        this.#space = points[0].rn;
    }


    get size(){
        return this.#points.length;
    }

    get space(){
        return this.#space;
    }

    /**
    * @deprecated Use get() method instead.
    */
    at(index){
        console.warn("This function is deprecated. Use get() instead.");
        if(index < this.size){
            if((index < 0 && this.size + index > 0 && this.size + index < this.size) || index > 0){
                return this.#points[index];
            }
        }
        throw new Error("Invalid index.");
    }

    get(index){
        if(index < this.size){
            if((index < 0 && this.size + index > 0 && this.size + index < this.size) || index >= 0){
                return this.#points[index];
            }
        }
        throw new Error("Invalid index.");
    }

    set(index, value){
        if((index < 0) && (this.rn + index > 0)){
            this.#points[this.rn + index] = value;
            return this.#points[this.rn + index];

        } else if(this.rn + index < 0) {
            throw "Invalid index.";
        }

        if(index >= this.rn){
            for(i = this.rn; i < index; i++){
                this.#points[i] = 0;
            }
        }

        this.#points[index] = value;
        return this.#points[index];
    }

    pushPoint(newPoint){
        if(!(newPoint.rn === this.space)){
            throw "Space missmatch.";
        }
        this.#points[this.size] = newPoint;
    }

    pushVector(other){
        if(!(other instanceof vertex_array)){
            throw "'other' is not a vector.";
        }
        if(other.space !== this.space){
            throw "Vector spaces missmatch.";
        }

        this.#points = this.#points.concat(other.#points);
        return this.#points;

    }

    crossProduct2D(other) {
        if (this.space !== 2 || other.space !== 2) {
            console.log("This: " + this.space + "\nOther: " + other.space)
            throw "This cross product is only defined for 2-dimensional vectors.";
        }
        return this.#points[0].x * other.#points[0].y - this.#points[0].y * other.#points[0].x;
    }
      
    static crossProduct2D(first, second) {
        if (first.space !== 2 || second.space !== 2) {
            console.log("first: " + first.space + "\nSecond: " + second.space)
            throw "This cross product is only defined for 2-dimensional vectors.";
        }

        return first.#points[0].x * second.#points[0].y - first.#points[0].y * second.#points[0].x;
    }

    crossProduct3D(other) {
        if (this.space !== 3 || other.space !== 3) {
            console.log("This: " + this.space + "\nOther: " + other.space)
            throw "this cross product is only defined for 3-dimensional vectors.";
        }

        const a = this.#points[0];
        const b = this.#points[1];
        const c = other.#points[0];

        const ab = new vertex_array(new vector(b.x - a.x, b.y - a.y, b.z - a.z));
        const ac = new vertex_array(new vector(c.x - a.x, c.y - a.y, c.z - a.z));

        const x = ab.at(0).get(1) * ac.at(0).get(2) - ab.at(0).get(2) * ac.at(0).get(1);
        const y = ab.at(0).get(2) * ac.at(0).get(0) - ab.at(0).get(0) * ac.at(0).get(2);
        const z = ab.at(0).get(0) * ac.at(0).get(1) - ab.at(0).get(1) * ac.at(0).get(0);

        return new vertex_array(new vector(x, y, z));
    }
      
    static crossProduct3D(first, second) {
        if (first.space !== 3 || second.space !== 3) {
            console.log("first: " + first.space + "\nSecond: " + second.space)
            throw "this cross product is only defined for 3-dimensional vectors.";
        }

        const a = first.#points[0];
        const b = first.#points[1];
        const c = second.#points[0];

        const ab = new vertex_array(new vector(b.x - a.x, b.y - a.y, b.z - a.z));
        const ac = new vertex_array(new vector(c.x - a.x, c.y - a.y, c.z - a.z));

        const x = ab.at(0).get(1) * ac.at(0).get(2) - ab.at(0).get(2) * ac.at(0).get(1);
        const y = ab.at(0).get(2) * ac.at(0).get(0) - ab.at(0).get(0) * ac.at(0).get(2);
        const z = ab.at(0).get(0) * ac.at(0).get(1) - ab.at(0).get(1) * ac.at(0).get(0);

        return new vertex_array(new vector(x, y, z));
    }
        
    plus(other) {
        if(isNumber(other) || (other instanceof vector && this.space === other.rn)){
            for(let i = 0; i < this.size; i++){
                this.#points[i].plus(other);
            }
            return this;

        } else if(other instanceof vertex_array && this.space === other.space){
            const biggerSize = Math.max(this.size, other.size);

            for(let i = 0; i < biggerSize; i++){
                this.#points[i].plus(other.#points[i]);
            }
            return this;

        }
    }

    static sum(first, second) {
        if(first instanceof vertex_array){
            return first.plus(second);
        }
        throw new Error("First argument must be a vertex_array.");
    }
    
    minus(other) {
        if(isNumber(other) || (other instanceof vector && this.space === other.rn)){
            for(let i = 0; i < this.size; i++){
                this.#points[i].minus(other);
            }
            return this;

        } else if(other instanceof vertex_array && this.space === other.space){
            const biggerSize = Math.max(this.size, other.size);

            for(let i = 0; i < biggerSize; i++){
                this.#points[i].minus(other.#points[i]);
            }
            return this;
        }
    }

    static subtract(first, second) {
        if(first instanceof vertex_array){
            return first.minus(second);
        }
        throw new Error("First argument must be a vertex_array.");
    }

    convexHull() { // Credits: https://www.nayuki.io/page/convex-hull-algorithm
        var convexhull;
        (function (convexhull) {
            // Returns a new array of points representing the convex hull of
            // the given set of points. The convex hull excludes collinear points.
            // This algorithm runs in O(n log n) time.
            function makeHull(points) {
                let newPoints = points.slice();
                newPoints.sort(convexhull.POINT_COMPARATOR);
                return convexhull.makeHullPresorted(newPoints);
            }
            convexhull.makeHull = makeHull;
            // Returns the convex hull, assuming that each points[i] <= points[i + 1]. Runs in O(n) time.
            function makeHullPresorted(points) {
                if (points.length <= 1)
                    return points.slice();
                // Andrew's monotone chain algorithm. Positive y coordinates correspond to "up"
                // as per the mathematical convention, instead of "down" as per the computer
                // graphics convention. This doesn't affect the correctness of the result.
                let upperHull = [];
                for (let i = 0; i < points.length; i++) {
                    const p = points[i];
                    while (upperHull.length >= 2) {
                        const q = upperHull[upperHull.length - 1];
                        const r = upperHull[upperHull.length - 2];
                        if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x))
                            upperHull.pop();
                        else
                            break;
                    }
                    upperHull.push(p);
                }
                upperHull.pop();
                let lowerHull = [];
                for (let i = points.length - 1; i >= 0; i--) {
                    const p = points[i];
                    while (lowerHull.length >= 2) {
                        const q = lowerHull[lowerHull.length - 1];
                        const r = lowerHull[lowerHull.length - 2];
                        if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x))
                            lowerHull.pop();
                        else
                            break;
                    }
                    lowerHull.push(p);
                }
                lowerHull.pop();
                if (upperHull.length == 1 && lowerHull.length == 1 && upperHull[0].x == lowerHull[0].x && upperHull[0].y == lowerHull[0].y)
                    return upperHull;
                else
                    return upperHull.concat(lowerHull);
            }
            convexhull.makeHullPresorted = makeHullPresorted;
            function POINT_COMPARATOR(a, b) {
                if (a.x < b.x)
                    return -1;
                else if (a.x > b.x)
                    return +1;
                else if (a.y < b.y)
                    return -1;
                else if (a.y > b.y)
                    return +1;
                else
                    return 0;
            }
            convexhull.POINT_COMPARATOR = POINT_COMPARATOR;
        })(convexhull || (convexhull = {}));

        this.#points = convexhull.makeHull(this.#points);
        return this;
    }

    concaveHull(){ // W.I.P - Credits: https://github.com/Liagson/ConcaveHullGenerator
        this.#points = this.convexHull();

    }
      
    // static methods for Vector arithmetic as before
      

    sort(compareFn){
        return this.#points.sort(compareFn);
    }

    toArray() {
        return this.#points.map(point => [point.x, point.y]);
    }

    toPointArray() {
        return this.#points;
    }
}

class figure{
    #name;
    #fillingColor;
    #borderColor;
    #vertexes;

    constructor (name = "figure", colorFilling = "#fff", colorBorder = null, transforms, ...vertexes){

        vertexes = this.checkVertexVector(vertexes);

        if(transforms !== null){
            transforms.forEach(callBack => {
                vertexes = this.transformVertexes(vertexes, callBack);
            });
        }

        this.#name = name;
        this.#fillingColor = colorFilling;
        this.#borderColor = colorBorder === null? "none" : colorBorder;
        this.#vertexes = vertexes;


    }

    checkVertexVector(args){
        let vertexes = args;

        if(Array.isArray(args) && args.length === 1){
            while((args.length === 1) && !((args[0] === undefined && args.at(0) instanceof vector))){
                args = args[0];
            }
            if(args instanceof vertex_array){
                return args;
            }
            vertexes = new vertex_array(args[0].length);
            args.forEach(element => {
                vertexes.pushPoint(new vector(...element));
            });
        }

        return vertexes;
    }

    transformVertexes(vertexVector, callBack){
        let newVertexVector = new vertex_array(vertexVector.space);

        for (let i = 0; i < vertexVector.size; i++) {
            newVertexVector.pushPoint(callBack(vertexVector.get(i)));
        }

        return newVertexVector;
    }

    get area(){
        if(this.#vertexes.space < 2){
            throw "Operation not supported.";
        }

        const pointsCount = this.#vertexes.size;

        let area = 0;
        let previousVertex = pointsCount - 1;

        for (let i = 0; i < pointsCount; i++) { 
            const point_i = this.#vertexes.at(i);
            const point_j = this.#vertexes.at(previousVertex);

            const X_i = point_i.x;
            const Y_i = point_i.y;

            const X_j = point_j.x;
            const Y_j = point_j.y;

            if(!(X_i !== undefined && X_j !== undefined && Y_i !== undefined && Y_j !== undefined)){
                return "Operation not posible.";
            }

            area +=  (X_i + X_j) * (Y_j - Y_i); 
            previousVertex = i;
        }
        
        return Math.abs(area / 2);
    }

    get space(){
        return this.#vertexes.space;
    }

    get points(){
        return this.#vertexes.size;
    }

    get vertexVector(){
        return this.#vertexes;
    }

    log(){
        console.log(this.#name);
        console.log(this.area);
    }

    draw(canvas){
        let context = canvas.getContext(`${this.space}d`);

        context.beginPath();

        const pointsCount = this.#vertexes.size;
        context.moveTo(this.#vertexes.get(0).x, this.#vertexes.get(0).y);

        for (let i = 1; i < pointsCount; i++) { 
            context.lineTo(this.#vertexes.get(i).x, this.#vertexes.get(i).y);
            
        }

        context.closePath();

        // Line styles
        //context.setLineDash([25, 3, 3, 3, 3, 3, 3, 3]);
        context.lineJoin = "round";
        context.lineWidth = this.#borderColor === "none"? 0 : 3;
        context.strokeStyle = this.#borderColor;
        
        // Fill styles
        context.fillStyle = this.#fillingColor;

        context.stroke();
        context.fill();
         
    }
}

class triangle extends figure{

    constructor(identificators, color = "#fff", border = null, transforms, ...vertexes){
        let name = "triangle";

        if(identificators){
            name += " " + identificators;
        }

        super(name, color, border, transforms, vertexes);

        if(this.points !== 3){
            throw "Bad construction.";
        }

    }

    
}

class square extends figure{

    constructor(identificators, color = "#fff", border = null, transforms, ...vertexes){
        let name = "square";

        if(identificators){
            name += " " + identificators;
        }

        super(name, color, border, transforms, vertexes);
        
        if(this.points !== 4){
            throw "Bad construction.";
        }
    }
}


/**
 * @deprecated Incomplete class, do not use to create figures. Use individual figures instead.
 */
class tangram{
    #figures;
    #vertexes;
    #outline;

    #origin;
    #size;

    constructor(...figures){
        //this.#figures = [...figures];
        //this.#vertexes = new vector(...figures.vertexVector);
        this.#vertexes = new vertex_array(...figures);

        

        const tp = (pointArg) => { 
            const scale1 = .5;
            const offsetX1 = +500;
            const offsetY1 = +0;
            return new vector(offsetX1 + (pointArg.x * scale1), offsetY1 + (pointArg.y * scale1));
        }

        this.#outline = new figure("sus", "#fff", null, [tp], this.#vertexes.convexHull());
        // this.#outline = new figure("sus", "#fff", null, [tp], this.#vertexes.concaveHull()); // Not working ATM.
    }
    
    getOutline() {
        const vertexArray = this.#vertexes.toArray();
        const sortedVertices = vertexArray.sort(
            (a, b) => {
        const indexA = vertexArray.indexOf(a);
        const indexB = vertexArray.indexOf(b);
    
        const nextIndexA = (indexA + 1) % vertexArray.length;
        const nextIndexB = (indexB + 1) % vertexArray.length;
    
        const prevIndexA = (indexA - 1 + vertexArray.length) % vertexArray.length;
        const prevIndexB = (indexB - 1 + vertexArray.length) % vertexArray.length;
    
        const aIsNextToB = nextIndexA === indexB || nextIndexB === indexA;
        const aIsPrevToB = prevIndexA === indexB || prevIndexB === indexA;
    
        if (aIsNextToB) {
            return -1;
        } else if (aIsPrevToB) {
            return 1;
        } else {
            const crossProduct = this.#vertexes.crossProduct(a, b, vertexArray[nextIndexA]);
            return crossProduct;
        }
        });
        this.#vertexes = new vertexArray(...sortedVertices);
        return this.#vertexes;
    }
      
    draw(canvas){
        this.#outline.draw(canvas);
    }
    
}

function isNumber(arg){ // F*ck js
    return typeof(arg) === "number";
}



let P0 = new vector(103, 83);
let V0 = new vertex_array(P0, new vector(103, 197), [62, 140]);
let V1 = new vertex_array([131,3], [159,43], [103,43]);
let V2 = new vertex_array([103,83], [162,83], [102,163]);

const Transformation0 = (pointArg) => {
    const scale = .5;
    const offsetX = +200;
    const offsetY = +0;
    return new vector(offsetX + (pointArg.x * scale), offsetY + (pointArg.y * scale));
}

const Transformation1 = (pointArg) => {
    const scale = .5;
    const offsetX = +500;
    const offsetY = +0;
    return new vector(offsetX + (pointArg.x * scale), offsetY + (pointArg.y * scale));
}


// Figure 1
let F0_0 = new triangle("hat",        "#0f0",     "#fff", [Transformation0], [560, 80], [400, 240], [720, 240]);
let F0_1 = new triangle("head",       "#ffaf00",  "#fff", [Transformation0], [480, 240], [640, 240], [560, 320]);
let F0_2 = new triangle("body",       "#ffff00",  "#fff", [Transformation0], [575, 305], [575, 532], [348.6, 532]);
let F0_4 = new triangle("wea",        "#00ff0f",  "#fff", [Transformation0], [462, 531], [575, 645], [688, 531]);
let F0_6 = new triangle("Mmm Patas",  "#00a0ff",  "#fff", [Transformation0], [560, 758], [560, 871], [447, 871]);

let F0_3 = new square("waist",        "#5f0fff",  "#fff", [Transformation0], [462, 531], [575, 645], [462, 645], [349, 531]);
let F0_5 = new square("pants",        "#f04",     "#fff", [Transformation0], [575, 645], [575, 758], [462, 758], [462, 645]);

// Figure 2
let F1_1 = new triangle("body",       "#ffff00",  "#fff", [Transformation1], [560, 240], [720, 400], [400, 400]);
let F1_2 = new triangle("arm",        "#00ff0f",  "#fff", [Transformation1], [720, 400], [800, 320], [640, 320]);
let F1_3 = new triangle("arm2",       "#00ff0f",  "#fff", [Transformation1], [800, 320], [800, 94],  [913, 207]);
let F1_4 = new triangle("waist",      "#5f0fff",  "#fff", [Transformation1], [560, 400], [240, 400], [400, 560]);
let F1_6 = new triangle("Mmm Patas",  "#00a0ff",  "#fff", [Transformation1], [320, 640], [320, 753], [433, 753]);

let F1_0 = new square("head",         "#ffaf00",  "#fff", [Transformation1], [560, 80],  [640, 160], [560, 240], [480, 160]);
let F1_5 = new square("Lek",          "#f04",     "#fff", [Transformation1], [400, 560], [320, 480], [320, 640], [400, 720]);



let fullFigure = [
    [560, 80], [400, 240], [720, 240],
    [480, 240], [640, 240], [560, 320],
    [575, 305], [575, 532], [348.6, 532],
    [461.8, 531.4], [575, 644.6], [688.2, 531.4],
    [560, 757.8], [560, 871], [446.8, 871],
    [461.8, 531.4], [575, 644.6], [461.8, 644.6], [348.6, 531.4],
    [575, 644.6], [575, 757.8], [461.8, 757.8], [461.8, 644.6]
];


/**
 * @description Confused convex figures with concave figures :/
 */
//let convexHullFigure = new tangram(...new Set(fullFigure)); 

let canvas = document.getElementById("canvas");

// Draw figure 1
F0_0.draw(canvas);
F0_1.draw(canvas);
F0_2.draw(canvas);
F0_3.draw(canvas);
F0_4.draw(canvas);
F0_5.draw(canvas);
F0_6.draw(canvas);

// Draw figure 2
F1_0.draw(canvas);
F1_1.draw(canvas);
F1_2.draw(canvas);
F1_3.draw(canvas);
F1_4.draw(canvas);
F1_5.draw(canvas);
F1_6.draw(canvas);

// convexHullFigure.draw(canvas);
