
import { renderCombatantTrail} from "./render";

export let combatants = {}; //TODO FIX so it does not need to be global

//This function adds a new token to the tracker or clears data from the previous round
export function registerCombatant(token, actorId) {
    //set position at start of the round
    console.log(`${actorId}'s Position (${token.x},${token.y})`);
    const init_coordinate = {
            'pixel': {'x': token.x,'y': token.y},
            'grid' : pointToGrid(token.x, token.y),
            'distance': 0, 
            'diagonal': false
         }
    
    combatants[actorId] = {
        "init_coordinate" : init_coordinate,
        'total_moved': 0, 
        'trail':[init_coordinate]
   }
}

export async function updateTrail(combatant, newCoordinate, userId){
    //check if the token is being tracked add it if not
    //TODO clear the data from the previous round at top of the round if the token is not in the combat tracker
    //if (combatants[combatant.actor.id] == undefined){
    //    registerCombatant(combatant, combatant.actor.id);
    //}
    
    if(combatant.trail.length >= 2){
        backtracking(combatant, newCoordinate);
        mergeDiagonals(combatant, newCoordinate);
    }
          
      combatant.trail.push(newCoordinate);
      combatant.total_moved += movement.distance; 

      console.log(`Token moved to: ${JSON.stringify(newCoordinate)}`);
      console.log(`Total movement used: ${combatant.total_moved}`)
      console.log(combatants);
      
      //render
      renderCombatantTrail(combatant.actor.id, combatant.trail, userId);      
}

function backtracking(combatant, newCoordinate){
    //Standard backtracking
    console.log("Backtracking Check")
    console.log(combatant.trail.at(-2).grid);
    console.log(newCoordinate.grid)
    if (combatant.trail.at(-2).grid.x === newCoordinate.grid.x && combatant.trail.at(-2).grid.y === newCoordinate.grid.y)
    {
        let discarded = combatant.trail.pop();
        combatant.total_moved -= discarded.distance;
        discarded = combatant.trail.pop();
        combatant.total_moved -= discarded.distance;
    }
    //Backtracking diagonals 
    else if(combatant.trail.at(-1).diagonal && isAdjacent(combatant.trail.at(-2), newCoordinate))
    {
        let discarded = combatant.trail.pop();
        combatant.total_moved -= discarded.distance;
    }
}

// check to see if the movement is eligible for merging due to diagonals ex  ⇑⇒ -> ⇗
function mergeDiagonals(combatant, newCoordinate){
    let diagonalCheck = canvas.grid.measurePath(
            [combatant.trail.at(-2)?.pixel ?? combatant.init_coordinate.pixel, { x, y }], 
            { gridSpaces: true });
            
    if(diagonalCheck.diagonals > 0 && diagonalCheck.cost == movement.cost && !combatant.trail.at(-1).diagonal){
        let discarded = combatant.trail.pop();
        combatant.total_moved -= discarded.distance;
        newCoordinate.diagonal = true;  
    }
}

// Helper functions
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