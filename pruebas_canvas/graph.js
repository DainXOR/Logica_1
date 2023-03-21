class ObjectSize{
    #width = 0;
    #height = 0;
    
    #oldWidth = 0;
    #oldHeight = 0;

    #newWidth = 0;
    #newHeight = 0;

    constructor(){
    }

    initialSize(object){
        this.#width = object.width;
        this.#height = object.height;

        this.#newWidth = this.#width;
        this.#newHeight = this.#height;
    }

    getWidth(){
        return this.#width;
    }
    getHeight() {
        return this.#height;
    }

    getOldWidth(){
        return this.#oldWidth;
    }
    getOldHeight() {
        return this.#oldHeight;
    }

    getActualWidth(){
        return this.#newWidth;
    }
    getActualHeight() {
        return this.#newHeight;
    }

    setWidth(value){
        this.#oldWidth = this.#width;
        this.#newWidth = value;

    }
    setHeight(value) {
        this.#oldHeight = this.#height;
        this.#newHeight = value;
    }

    scale(real1, real2){
        this.setWidth(this.getActualWidth() * real1);
        this.setHeight(this.getActualHeight() * real2);
    }

};

let canvasSize = new ObjectSize();

const GRAPH_COLORS = ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff"];
const ECUATION_PATTERNS = {
    slope_intercept: /^(y[\s]?=[\s]?)([+-]?([0-9]+[.])?[0-9]+)([\s]?x[\s]?)([+-]?[\s]?([0-9]+[.])?[0-9]+)$/,
    slope_point: /^(y[\s]?[+-]{1}[\s]?)([0-9]+[.])?[0-9]+[\s]?=[\s]?[+-]?[\s]?([0-9]+[.])?[0-9]+[\s]?(\(x[\s]?[+-]{1}[\s]?([0-9]+[.])?[0-9]+\))+$/,

    slope_intercept_y_variable: /(y[\s]?=[\s]?)/,
    slope_point_y_variable: /(y[\s]?)/,
}
let scale = {
    x: 1,
    y: 1,
}

document.addEventListener("DOMContentLoaded", function() {
    let button = document.getElementById("b_ge");
    let canvas = document.getElementById("canvas1");
    let context = canvas.getContext('2d');

    let ecuationsList = [];

    canvasSize.initialSize(canvas);
    drawPlane(context);

    function handleEcuations(e) {
        let ecuations = document.getElementsByClassName("ecuation");
        let failure = 2;
        ecuationsList = [];
        
        clearCanvas(context);
        drawPlane(context);
    
        for(let i = ecuations.length - 1; i >= 0; i--){
            let ecuation = ecuations[i].value;
            let evaluate;

            if(ecuation === ""){
                alert("Por favor ingrese las dos ecuaciones antes de graficar.");
                return;
            }
            
            if(ecuation.match(ECUATION_PATTERNS.slope_intercept)){
                evaluate = ecuation.replace(ECUATION_PATTERNS.slope_intercept_y_variable, "(");
    
                evaluate = evaluate.replace("x", "* x)");
                ecuationsList.push(evaluate);
            } 
            else if(ecuation.match(ECUATION_PATTERNS.slope_point)){
                evaluate = ecuation.replace(ECUATION_PATTERNS.slope_point_y_variable, "");
                y1Value = evaluate.split("=")[0];
                evaluate = evaluate.replace(/[\s]?[+-]{1}[\s]?([0-9]+[.])?[0-9]+[\s]?=[\s]?/, "");
                evaluate = evaluate.replace("(", "* (");
                evaluate += "- " + y1Value;
    
                ecuationsList.push(evaluate);
            }
    
            try {
                drawLine(evaluate, context, GRAPH_COLORS[i], scale);
            } catch (error) {
                alert("La ecuacion " + failure + " no es valida, correjala e intente nuevamente.");
                return;
            } finally {
                failure--;
            }
        }
    
        const data = getIntercept(ecuationsList[0], ecuationsList[1]);
        const result = [data[1], data[2]];
        let interceptText = "";
    
        switch(data[0]){
            case "parallel":{
                interceptText += "The lines are parallel.\n";
                break;
            }
            case "perpendicular":{
                interceptText += "The lines are perpendicular.\n";
            }
            default:{
                interceptText += "The lines intercept at <" + result.join(", ") + ">";
                break;
            }
        }
        
        console.log(interceptText);
        //alert(interceptText);
    
    }
    
    const scaleGraph = (e) => {
        //console.log(e.wheelDelta);
        const ecuationsCopy = ecuationsList;

        if (e.wheelDelta > 0){
            context.scale(1.01, 1.01);
            canvasSize.scale(1.01, 1.01);
            //scale.x -= 0.1;
            //scale.y -= 0.1;
        }
        else{
            context.scale(0.99, 0.99);
            canvasSize.scale(0.99, 0.99);
            //scale.x += 0.1;
            //scale.y += 0.1;
        }

        clearCanvas(context);

        context.translate(
                        canvasSize.getActualWidth() - canvasSize.getOldWidth(), 
                        canvasSize.getActualHeight() - canvasSize.getOldHeight()
                        );

        //context.scale(0.9, 0.9);
        drawPlane(context);
        drawLine(ecuationsCopy[0], context, GRAPH_COLORS[1]);
        drawLine(ecuationsCopy[1], context, GRAPH_COLORS[0]);
    }

    button.addEventListener("click", handleEcuations);
    //document.removeEventListener("wheel", scaleGraph);
    canvas.addEventListener("wheel", scaleGraph);
});

function clearCanvas(context) {
    context.save();

    // Use the identity matrix while clearing the canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvasSize.getWidth(), canvasSize.getHeight());

    // Restore the transform
    context.restore();
}

function drawPlane(context){
    const horizontalMiddle = canvasSize.getActualWidth() / 2;
    const verticalMiddle = canvasSize.getActualHeight() / 2;

    context.beginPath();
    context.setLineDash([2, 2]);
    context.lineWidth = 0.3;
    context.strokeStyle = "#ffffff28";

    context.moveTo(0, verticalMiddle);
    context.lineTo(canvasSize.getActualWidth(), verticalMiddle)

    context.moveTo(horizontalMiddle, 0);
    context.lineTo(horizontalMiddle, canvasSize.getActualHeight());

    context.stroke();

    context.closePath();

}

function drawLine(evaluate, context, lineColor){
    //let interceptCero = eval(evaluate.replace("x", " 0 "));
    let intercept_mt = eval(evaluate.replace("x", " -1000 "));
    let intercept_pt = eval(evaluate.replace("x", " 1000 "));

    const hMiddle = canvasSize.getActualWidth() / 2;
    const vMiddle = canvasSize.getActualHeight() / 2;

    context.beginPath();
    context.setLineDash([]);
    context.lineWidth = 0.5;
    context.strokeStyle = lineColor;
                
    context.moveTo(hMiddle - (1000), vMiddle - (intercept_mt));
    //context.lineTo(hMiddle, vMiddle - interceptCero);
    context.lineTo(hMiddle + (1000), vMiddle - (intercept_pt));
                
    context.stroke();
    context.closePath();
}

function getIntercept(ecuation1, ecuation2){
    let ecuation1_Point1 = [-1000, eval(ecuation1.replace("x", " -1000 "))];
    let ecuation1_Point2 = [1000, eval(ecuation1.replace("x", " 1000 "))];
    let ecuation2_Point1 = [-1000, eval(ecuation2.replace("x", " -1000 "))];
    let ecuation2_Point2 = [1000, eval(ecuation2.replace("x", " 1000 "))];

    let x11 = ecuation1_Point1[0],
        y11 = ecuation1_Point1[1],
        x21 = ecuation1_Point2[0],
        y21 = ecuation1_Point2[1];

    let x12 = ecuation2_Point1[0],
        y12 = ecuation2_Point1[1],
        x22 = ecuation2_Point2[0],
        y22 = ecuation2_Point2[1];


    const determinant = (x21 - x11) * (y22 - y12) - (x22 - x12) * (y21 - y11); // 0 -> Paralelas

    if (determinant === 0) {
        return ["parallel", 0, 0];
    } 

    // const gamma = ((y11 - y21) * (x22 - x11) + (x21 - x11) * (y22 - y11)) / determinant; // Usefull for intercept inside 2 points
    const lambda = ((y22 - y12) * (x22 - x11) + (x12 - x22) * (y22 - y11)) / determinant;
    const slope1 = getSlope(ecuation1_Point1, ecuation1_Point2);
    const slope2 = getSlope(ecuation2_Point1, ecuation2_Point2);

    let x = x11 + lambda * (x21 - x11);
    let y = y11 + lambda * (y21 - y11);

    return [slope1 * slope2 === -1 ? "perpendicular" : 0, x.toFixed(2), y.toFixed(2)];
    
}

function getSlope(point1, point2) {
    return (point2[1] - point1[1]) / (point2[0] - point1[0]);
}

