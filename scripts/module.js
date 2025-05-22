Hooks.once('init', async function() {

});

Hooks.once('ready', async function() {

});

//const token = canvas.tokens.controlled[0];
let combatents = {};
const container = new PIXI.Container();
let containerId = 0
const layer = canvas.layers.find((l) => l.options?.name === "grid");
layer.addChild(container)

Hooks.on("updateToken", async (token, changes, options, userId) => {
  try {
    //TODO
    // if the token is not being tracked, add it to the tracker 

    // Check if position changed
    if ("x" in changes || "y" in changes) {
      const x = changes.x ?? token.x;
      const y = changes.y ?? token.y; 
      const combatent = combatents[token.actor.id];
      
      // note: falling back on init_coordinate may be a bit reduntant.  
      let movement = canvas.grid.measurePath(
          [combatent.trail.at(-1)?.pixel ?? combatent.init_coordinate.pixel, { x, y }], 
          { gridSpaces: true });
          
      const newCoordinate = {
        'pixel': { 'x': x, 'y': y },
        'grid': pointToGrid(x, y),
        'distance': movement.distance, 
        'diagonal': movement.diagonals > 0  
      };
      
      //backtracking
      if(combatent.trail.length >= 2){
          //Standard backtracking
          console.log("Backtacking Check")
          console.log(combatent.trail.at(-2).grid);
          console.log(newCoordinate.grid)
          if (combatent.trail.at(-2).grid.x === newCoordinate.grid.x && combatent.trail.at(-2).grid.y === newCoordinate.grid.y)
          {
              let discarded = combatent.trail.pop();
              combatent.total_moved -= discarded.distance;
              discarded = combatent.trail.pop();
              combatent.total_moved -= discarded.distance;
          }
          //Backtracking diagonals 
          else if(combatent.trail.at(-1).diagonal && isAdjacent(combatent.trail.at(-2), newCoordinate))
          {
              let discarded = combatent.trail.pop();
              combatent.total_moved -= discarded.distance;
          }
      }
          
      // check to see if the movement is eligable for merging due to diagonals ex  ⇑⇒ -> ⇗
      if (combatent.trail.at(-2)?.pixel != undefined){
          let diagonalCheck = canvas.grid.measurePath(
              [combatent.trail.at(-2)?.pixel ?? combatent.init_coordinate.pixel, { x, y }], 
              { gridSpaces: true });
              
          if(diagonalCheck.diagonals > 0 && diagonalCheck.cost == movement.cost && !combatent.trail.at(-1).diagonal){
              let discarded = combatent.trail.pop();
              combatent.total_moved -= discarded.distance;
              newCoordinate.diagonal = true;  
          }
      }

      combatent.trail.push(newCoordinate);
      combatent.total_moved += movement.distance; 

      console.log(`Token moved to: ${JSON.stringify(newCoordinate)}`);
      console.log(`Total movement used: ${combatent.total_moved}`)
      console.log(combatents);
      
      //render
      container.removeChildren();
      drawTrail(combatent.trail);
      containerId += 1;
      const currContainer = containerId;  
      
      await new Promise(resolve => setTimeout(resolve, 3000));
            if (currContainer == containerId){
          container.removeChildren();
      }
    }
  } catch (err) {
    console.log("An error occurred in the macro Athena's Marco Shenagigans")
    throw err 
  }
});


Hooks.on("updateCombat", async (combat, changed) => {
    const actor = combat.combatant.actor;
    const token = canvas.tokens.placeables.find(t => t.actor?.id === actor._id);
    
    //set position at start of the round
    console.log(`${actor._id}'s Position (${token.x},${token.y})`);
    const init_coordinate = {
            'pixel': {'x': token.x,'y': token.y},
            'grid' : pointToGrid(token.x, token.y),
            'distance': 0, 
            'diagonal': false
         }
    
    combatents[actor._id] = {
        "init_coordinate" : init_coordinate,
        'total_moved': 0, 
        'trail':[init_coordinate]
   }
});

function drawTrail(trail){
    distance = 0
    for (let i = 0; i < trail.length; i++){
        distance += trail[i].distance ?? 0;
        distance= Math.round(distance)
        drawSquare(trail[i].pixel.x, trail[i].pixel.y, 0x03e2c8, String(distance), container) 
     }
     console.log(`Total distance ${distance}`);
}
//x, y should be the coorindates for the top left corner 
function drawSquare(x, y, color, number, container){
    const gridSize = canvas.grid.size
    
    //Draw Square
    const square = new PIXI.Graphics();
    square.beginFill(color, .5);
    square.drawRoundedRect(0, 0, gridSize - gridSize*.06, gridSize - gridSize*.06, gridSize*.15); // Position and size
    square.endFill();
    
    //Position and mount square
    square.x = x + gridSize*.03; 
    square.y = y + gridSize*.03;
    container.addChild(square);
    
    // Add lable 
    if (number){
        //Make Text
        const text = new PIXI.Text(number, {
          fontFamily: "Brush Script MT",
          fontSize: 24,
          fill: 0xffffff,      // White text
          align: "center"
        });
        
        //Position and mount text
        text.x = x + gridSize / 2;
        text.y = y + gridSize / 2;
        text.anchor.set(0.5)
        container.addChild(text);
    }
    
}

// Helper fuctions
function pointToGrid(x_pixel, y_pixel) {
  const gridSize = canvas.grid.size;
  const x = Math.floor(x_pixel / gridSize);
  const y = Math.floor(y_pixel / gridSize);
  return { x, y };
}

function isAdjacent(coordA, coordB) {
  const dx = Math.abs(coordA.grid.x - coordB.grid.x);
  const dy = Math.abs(coordA.grid.y - coordB.grid.y);

  // Adjacent means within 1 square in any direction (including diagonals),
  // but not the same square.
  return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
}