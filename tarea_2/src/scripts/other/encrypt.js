// jshashes

class SecurityManager{
    static encriptData(dataString){

        return "rubbish" + dataString;
    }
    
    static decriptData(dataString){
    
        return dataString.replace("rubbish", '');
    }
    
    static hashData(dataString){
        return "mangled" + dataString;
    }
    
    static generateCode(...elements){
        
        let code = "BD93F9";
        elements.forEach(element => {
            code += element;
        });

        return code;
    
    }

    static generateRandom(length, base){
        let result = 1;

        for(i = length; i > 0; i--){
            result *= 10;
        }

        result *= Math.random();
        return result.toString(base);
        
    }
}

