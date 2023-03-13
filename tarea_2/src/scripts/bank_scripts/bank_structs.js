class User{
    #name; 
    #id; // Readonly
    #balance;
    #currency = "COP";
    #bankVerificationCode; // Readonly

    constructor(name, id, balance, currency, verificationCode){
        this.#name = name;
        this.#id = id;
        this.#balance = balance;
        this.#currency = currency;
        this.#bankVerificationCode = verificationCode;
    }

    get name(){
        return this.#name;
    }
    get id(){
        return this.#id;
    }
    get balance(){
        return Number(this.#balance);
    }
    get currency(){
        return this.#currency;
    }

    changeBalance(newBalance, bank){
        if(bank instanceof Bank && bank.getApproval(this) === this.#bankVerificationCode){
            this.#balance = newBalance;
            return true;
        }
        return false;
    }
    changeCurrency(newCurrency, bank){
        if(bank instanceof Bank && bank.getApproval(this) === this.#bankVerificationCode){
            this.#currency = newCurrency;
            return true;
        }
        return false;
    }
}

class Bank{
    #bankUsers = new Map();

    createNewAcount(name, id, pass){

        let secretCode = this.#generateKey(name, id);

        this.#bankUsers.set(id, {
            name: name, 
            id: id, 
            pass: pass, 
            code: secretCode,
            balance: "0",
            currency: "COP"
        });
        // this.#writeBankData("", [id, name, pass, secretCode, 0, "COP"]);
        return new User(name, id, 0, "COP", secretCode, pass);
    }

    logIn(id){
        let userData = this.#getBankData().get(id);
        if(userData["code"] === SecurityManager.hashData(SecurityManager.generateCode(userData["name"], id))){
            this.#bankUsers.set(id, userData);
            return new User(userData["name"], id, userData["balance"], userData["currency"], userData["code"], userData["pass"]);
        }
        console.log("[ERROR]: The user does not belong to this bank.");
        return null;
    }

    getApproval(user){
        if(this.#bankUsers.has(user.id)){
            let secretCode = SecurityManager.generateCode(user.name, user.id);
            return SecurityManager.hashData(secretCode);
        }
        console.log("[WARN]: User is not register with this bank.");
        return "-1";
    }

    changeCurrency(user, newCurrency){
        let success = true;

        if(Object.keys(Bank.#currencies).includes(newCurrency)){
            user.changeBalance(Math.round(Bank.#currencies[newCurrency](user)), this) ? 0 : success = false;
            user.changeCurrency(newCurrency, this) ? 0 : success = false;

            if(!success){
                console.log("[ERROR]: Could not perform convertion.");
            }
            return success;
        }
        console.log("[ERROR]: Convertion not supported.");
        return false;
    }


    deposit(userReceiver, amount, incomeCurrency){
        const userCurrency = userReceiver.currency;
        amount = Math.abs(amount);

        if(this.changeCurrency(userReceiver, incomeCurrency)){

            userReceiver.changeBalance(userReceiver.balance + amount, this);
            this.changeCurrency(userReceiver, userCurrency);
            return true;
        }

        console.log("[ERROR]: Could not deposit.");
        return false;
    }
    withdraw(userReceiver, amount, incomeCurrency){
        const userCurrency = userReceiver.currency;
        amount = Math.abs(amount);

        if(this.changeCurrency(userReceiver, incomeCurrency)){

            if(userReceiver.balance < amount){
                this.changeCurrency(userReceiver, userCurrency);
                console.log("[ERROR]: Insufficient-funds.");
                return false;
            }

            userReceiver.changeBalance(userReceiver.balance - amount, this);
            this.changeCurrency(userReceiver, userCurrency);
            return true;
        }

        console.log("[ERROR]: Could not withdraw.");
        return false;
            
    }

    #getBankData(path){
        return bankData;
    }
    #writeBankData(path, data){ // ;-;
        console.log("[ERROR]: Not implemented.");
    }

    #generateKey(name, id){
        let secretCode = SecurityManager.generateCode(name, id);
        return SecurityManager.hashData(secretCode);
    }


    static #convertionRates = {
        USD_COP: 4739.34,
        COP_USD: 0.000211,
    }
    static #convert = (user, newCurrency) => {
        return user.currency === newCurrency? 
        user.balance : 
        user.balance * Bank.#convertionRates[user.currency + "_" + newCurrency];
    }
    static #currencies = { // No more just for now (I'm lazy :D)
        COP: (user) => {return Bank.#convert(user, "COP")},
        USD: (user) => {return Bank.#convert(user, "USD")},
    }
}

