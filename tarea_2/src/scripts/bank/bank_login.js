if(sessionStorage.length === 4){
    window.location.href = "./bank_main.html";
}
else {
    sessionStorage.clear();
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("Test account:");
    console.log("ID: 123456789");
    console.log("Password: DummyPassword");

    let login = document.querySelector(".login");
    let create = document.querySelector(".create");
    let container = document.querySelector(".container");

    const regex = {
        name: "^[a-zA-ZñÑ]{2,}$",
        id: "^[0-9]{6,}$",
        email: "^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z]+)*$",
        phone: "^[0-9]{6,}$",
        pass: "^(?=[^a-zñ]*[a-zñ])(?=[^A-ZÑ]*[A-ZÑ])(?=\D*\d)(?=[^!#%@<>$*+\-_|.&?]*[!#%@<>$*+\-_|.&?])[A-ZÑa-zñ0-9!#%@<>$*+\-_|.&?]{8,32}$"
    };
  
    let signupForm = container.querySelector(".signup");
    let submitRegister = signupForm.querySelector(".submit");

    submitRegister.addEventListener("click", (e) => {
        e.preventDefault();

        const userData = {
            name:     document.getElementById("su_name").value.toString(),
            id:       document.getElementById("su_idcard").value.toString(),
            email:    document.getElementById("su_email").value.toString(),
            phone:    document.getElementById("su_phonenum").value.toString(),
            pass:     document.getElementById("su_password").value.toString(),
            confirm:  document.getElementById("su_passwordconfirm").value.toString()
        };

        if(validateRegistration(userData, regex)){
            container.classList.remove("signupForm");
            container.classList.add("verificationForm");

            verifyEmail(userData, container); // The verification code appears inside the console ;)
            
        }
    });

    
    let signinForm = container.querySelectorAll(".signin")[0];
    let submitLogin = signinForm.querySelector(".submit");

    // Login
    submitLogin.addEventListener("click", (e) => {
        e.preventDefault();

        const data = {
            "id": document.getElementById("si_idcard").value,
            "pass": document.getElementById("si_password").value
        };

        if(validateData(data, "id")){
            if(validateData(data, "pass")){
                data["name"] = getFileData().get(data["id"])["name"];
                redirectUser(data, 0, "main");
            } else {
                document.getElementById("si_password").value = "";
                alert("Your password is incorrect.");
            }
        } else {
            document.getElementById("si_idcard").value = "";
            document.getElementById("si_password").value = "";
            alert("The user does not exists.");
        }
    });


    create.onclick = function(){
        container.classList.add("signupForm");
    }

    login.onclick = function(){
        container.classList.remove("signupForm");
    }
});

function regexTest(value, pattern){ // 
    const regex = new RegExp(pattern);
    return regex.test(value);

}

function validateRegistration(userData, patterns){

    let isValidRegistration = true;

    if(!regexTest(userData["name"], patterns["name"])){
        isValidRegistration = false;
        document.getElementById("su_name").value = ".";
        document.getElementById("su_name").value = "";
        console.log("The name is not a valid name.");
    }

    else if(!regexTest(userData["id"], patterns["id"]) || validateData(userData, "id")){
        isValidRegistration = false;
        document.getElementById("su_idcard").value = ".";
        document.getElementById("su_idcard").value = "";
        console.log("The id is not valid or is already used.");
    }

    else if(!regexTest(userData["email"], patterns["email"]) || validateData(userData, "email")){
        isValidRegistration = false;
        document.getElementById("su_email").value = ".";
        document.getElementById("su_email").value = "";
        console.log("The email is not valid or is already used.");
    }

    else if(!regexTest(userData["phone"], patterns["phone"])){
        isValidRegistration = false;
        document.getElementById("su_phonenum").value = ".";
        document.getElementById("su_phonenum").value = "";
        console.log("The phone number is not valid.");
    }

    else if(!(userData["pass"] === userData["confirm"] || regexTest(userData["pass"], patterns["pass"]))){
        isValidRegistration = false;
        document.getElementById("su_password").value = ".";
        document.getElementById("su_passwordconfirm").value = ".";
        document.getElementById("su_password").value = "";
        document.getElementById("su_passwordconfirm").value = "";

        console.log("The password is invalid or are not equal.");
    }

    return isValidRegistration;

}

function validateData(data, dataType){
    const fileData = getFileData();

    // const specificData = fileData.get(data["id"]);
    let containsData = false;

    if(dataType === "id"){
        return Boolean(fileData.has(data["id"]));

    } else if(dataType === "pass"){
        const result = SecurityManager.hashData(data["pass"]); // Salt missing
        fileData.forEach((user) => {
            if(user[dataType] === result){
                containsData = true;
                return;
            }
        });

    } else {
        fileData.forEach((user) => {
            if(user[dataType] === data[dataType]){
                containsData = true;
                return;
            }
        });
    }

    return containsData;
}

function createUser(userData){

    let dataToStore = userData;
    delete dataToStore["confirm"];
    dataToStore["pass"] = SecurityManager.hashData(dataToStore["pass"]);

    externalUserData.set(userData["id"], dataToStore);
    console.log("User created.");
}

function getFileData(){
    //let fileSystem = new FileSystem();

    const filePath = "../../../resources/files/bank_data/test.txt";
    let fileData;

    //const fs = require("fs"); // Idk man, my brain hurts...
 
    //fs.readFile(filePath, "utf-8", (err, data) => {
    //    if (err) throw err;

    //    fileData = data;
    //    console.log(data);
    //});
    
    fileData = externalUserData

    return fileData;
}

function verifyEmail(userData, docBody){ // The verification code appears inside the console ;)
    let verificationCode = Math.round(Math.random() * 1_000_000);
    let userCode = 0;
    
    verificationCode -= verificationCode === 1_000_000? 1 : 0;
    console.log("Your verification code:");
    console.log(verificationCode);

    let verificationForm = docBody.querySelector(".emailverification");
    let submitVerification = verificationForm.querySelector(".submit");

    submitVerification.addEventListener("click", (e) => {
        e.preventDefault();

        userCode = document.getElementById("ev_code").value;

        if(verificationCode == userCode){
            createUser(userData);

            console.log("Change when possible to only id");
            redirectUser(userData, 1, "main");
        }
    });
}

function redirectUser(user, isNew, destinationPage){
    sessionStorage.setItem("userID", [user["id"]]);
    sessionStorage.setItem("userName", [user["name"]]);
    sessionStorage.setItem("userPass", [user["pass"]]);
    sessionStorage.setItem("isNew", isNew.toString());
    window.location.href = "./bank_" + destinationPage + ".html";
}


