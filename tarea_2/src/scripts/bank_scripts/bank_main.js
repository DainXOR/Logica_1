document.addEventListener('DOMContentLoaded', function() {
    
    let user = setUp();

    document.getElementsByClassName("accountBalance").innerHTML = "Hmm";

    let panel = document.querySelector(".panel");
    let mainBox = panel.querySelector(".main");

    let buttons = panel.querySelectorAll("input[type='button']");

    panel.querySelector("#b_logout").addEventListener("click", (e) => {
        console.log("[ERROR]: Not implemented.");
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
    
            });
        }
        else if(buttons[i].classList.contains("t0Button")){
            buttons[i].addEventListener("click", (e) => {
                e.preventDefault();
                let transactionOptions = e.target.parentElement;
                let transactionBox = transactionOptions.parentElement;

                
                //console.log(parent.classList);
                //console.log(e.target.parentNode.classList);
    
                let elementID = e.target.id;
                elementID = elementID.replace("b_", "");

                let newClassName = "display" + snakeToCamel(elementID).capitalize();
                let panelClassLenght = panel.classList.length;
    
                if(transactionBox.classList[panelClassLenght - 1].startsWith("display")){
                    transactionBox.classList.remove(transactionBox.classList[panelClassLenght - 1]);
                }
                transactionBox.classList.add("display");
                transactionBox.classList.add(newClassName);

                // transactionBox.children[2].classList.add("display");
                // transactionBox.children[2].classList.add(newClassName);;

                // console.log(e);
                // console.log(transactionOptions.nextElementSibling);
                // console.log(transactionBox.children[2]);
    
                // console.log(elementID);
                // console.log(newClassName);
    
            });
        }
    }
    buttons;
    // test(user);

    
});

let bankInstance = null;

function getBank(){
    bankInstance = bankInstance || new Bank();
    return bankInstance;
}

function setUp(){
    const userData = {id: localStorage["userID"], name: localStorage["userName"], pass: localStorage["userPass"]};
    const isNew = Boolean(parseInt(localStorage["isNew"]));

    //localStorage.removeItem("userID");
    //localStorage.removeItem("userName");
    //localStorage.removeItem("userPass");
    //localStorage.removeItem("isNew");

    return isNew? 
        // This should've been already created inside login page, but no read/write files here... :'(
        getBank().createNewAcount(userData["name"], userData["id"]) :
        getBank().logIn(userData["id"]);
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

function showBalance(ioBox){

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
