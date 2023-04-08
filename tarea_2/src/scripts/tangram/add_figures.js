/*
document.addEventListener('DOMContentLoaded', function() {

    function createFigure(figuresBox, figureType) {
        // Create a new figure element
        var figure = document.createElement("div");
        figure.classList.add("figure");
        figure.classList.add(figureType);
      
        // Set random color
        var color = getRandomColor();
        figuresBox.appendChild(figure);
        figure.style.borderBottomColor = color;

        if (figure.classList.contains("rectangle")) {
            figure.style.backgroundColor = color;
            figure.style.width = getRandomNumber(50, 200) + "px";
            figure.style.height = getRandomNumber(50, 200) + "px";

        } else if (figure.classList.contains("square")) {
            figure.style.borderTopWidth = "50px";
            figure.style.borderRightWidth = "50px";
            figure.style.borderBottomWidth = "50px";
            figure.style.borderLeftWidth = "50px";
            figure.style.transform = "rotate(45deg)";
            figure.style.backgroundColor = color;

        } else if (figure.classList.contains("triangle-small-upside-down")) {
            figure.style.borderBottomWidth = "20px";
            figure.style.borderLeftWidth = "20px";
            figure.style.borderRightWidth = "20px";
            figure.style.transform = "rotate(180deg)";
            figure.style.backgroundColor = color;
        } else if (figure.classList.contains("triangle-big-upside-down")) {
            figure.style.borderBottomWidth = "100px";
            figure.style.borderLeftWidth = "100px";
            figure.style.borderRightWidth = "100px";
            figure.style.transform = "rotate(180deg)";
            figure.style.backgroundColor = color;
        } else if (figure.classList.contains("square-small-45deg-right")) {
            figure.style.borderTopWidth = "20px";
            figure.style.borderRightWidth = "20px";
            figure.style.borderBottomWidth = "20px";
            figure.style.borderLeftWidth = "20px";
            figure.style.transform = "rotate(45deg)";
            figure.style.backgroundColor = color;
        } else if (figure.classList.contains("triangle-small-67.5deg")) {
            figure.style.borderBottomWidth = "50px";
            figure.style.borderLeftWidth = "25px";
            figure.style.borderRightWidth = "25px";
            figure.style.transform = "rotate(67.5deg)";
            figure.style.backgroundColor = color;
        } else if (figure.classList.contains("trapezoid")) {
            figure.style.borderTopWidth = "60px";
            figure.style.borderBottomWidth = "20px";
            figure.style.borderLeftWidth = "40px";
            figure.style.borderRightWidth = "40px";
            figure.style.backgroundColor = color;
        }
      
        // Get the coordinates of the figures-box
        var boxCoords = figuresBox.getBoundingClientRect();
      
        // Set random position within the box
        var overlap = true;
        while (overlap) {
            var posX = getRandomNumber(boxCoords.left, boxCoords.right - figure.offsetWidth);
            var posY = getRandomNumber(boxCoords.top, boxCoords.bottom - figure.offsetHeight);
            overlap = false;
          
            // Check if new figure overlaps with any existing figures
            var figures = document.querySelectorAll('.figure');
            for (var i = 0; i < figures.length; i++) {
              var existingFigure = figures[i];
              var existingBox = existingFigure.getBoundingClientRect();
              if (posX < existingBox.right && posX + figure.offsetWidth > existingBox.left &&
                  posY < existingBox.bottom && posY + figure.offsetHeight > existingBox.top) {
                overlap = true;
                break;
              }
            }
        }
          
          // Set random size for each figure type
        switch (figureType) {
            case "triangle":
              var size = getRandomNumber(50, 200);
              figure.style.width = "0px";
              figure.style.height = "0px";
              figure.style.borderLeftWidth = size + "px";
              figure.style.borderRightWidth = size + "px";
              figure.style.borderBottomWidth = size + "px";
              break;
            case "square":
              var size = getRandomNumber(50, 200);
              figure.style.width = size + "px";
              figure.style.height = size + "px";
              break;
            case "rectangle":
              var width = getRandomNumber(50, 200);
              var height = getRandomNumber(50, 200);
              figure.style.width = width + "px";
              figure.style.height = height + "px";
              break;
            case "rotated-square":
              var size = getRandomNumber(50, 200);
              figure.style.width = size + "px";
              figure.style.height = size + "px";
              figure.style.transform = "rotate(45deg)";
              break;
            case "upside-down-triangle":
              var size = getRandomNumber(50, 200);
              figure.style.width = "0px";
              figure.style.height = "0px";
              figure.style.borderLeftWidth = size + "px";
              figure.style.borderRightWidth = size + "px";
              figure.style.borderTopWidth = size + "px";
              figure.style.transform = "rotate(180deg)";
              break;
            case "big-triangle":
              var size = getRandomNumber(200, 300);
              figure.style.width = "0px";
              figure.style.height = "0px";
              figure.style.borderLeftWidth = size + "px";
              figure.style.borderRightWidth = size + "px";
              figure.style.borderBottomWidth = size + "px";
              break;
            case "small-right-rotated-triangle":
              var size = getRandomNumber(50, 100);
              figure.style.width = "0px";
              figure.style.height = "0px";
              figure.style.borderLeftWidth = size + "px";
              figure.style.borderBottomWidth = size + "px";
              figure.style.transform = "rotate(45deg)";
              break;
            case "small-67.5deg-rotated-triangle":
              var size = getRandomNumber(50, 100);
              figure.style.width = "0px";
              figure.style.height = "0px";
              figure.style.borderLeftWidth = size + "px";
              figure.style.borderBottomWidth = size + "px";
              figure.style.transform = "rotate(67.5deg)";
              break;
            case "trapezoid":
              var width = 100;
              var height = 150;
              var skew = 50;
              figure.style.width = width + "px";
              figure.style.height = height + "px";
              figure.style.borderBottom = "none";
              figure.style.borderLeft = skew + "px solid transparent";
              figure.style.borderRight = (width - skew) + "px solid transparent";
              figure.style.borderTop = height + "px solid " + color;
              figure.style.transform = "rotate(-45deg)";
              break;
        }
    }

    // const figuresBox = document.getElementById('figures-box');

    // createFigure(figuresBox, "triangle");
    // createFigure(figuresBox, "square");
    // createFigure(figuresBox, "triangle");
    // createFigure(figuresBox, "triangle");
    // createFigure(figuresBox, "square");
    // createFigure(figuresBox, "triangle");
    // createFigure(figuresBox, "rectangle");

});

*/