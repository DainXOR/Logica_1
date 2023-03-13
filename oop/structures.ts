class pointts{
    private coords: number[];
    
    constructor(...coordinates: number[]){
        this.coords = coordinates;
    }

    [index: number]: number;

    get(index: number): number{
        return this.coords[index];
    }

    set(index: number, value: number): number{
        for(let i = this.rn; i < index; i++){
            this.coords[i] = 0;
        }
        return this.coords[index] = value;
    }

    get x(): number{
        return this.coords[0];
    }
    get y(): number{
        return this.coords[1];
    }
    get z(): number{
        return this.coords[2];
    }
    get w(): number{
        return this.coords[3];
    }

    get rn(): number{
        return this.coords.length;
    }
}

class vectorts{
    private points: pointts[];
    private readonly rn: number;

    constructor(...args: pointts[]){

        if(args.length === 0){
            this.rn = 2;
            this.points = [];
            return;
        }

        this.points = args;
        this.rn = args[0].rn;
    }

    get size(){
        return this.points.length;
    }

    get space(){
        return this.rn;
    }

    [index: number]: pointts;
    
    get(index: number): pointts{
        if(index >= this.size){
            throw "Index out of range";
        }

        return this.points[index];
    }

    set(index: number, newPoint: pointts): pointts{
        if(index > this.size){
            let filler: pointts = new pointts();
            for(let i = 0; i < this.space; i++){
                filler[i] = 0;
            }

            for(let i = this.size; i < index; i++){
                this.points[i] = filler;
            }
        }
        
        this.points[index] = newPoint;
        return this.points[index];
    }

    pushBack(newPoint: pointts){
        if(newPoint.rn === this.rn){
            this.points[this.size] = newPoint;
        }
    }
}

class figurets{
    private readonly    name:           string;
    private             fillingColor:   string;
    private             borderColor:    string;

    private             vertexes:       vectorts;


    constructor (name: string = "figure", colorFilling: string = "#fff", colorBorder: string | null = null, vertexes: vectorts){

        this.name = name;
        this.fillingColor = colorFilling;
        this.borderColor = colorBorder === null? "none" : colorBorder;
        this.vertexes = vertexes;

    }

    get area(){
        if(this.vertexes.space != 2){
            throw "Operation not supported.";
        }

        const pointsCount = this.vertexes.size;

        let area = 0;
        let previousVertex = pointsCount - 1;

        for (let i = 0; i < pointsCount; i++) { 
            const point_i = this.vertexes[i];
            const point_j = this.vertexes[previousVertex];

            const X_i = point_i.x;
            const Y_i = point_i.y;

            const X_j = point_j.x;
            const Y_j = point_j.y;

            if((X_i === undefined || X_j === undefined || Y_i === undefined || Y_j === undefined)){
                return "Operation not posible.";
            }

            area +=  (X_i + X_j) * (Y_j - Y_i); 
            previousVertex = i;
        }
        
        return Math.abs(area / 2);
    }

    get space(){
        return this.vertexes.space;
    }

    get points(){
        return this.vertexes.size;
    }

    log(){
        console.log(this.name);
        console.log(this.area);
    }

    draw(canvas: any){
        let context = canvas.getContext(`${this.space}d`);

        context.beginPath();

        const pointsCount = this.vertexes.size;
        context.moveTo(this.vertexes[0].x, this.vertexes[0].y);

        for (let i = 1; i < pointsCount; i++) { 
            context.lineTo(this.vertexes[i].x, this.vertexes[i].y);
            
        }

        context.closePath();

        // Line styles
        //context.setLineDash([25, 3, 3, 3, 3, 3, 3, 3]);
        context.lineJoin = "round";
        context.lineWidth = this.borderColor === "none"? 0 : 3;
        context.strokeStyle = this.borderColor;
        
        // Fill styles
        context.fillStyle = this.fillingColor;

        context.stroke();
        context.fill();
         
    }
}

class trianglets extends figurets{

    constructor(identificators: string, color: string = "#fff", border: string | null = null, vertexes: vectorts){
        let name = "triangle";

        if(identificators){
            name += " " + identificators;
        }

        super(name, color, border, vertexes);

        if(this.points !== 3){
            throw "Bad construction.";
        }

    }

    
}

class squarets extends figurets{

    constructor(identificators: string, color: string = "#fff", border: string | null = null, vertexes: vectorts){
        let name = "square";

        if(identificators){
            name += " " + identificators;
        }

        super(name, color, border, vertexes);
        
        if(this.points !== 4){
            throw "Bad construction.";
        }
    }
}


let tsP0: pointts = new pointts(1, 2, 3, 4, 5);

console.log("Funciona");
console.log(tsP0);