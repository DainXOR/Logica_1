document.addEventListener('DOMContentLoaded', function() {
    let cards = document.querySelectorAll(".card");

    console.log(cards);
    
    for(let i = --cards.length; i >= 0; i--){
        cards[i].addEventListener("click", (e) => {
            e.preventDefault();
            
            if(cards[i].classList.contains("activeCard")){
                cards[i].classList.remove("activeCard");
                return;
            }
            
            let activeCards = document.querySelectorAll('.activeCard');
            for(let i = --activeCards.length; i >= 0; i--){
                activeCards[i].classList.remove("activeCard");
            }
            
            cards[i].classList.add("activeCard");
            
        });
    }
});

/*
$(window).click(function(e) {

    if(!$(e.target).hasClass('card'))
        return;

    if( $(e.target).hasClass('activeCard')){
        $(e.target).removeClass('activeCard');
        return;
    }

    const activeCardCard = document.getElementsByClassName('activeCard');
    $(activeCardCard[0]).removeClass('activeCard');
    $(e.target).addClass('activeCard');

});
*/