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
