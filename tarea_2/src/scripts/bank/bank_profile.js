document.addEventListener("DOMContentLoaded", function(){
    let backButton = document.getElementById("pb_back");
    backButton.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "./bank_main.html";
    });
});