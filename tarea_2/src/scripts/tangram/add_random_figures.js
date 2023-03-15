document.addEventListener('DOMContentLoaded', function() {
  function createFigure(figuresBox, figureTypes) {

    const randNum = getRandomNumber(0, 5);
    const figureSelected = figureTypes[randNum];

    // Create a new figure element
    var figure = document.createElement("div");
    figure.classList.add("figure", figureSelected);

    // Set random color
    var color = getRandomColor();
    figuresBox.appendChild(figure);
    figure.style.borderBottomColor = color;
    //figure.style.backdropFilter("blur(5px)");

    switch (figureSelected) {
      case "triangle":{
        switch(getRandomNumber(0, 3)){
          case 0:{
            figure.style.transform = "rotate(90deg)";
            break;
          }
          case 1:{
            figure.style.transform = "rotate(180deg)";
            break;
          }
          case 2:{
            figure.style.transform = "rotate(270deg)";
            break;
          }
          default:
            break;

        }
        break;
      }
      case "trapezoid":{
        figure.style.backgroundColor = color;

        figure.style.width = 120 + "px";
        figure.style.height = 80 + "px";
        break;
      }
      case "rectangle":{
        figure.style.backgroundColor = color;
        figure.style.width = 80 + "px";
        figure.style.height = 120 + "px";

        if (getRandomNumber(0, 1) === 0) {
          figure.style.transform = "rotate(90deg)";
        }
        break;
      }
      case "square":{
        figure.style.backgroundColor = color;
        figure.style.width = 80 + "px";
        figure.style.height = 80 + "px";
        break;
      }
      case "romboid":{
        figure.style.backgroundColor = color;
        figure.style.width = 80 + "px";
        figure.style.height = 80 + "px";
        figure.style.transform = "rotate(45deg)";
        break;
      }
      default:
        break;
    }

    // Get the coordinates of the figures-box
    var boxCoords = figuresBox.getBoundingClientRect();
    const margin = 20;

    // Set random position within the box
    var overlap = true;
    while (overlap) {
      var posX = getRandomNumber(boxCoords.left + margin, (boxCoords.right - margin) - figure.offsetWidth);
      var posY = getRandomNumber(boxCoords.top + margin, (boxCoords.bottom - margin) - figure.offsetHeight);
      overlap = false;

      // Check if new figure overlaps with any existing figures
      var figures = document.querySelectorAll('.figure');
      for (let i = 0, len = figures.length; i < len; i++) {
        let existingFigure = figures[i];
        let existingBox = existingFigure.getBoundingClientRect();
      
        if (posX < existingBox.right && posX + figure.offsetWidth > existingBox.left &&
          posY < existingBox.bottom && posY + figure.offsetHeight > existingBox.top) {
          overlap = true;
          break;
        }
      }
    }

    figure.style.left = posX + "px";
    figure.style.top = posY + "px";
  }


  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    color += "A7"; // Opacity 
    return color;
  }

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const figureTypes = ["triangle", "square", "rectangle", "triangle", "trapezoid", "romboid"];
  const figuresBox = document.getElementById('figures-box');

  // Create 10 figures
  for (var i = 0; i < 15; i++) {
    createFigure(figuresBox, figureTypes);
  }
});
  