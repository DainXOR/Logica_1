if(!sessionStorage.getItem("userID")){
    sessionStorage.clear();

    window.location.href = "./bank_login.html";
    alert("Please log in first.");
}

document.addEventListener('DOMContentLoaded', function() {
    
    let user = setUp(); // Used on eval functions

    let pageBody = document.querySelector(".page-body");
    let menuBody = pageBody.querySelector(".menu-body");

    let mainButtons = menuBody.querySelectorAll(".main-button");
    let secondaryButtons = menuBody.querySelectorAll(".secondary-button");

    for(let i = 0; i < mainButtons.length; i++){
        mainButtons[i].addEventListener("click", (e) => {
            e.preventDefault();

            const buttonID = mainButtons[i].id;
            const sectionName = buttonID.replace("b_", "");
            const sectionDisplay = "display-" + sectionName;
            let pageClasses = pageBody.classList;
            let pageClassSize = pageClasses.length;

            // Set section .page-button is displaying
            if(pageClasses[pageClassSize - 1].startsWith("display")){
                pageClasses.remove(pageClasses[pageClassSize - 1]);
            }
            pageClasses.add(sectionDisplay);


            // Main buttons activation
            for (let j = 0; j < mainButtons.length; j++) {
                if(mainButtons[j].classList.contains("display")){
                    mainButtons[j].classList.toggle("display");
                    break;
                }
            }
            mainButtons[i].classList.add("display");

            // Secondary buttons reaction to main buttons changes
            for (let j = 0; j < secondaryButtons.length; j++) {
                if (secondaryButtons[j].classList.contains("secondary-" + sectionName)) {
                    secondaryButtons[j].classList.add("display");
                    secondaryButtons[j].style.transitionDelay = j/40 + "s";
                } 
                else if (secondaryButtons[j].classList.contains("display")){
                    secondaryButtons[j].classList.toggle("display");
                    secondaryButtons[j].style.transitionDelay = j/40 + "s";
                }
            }
        });
    }

    for (let i = 0; i < secondaryButtons.length; i++) {
        secondaryButtons[i].addEventListener("click", (e) => {
            e.preventDefault();

        });
        
    }

    pageBody.querySelector("#b_logout").addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.clear();
        window.location.href = "./bank_login.html";
    });

    for(let i = 0; i < buttons.length; i++){
        if(buttons[i].classList.contains("main-button") && buttons[i].id !== "b_logout"){
            buttons[i].addEventListener("click", (e) => {
                e.preventDefault();
    
                let elementID = e.target.id;
                let newClassName = "display" + elementID.replace("b_", "").capitalize();
                let pageClasses = pageBody.classList;
    
                if(pageClasses[pageClasses.length - 1].startsWith("display")){
                    pageClasses.remove(pageClasses[pageClasses.length - 1]);
                }
                pageClasses.add(newClassName);

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
    const userData = {id: sessionStorage["userID"], name: sessionStorage["userName"], pass: sessionStorage["userPass"]};
    const isNew = Boolean(parseInt(sessionStorage["isNew"]));

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
    //document.querySelector("#h_user_history").innerHTML = "This feature is not working.";
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
    console.log(Boolean(parseInt(sessionStorage["isNew"])));

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
  
const delay = ms => new Promise(res => setTimeout(res, ms));
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }