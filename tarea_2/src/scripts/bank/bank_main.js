if(!localStorage.getItem("userID")){
    localStorage.removeItem("userID");
    localStorage.removeItem("userName");
    localStorage.removeItem("userPass");
    localStorage.removeItem("isNew");

    window.location.href = "./bank_login.html";
    alert("Please log in first.");
}

document.addEventListener('DOMContentLoaded', function() {
    
    let user = setUp(); // Used on eval functions

    document.getElementsByClassName("accountBalance").innerHTML = "Hmm";

    let panel = document.querySelector(".panel");

    let buttons = panel.querySelectorAll("input[type='button']");

    panel.querySelector("#b_logout").addEventListener("click", (e) => {
        e.preventDefault();

        localStorage.removeItem("userID");
        localStorage.removeItem("userName");
        localStorage.removeItem("userPass");
        localStorage.removeItem("isNew");

        window.location.href = "./bank_login.html";
    });

    for(let i = 0; i < buttons.length; i++){
        if(buttons[i].classList.contains("backButton")){
            buttons[i].addEventListener("click", (e) => {
                e.preventDefault();

                let directParent = e.target.parentElement;
                let grandParent = directParent.parentElement;

                if(e.target.classList[0][1] == 0){
                    panel.classList.remove(panel.classList[1]);
                }
                else if(
                    parseInt(e.target.classList[0][1]) >= 1 && 
                    grandParent.classList.contains("display")){

                        grandParent.classList.remove(grandParent.classList[grandParent.classList.length - 2]);
                        grandParent.classList.remove(grandParent.classList[grandParent.classList.length - 1]);
                }

                removeListeners();
                
            });
        }
        else if(buttons[i].classList.contains("mainButton") && buttons[i].id !== "b_logout"){
            buttons[i].addEventListener("click", (e) => {
                e.preventDefault();
    
                let elementID = e.target.id;
                let newClassName = "display" + elementID.replace("b_", "").capitalize();
    
                if(panel.classList[panel.classList.length - 1].startsWith("display")){
                    panel.classList.remove(panel.classList[panel.classList.length - 1]);
                }
                panel.classList.add(newClassName);

                if(elementID !== "b_transaction"){
                    let functionCall = newClassName + "(user)";
                    toRemoveListener(eval(functionCall));
                }
    
            });
        }
        else if(buttons[i].classList.contains("t0Button")){
            buttons[i].addEventListener("click", (e) => {
                e.preventDefault();

                let transactionOptions = e.target.parentElement;
                let transactionBox = transactionOptions.parentElement;
                let tBoxClassLenght = transactionBox.classList.length;

    
                let elementID = e.target.id;
                elementID = elementID.replace("b_", "");

                let newClassName = "display" + snakeToCamel(elementID).capitalize();
    
                if(transactionBox.classList[tBoxClassLenght - 1].startsWith("display")){
                    transactionBox.classList.remove(transactionBox.classList[tBoxClassLenght - 1]);
                }
                transactionBox.classList.add("display");
                transactionBox.classList.add(newClassName);

                let functionCall = "do" + snakeToCamel(elementID).capitalize() + "(user)";
                toRemoveListener(eval(functionCall));
    
            });
        }
    }
});

let bankInstance = null;
let elementsWithListener = [];

function getBank(){
    bankInstance = bankInstance || new Bank();
    return bankInstance;
}

function setUp(){
    const userData = {id: localStorage["userID"], name: localStorage["userName"], pass: localStorage["userPass"]};
    const isNew = Boolean(parseInt(localStorage["isNew"]));

    return isNew? 
        // This should've been already created inside login page, but no read/write files here... :'(
        getBank().createNewAcount(userData["name"], userData["id"]) :
        getBank().logIn(userData["id"]);
}

function toRemoveListener(element){
    if(element === null ||element === undefined){
        return false;
    }

    elementsWithListener.push(element);
    return true;
}

function removeListeners(){
    if(elementsWithListener.length === 0){
        return false;
    }

    for(let i = elementsWithListener.length - 1; i >= 0; i--){
        elementsWithListener[i][0].removeEventListener("click", elementsWithListener[i][1]);
    }
    return true;
}

function displayBalance(userData){
    document.querySelector("#account_balance").innerHTML = userData.balance;
    document.querySelector("#account_currency").innerHTML = userData.currency;

    return null;
}
function displayHistory(userData){
    document.querySelector("#h_user_history").innerHTML = "This feature is not working.";
    console.log("[ERROR]: Not implemented.");

    return null;
}

function doCurrencyChange(userData){
    let contentDiv = document.querySelector(".currencyChangeBox").children[1];
    contentDiv.children[1].value = userData.currency;
    contentDiv.children[0].innerHTML = userData.balance;

    contentDiv.children[1].onchange = () => {
        let finalCurrency = contentDiv.children[1].value;
        contentDiv.children[0].innerHTML = userData.balance;

        if(userData.currency !== finalCurrency){
            getBank().changeCurrency(userData, finalCurrency);
        }

        contentDiv.children[2].innerHTML = userData.balance;
    }

    console.log("This kinda works.");
    console.log("Better check the balance on main menu.");
    return null;
}
function doWithdraw(userData){
    
    let userBalanceSpan = document.querySelector("#w_actual_balance");
    const withdrawButton = document.querySelector("#bw_withdraw");
    const withdrawDropdown = document.querySelector(".withdrawBox").children[1].children[1];

    userBalanceSpan.innerHTML = "Actual balance: " + userData.balance + " " + userData.currency;

    const buttonFunction = (e) => {
        e.preventDefault();

        const withdrawAmount = document.querySelector("#withdraw_amount").value;
        const withdrawCurrency = withdrawDropdown.value;
        
        getBank().withdraw(userData, withdrawAmount, withdrawCurrency);
        userBalanceSpan.innerHTML = "Actual balance: " + userData.balance + " " + userData.currency;
    
    }

    withdrawButton.addEventListener("click", buttonFunction);    

    return [withdrawButton, buttonFunction];
}
function doDeposit(userData){
    let userBalanceSpan = document.querySelector("#d_actual_balance");
    const depositButton = document.querySelector("#bd_deposit");
    const depositDropdown = document.querySelector(".depositBox").children[1].children[1];

    userBalanceSpan.innerHTML = "Actual balance: " + userData.balance + " " + userData.currency;

    const buttonFunction = (e) => {
        e.preventDefault();

        const depositAmount = document.querySelector("#deposit_amount").value;
        const depositCurrency = depositDropdown.value;
        
        getBank().deposit(userData, depositAmount, depositCurrency);
        userBalanceSpan.innerHTML = "Actual balance: " + userData.balance + " " + userData.currency;
    }

    depositButton.addEventListener("click", buttonFunction);    

    return [depositButton, buttonFunction];
}
function doTransfer(userData){
    console.log("[ERROR]: Not implemented.");

    return undefined;
}



function test(actualUser){
    console.log(Boolean(parseInt(localStorage["isNew"])));

    console.log(actualUser.balance);

    getBank().deposit(actualUser, 70, "USD");
    console.log(actualUser.balance);

    getBank().changeCurrency(actualUser, "COP");
    console.log(actualUser.balance);

    getBank().withdraw(actualUser, 50, "USD");
    console.log(actualUser.balance);

    getBank().withdraw(actualUser, 100_000, "COP");
    console.log(actualUser.balance);

    getBank().deposit(actualUser, 50, "USD");
    console.log(actualUser.balance);

}

Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
  });

const snakeToCamel = str =>
str.toLowerCase().replace(/([-_][a-z])/g, group =>
  group
    .toUpperCase()
    .replace('-', '')
    .replace('_', '')
);
  
