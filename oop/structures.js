class point{
    #coords;

    constructor(...coordinates){
        if(Array.isArray(coordinates[0])){
            this.#coords = coordinates[0];
            return;
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

    toArray() {
        return this.#coords;
    }


}

class vector{
    #points;
    #space;

    constructor(...args){

        if(args.length === 0){
            this.#space = 2;
            this.#points = [];
            return;
        }

        let points = args;

        for (let i = 0; i < args.length; i++) {

            if(!(args[i] instanceof point)){
                points[i] = new point(args[i]);
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

    at(index){
        if(index < this.size)
            return this.#points[index];

        return null;
    }

    pushPoint(newPoint){
        if(!(newPoint.rn === this.space)){
            throw "Space missmatch.";
        }
        this.#points[this.size] = newPoint;
    }

    pushVector(other){
        if(!(other instanceof vector)){
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

        const ab = new vector(new point(b.x - a.x, b.y - a.y, b.z - a.z));
        const ac = new vector(new point(c.x - a.x, c.y - a.y, c.z - a.z));

        const x = ab.at(0).get(1) * ac.at(0).get(2) - ab.at(0).get(2) * ac.at(0).get(1);
        const y = ab.at(0).get(2) * ac.at(0).get(0) - ab.at(0).get(0) * ac.at(0).get(2);
        const z = ab.at(0).get(0) * ac.at(0).get(1) - ab.at(0).get(1) * ac.at(0).get(0);

        return new vector(new point(x, y, z));
    }
      
    static crossProduct3D(first, second) {
        if (first.space !== 3 || second.space !== 3) {
            console.log("first: " + first.space + "\nSecond: " + second.space)
            throw "this cross product is only defined for 3-dimensional vectors.";
        }

        const a = first.#points[0];
        const b = first.#points[1];
        const c = second.#points[0];

        const ab = new vector(new point(b.x - a.x, b.y - a.y, b.z - a.z));
        const ac = new vector(new point(c.x - a.x, c.y - a.y, c.z - a.z));

        const x = ab.at(0).get(1) * ac.at(0).get(2) - ab.at(0).get(2) * ac.at(0).get(1);
        const y = ab.at(0).get(2) * ac.at(0).get(0) - ab.at(0).get(0) * ac.at(0).get(2);
        const z = ab.at(0).get(0) * ac.at(0).get(1) - ab.at(0).get(1) * ac.at(0).get(0);

        return new vector(new point(x, y, z));
    }
        
    convexHull() { // constructor, add and toArray methods as before
      const points = this.#points;
      const pointsCount = this.size;
    
      // check if there are at least 3 points
      if (pointsCount < 3) {
        return points;
      }
    
      // find the leftmost point
      let leftmost = 0;
      for (let i = 1; i < pointsCount; i++) {
        if (points[i].x < points[leftmost].x) {
          leftmost = i;
        }
      }
    
      // start with the leftmost point and keep adding points to the hull
      let hull = [points[leftmost]];
      let current = leftmost;
      let next;
    
      do {
        // find the next point in the hull
        next = (current + 1) % pointsCount;
    
        for (let i = 0; i < pointsCount; i++) {
          // skip the same point and the previous point in the hull
          if (i === current || i === next) {
            continue;
          }
    
          // check if the point is on the left side of the line
          const cross = vector.crossProduct2D(
            vector.subtract(points[i], points[current]),
            vector.subtract(points[next], points[current])
          );
          if (cross < 0) {
            next = i;
          }
        }
    
        // add the next point to the hull
        hull.push(points[next]);
        current = next;
      } while (current !== leftmost);
    
      return hull;
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
            while((args.length === 1) && !((args[0] === undefined && args.at(0) instanceof point))){
                args = args[0];
            }
            if(args instanceof vector){
                return args;
            }
            vertexes = new vector();
            args.forEach(element => {
                vertexes.pushPoint(new point(element));
            });
        }

        return vertexes;
    }

    transformVertexes(vertexVector, callBack){
        let newVertexVector = new vector();

        for (let i = 0; i < vertexVector.size; i++) {
            newVertexVector.pushPoint(callBack(vertexVector.at(i)));
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
        context.moveTo(this.#vertexes.at(0).x, this.#vertexes.at(0).y);

        for (let i = 1; i < pointsCount; i++) { 
            context.lineTo(this.#vertexes.at(i).x, this.#vertexes.at(i).y);
            
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

class tangram{
    #figures;
    #vertexes;
    #outline;

    #origin;
    #size;

    constructor(...figures){
        //this.#figures = [...figures];
        //this.#vertexes = new vector(...figures.vertexVector);
        this.#vertexes = new vector(...figures);

        //this.#outline = new figure("sus", "#fff", null, null, this.#vertexes.convexHull());
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
        this.#vertexes = new vector(...sortedVertices);
        return this.#vertexes;
    }
      
    draw(canvas){
        this.#outline.draw(canvas);
    }
    
}



let P0 = new point(103, 83);
let V0 = new vector(P0, new point(103, 197), [62, 140]);
let V1 = new vector([131,3], [159,43], [103,43]);
let V2 = new vector([103,83], [162,83], [102,163]);

const scale = .5;
const offsetX = +200;
const offsetY = +0;

const Transformation = (pointArg) => { 
    return new point(offsetX + (pointArg.x * scale), offsetY + (pointArg.y * scale));
}
//const tY = (pointArg) => { 
//    return new point(pointArg.x, offsetY + (pointArg.y * scale));
//}

let F0 = new triangle("hat",        "#0f0",     "#fff", [Transformation], [560, 80], [400, 240], [720, 240]);
let F1 = new triangle("head",       "#ffaf00",  "#fff", [Transformation], [480, 240], [640, 240], [560, 320]);
let F2 = new triangle("body",       "#ffff00",  "#fff", [Transformation], [575, 305], [575, 532], [348.6, 532]);
let F4 = new triangle("wea",        "#00ff0f",  "#fff", [Transformation], [461.8, 531.4], [575, 644.6], [688.2, 531.4]);
let F6 = new triangle("Mmm Patas",  "#00a0ff",  "#fff", [Transformation], [560, 757.8], [560, 871], [446.8, 871]);

let F3 = new square("waist",        "#5f0fff",  "#fff", [Transformation], [461.8, 531.4], [575, 644.6], [461.8, 644.6], [348.6, 531.4]);
let F5 = new square("pants",        "#f04",     "#fff", [Transformation], [575, 644.6], [575, 757.8], [461.8, 757.8], [461.8, 644.6]);

let fullFigure = [
    [560, 80], [400, 240], [720, 240],
    [480, 240], [640, 240], [560, 320],
    [575, 305], [575, 532], [348.6, 532],
    [461.8, 531.4], [575, 644.6], [688.2, 531.4],
    [560, 757.8], [560, 871], [446.8, 871],
    [461.8, 531.4], [575, 644.6], [461.8, 644.6], [348.6, 531.4],
    [575, 644.6], [575, 757.8], [461.8, 757.8], [461.8, 644.6]
];



//let T0 = new tangram(...new Set(fullFigure))


let canvas = document.getElementById("canvas");

F0.draw(canvas);
F1.draw(canvas);
F2.draw(canvas);
F3.draw(canvas);
F4.draw(canvas);
F5.draw(canvas);
F6.draw(canvas);

//T0.draw(canvas);