document.addEventListener('DOMContentLoaded', function() {
    
  //const triangle = document.querySelector('.figure');
  const figures = document.getElementsByClassName('figure');

  for(var i = 0; i < figures.length; i++) {

    const figure = figures[i];

    // Define variables to store the position of the mouse and the triangle
    let mouseX = 0;
    let mouseY = 0;
    let triangleX = 0;
    let triangleY = 0;
    let isAPressed = false;
    let isDPressed = false;

    // Add a mousedown event listener to the triangle
    figure.addEventListener('mousedown', (event) => {
      $(figure).addClass("grabbing");

      figure.style.zIndex = 100;

      // Get the current position of the mouse and the triangle
      mouseX = event.clientX;
      mouseY = event.clientY;
      triangleX = parseInt(figure.style.left.replace("px", "")); // figureRect.left;
      triangleY = parseInt(figure.style.top.replace("px", "")); // figureRect.top;

      // Add a mousemove event listener to the document
      document.addEventListener('mousemove', handleMouseMove);
    });

    // Define a function to handle the mousemove event
    function handleMouseMove(event) {

      // Get the new position of the mouse
      const newMouseX = event.clientX;
      const newMouseY = event.clientY;
    
      // Calculate the distance the triangle should be moved
      const deltaX = newMouseX - mouseX;
      const deltaY = newMouseY - mouseY;
    
      console.log(figure);
      console.log("Delta X: " + deltaX);
      console.log("Delta Y: " + deltaY);
      console.log("\n");

      // Update the position of the triangle
      figure.style.left = triangleX + deltaX + 'px';
      figure.style.top = triangleY + deltaY + 'px';
    }
    

    // Add a mouseup event listener to the document
    document.addEventListener('mouseup', () => {

      // Remove the mousemove event listener
      $(figure).removeClass("grabbing");
      figure.style.zIndex = 1;
      document.removeEventListener('mousemove', handleMouseMove);
    });

    // Add keydown event listener to the document
    document.addEventListener('keydown', (event) => {

      if(!$(figure).hasClass("grabbing")){
        return;
      }

      // Update the rotation of the figure
      const currentTransform = figure.style.transform;

      if (event.key === 'a' || event.key === 'A') {
        const newTransform = currentTransform.replace(/rotate\([^\)]*\)/, '');

        const currentRotation = currentTransform ? currentTransform.match(/rotate\(([-]?\d+)deg\)/) : null;
        const actualRotation = currentRotation ? parseInt(currentRotation[1]) : 0;

        figure.style.transform = newTransform + `rotate(${actualRotation - 15}deg)`;

      } if (event.key === 'd' || event.key === 'D') {
        const newTransform = currentTransform.replace(/rotate\([^\)]*\)/, '');

        const currentRotation = currentTransform ? currentTransform.match(/rotate\(([-]?\d+)deg\)/) : null;
        const actualRotation = currentRotation ? parseInt(currentRotation[1]) : 0;

        figure.style.transform = newTransform + `rotate(${actualRotation + 15}deg)`;

      }

      if(event.key === 'w' ||event.key === 'W'){
        figure.style.transform = currentTransform + `scale(1.1)`;

      } if(event.key === 's' ||event.key === 'S'){
        figure.style.transform = currentTransform + `scale(0.9)`;

      }

      if(event.key === 'x' ){
        figure.style.transform = currentTransform + `scaleX(0.9)`;
      } else if(event.key === 'X'){
        figure.style.transform = currentTransform + `scaleX(1.1)`;
      } 
      
      if(event.key === 'z'){
        figure.style.transform = currentTransform + `scaleY(0.9)`;
      } else if(event.key === 'Z'){
        figure.style.transform = currentTransform + `scaleY(1.1)`;
      }

      if(event.key == 'r' || event.key == 'R'){
        figure.style.transform = currentTransform + `scaleX(-1)`;

      } if(event.key == 'f' || event.key == 'F'){
        figure.style.transform = currentTransform + `scaleY(-1)`;
      }

    });
  };
});
