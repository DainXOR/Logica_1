$(window).click(function(e) {

    if(!$(e.target).hasClass('card'))
        return;

    if( $(e.target).hasClass('active')){
        $(e.target).removeClass('active');
        return;
    }

    const activeCard = document.getElementsByClassName('active');
    $(activeCard[0]).removeClass('active');
    $(e.target).addClass('active');

});