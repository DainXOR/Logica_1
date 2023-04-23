function createFigure(figuresBox, figureTypes) {

    const randNum = getRandomNumber(0, 5);
    const figureSelected = figureTypes[randNum];
    const figureBase = getFigureBase(figureSelected);

    // Create a new figure element
    let figureElement = document.createElement("div");
    figureElement.classList.add("figure", figureSelected);

    let figure = eval(`new ${figureBase}(figureSelected)`);
    figure.HTML = figureElement;
    figure.setFillingColor(getRandomColor());

    figuresBox.appendChild(figure.HTML);
    //figure.style.backdropFilter("blur(5px)");

    switch (figureSelected) {
      case "triangle":{
        figure.style.width = 80 + "px";
        figure.style.height = 80 + "px";

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
        if (getRandomNumber(0, 1) === 1) {
          figure.style.width = 120 + "px";
          figure.style.height = 80 + "px";
        }
        else {
          figure.style.width = 80 + "px";
          figure.style.height = 120 + "px";
        }
        
        break;
      }
      case "rectangle":{
        figure.style.width = 80 + "px";
        figure.style.height = 120 + "px";

        if (getRandomNumber(0, 1) === 0) {
          figure.style.transform = "rotate(90deg)";
        }
        break;
      }
      case "romboid":{
        figure.style.transform = "rotate(45deg)";
      }
      case "square":{
        figure.style.width = 80 + "px";
        figure.style.height = 80 + "px";
        break;
      }
      
      default:
        break;
    }

    // Get the coordinates of the figures-box
    undoOverlaps(figure, figuresBox);
    return figure;
}

function getRandomColor() {
  let letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  color += "A7"; // Opacity 
  return color;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getFigureBase(name){
  switch (name) {
    case "triangle":{
      return "Triangle";
    }

    case "rectangle":
    case "square":
    case "trapezoid":
    case "romboid":{
      return "Square";
    }

    case "pentagon":
    case "hexagon":
    case "heptagon":
    case "octagon":
  
    default:
      return "Figure";
  }
}

function undoOverlaps(figure, figuresContainer) {
  let boxCoords = figuresContainer.getBoundingClientRect();
  const margin = 20;

  // Set random position within the box
  let overlap = true;
  let posX;
  let posY;

  while (overlap) {
    posX = getRandomNumber(boxCoords.left + margin, (boxCoords.right - margin) - figure.HTML.offsetWidth);
    posY = getRandomNumber(boxCoords.top + margin, (boxCoords.bottom - margin) - figure.HTML.offsetHeight);
    overlap = false;

    // Check if new figure overlaps with any existing figures
    let figures = document.querySelectorAll('.figure');
    for (let i = 0, len = figures.length; i < len; i++) {
      let existingFigure = figures[i];
      let existingBox = existingFigure.getBoundingClientRect();

      if (posX < existingBox.right && posX + figure.HTML.offsetWidth > existingBox.left &&
        posY < existingBox.bottom && posY + figure.HTML.offsetHeight > existingBox.top) {
        overlap = true;
        break;
      }
    }
  }

  figure.style.left = posX + "px";
  figure.style.top = posY + "px";
}

const unviasedFigureList = ["triangle", "square", "rectangle", "trapezoid", "romboid"];
const triangleViasedFigureList = ["triangle", "square", "rectangle", "triangle", "trapezoid", "romboid"];

function generateFigures(amount, containerID = 'figures-box', posibleFiguresList = triangleViasedFigureList){
  
  const figuresBox = document.getElementById(containerID);
  let figuresArray = [];
  
  // Create 10 figures
  for (let i = 0; i < amount; i++) {
    figuresArray.push(createFigure(figuresBox, posibleFiguresList));
  }

  return figuresArray;
}