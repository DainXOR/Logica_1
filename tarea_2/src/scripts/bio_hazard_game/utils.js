function generateID(idString){
    let result = getRandomNumber(1_000, 9_999);
    result ^= Number(toNumbers(idString));
    result = Number(String(result) + String(getRandomNumber(1_000, 9_999)));

    return result;
}
function toNumbers(string){
    let result = "";
    for(let i = 0; i < string.length; i++){
        result += String(toASCII(string[i]));
    }

    return result;
}
function toASCII(char){
    return char.charCodeAt();
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min + 1)) + min;
}
function pickRandom(...choices){
    const choice = Math.round(getRandomNumber(0, choices.length - 1));
    return choices[choice];
}
function getRandomAvoid(min, max, ...toAvoid){
    const avoidArray = [...toAvoid];
    let value = 0;
    do{
        value = getRandomNumber(min, max);
    }while(avoidArray.includes(value));

    return value;
}
function getConditionateRandom(min, max, predicate){
    let value = 0;
    do{
        value = getRandomNumber(min, max);
    }while(!predicate(value));

    return value;
}
function getNRandom(n, min, max, predicate = ()=>{return true;}){
    let values = [];
    do{
        values = [];
        for (let i = 0; i < n; i++) {
            values.push(getRandomNumber(min, max));
        }
    }while(!predicate(...values));

    return values;
}

function toRGB(hexNumber){
    hexNumber = parseInt(hexNumber, 16);

    let r = Math.floor(hexNumber * 0.0625 * 0.0625 * 0.0625 * 0.0625);
    let g = Math.floor(hexNumber * 0.0625 * 0.0625) - (r * 16 * 16);
    let b = (hexNumber - (g * 16 * 16)) - (r * 16 * 16 * 16 * 16);
    
    return [r / 255, g / 255, b / 255];
}
function toHEX(rgbArray){
    let hexR = Math.floor(rgbArray[0] * 255) // .toString(16);
    let hexG = Math.floor(rgbArray[1] * 255) // .toString(16);
    let hexB = Math.floor(rgbArray[2] * 255) // .toString(16);

    hexR = hexR < 16? "0" + hexR.toString(16) : hexR.toString(16);
    hexG = hexG < 16? "0" + hexG.toString(16) : hexG.toString(16);
    hexB = hexB < 16? "0" + hexB.toString(16) : hexB.toString(16);
    
    return hexR + hexG + hexB;
}
function colorFader(hex1, hex2, mix = 0){
    const c1 = toRGB(hex1);
    const c2 = toRGB(hex2);

    const result = toHEX([
        (1 - mix) * c1[0] + mix * c2[0],
        (1 - mix) * c1[1] + mix * c2[1],
        (1 - mix) * c1[2] + mix * c2[2],
    ]);

    return result;
}
function colorGradient(color1, color2, steps){
    let gradient = [];
    for (let i = 0; i < steps; i++) {
        gradient.push(colorFader(color1, color2, i / steps).toString(16));
    }
    return gradient;
}
function getRandomColor() {
    let letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    // color += "A7"; // Opacity 
    return color;
}