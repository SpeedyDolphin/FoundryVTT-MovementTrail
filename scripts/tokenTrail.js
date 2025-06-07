
import { renderCombatantTrail} from "./render.js";

let combatants = {};
let untrackedCombatants = {}; // This will hold combatants that are not currently in the combat tracker but have moved. Resets at top of the round.

//This function adds a new token to the tracker or clears data from the previous round
export function registerCombatant(tokenId, actorId, round) {
    //Sets the combatant's initial position on it's turn. Does not update if moving backwards in the turn tracker 
    if (combatants[tokenId].round < round) {
        
        combatants[tokenId] = {
            "init_coordinate" : getInitCoordinate(tokenId),
            'actorId': actorId,
            'total_moved': 0, 
            'trail':[getInitCoordinate(tokenId)],
            'round': round
        } 
    }
}
function offTurn_registerCombatant(tokenId) {
    if(isCombatantInCombatTracker(tokenId)){
        // If the token is in the combat tracker, we register it normally
        registerCombatant(tokenId, canvas.tokens.get(tokenId).actor.id, game.combat.round); 
    }
    else{
        untrackedCombatants[tokenId] = {
            "init_coordinate" : getInitCoordinate(tokenId),
            'actorId': canvas.tokens.get(tokenId).actor.id,
            'total_moved': 0, 
            'trail':[getInitCoordinate(tokenId)],
            'round': game.combat.round
        } 
    }
}
function isCombatantInCombatTracker(tokenId) {
    // Check if the token is in the combat tracker
    return game.combat.combatants.some(c => c.token.id === tokenId);
}


export async function updateTrail(tokenId, changes, userId, rulerMovement = false) {
    //check if the token is being tracked add it if not
    //TODO clear the data from the previous round at top of the round if the token is not in the combat tracker
    if (combatants[tokenId] === undefined){
        offTurn_registerCombatant(tokenId)
    } 

    const movementData = getMovementData(changes, tokenId);
    if (rulerMovement){
        // If the movement is from a ruler we process it differently
        //TODO: Implement ruler movement logic
        console.log("Ruler Movement Detected");
        return;
    }
    else if (movementData.distance !== canvas.scene.grid.distance){
        // This means that the token is not moving to an adjacent square, so we ignore the movement
        return
    }
    
    combatants[tokenId].trail.push(movementData);
    combatants[tokenId].total_moved += movementData.cost; 

     
    backtracking(combatant);
    mergeDiagonals(combatant, movementData, movement);

        
    console.log(`Token moved to: ${JSON.stringify(movementData)}`);
    console.log(`Total movement used: ${combatant.total_moved}`)
    console.log(combatants);
      
    //render
    renderCombatantTrail(combatant.actor.id, combatant.trail, userId); 

}
export function showTrail(tokenId){
    renderCombatantTrail(tokenId, combatants[tokenId].trail, game.user.id);
}
function getMovementData(changes, tokenId){
    const token = canvas.tokens.get(tokenId);
    //get the new (x,y) coordinates. Falls back on the token's position given that 'changes' may not include both x and y.
    const x = changes.x ?? token.x;
    const y = changes.y ?? token.y; 
    const movement = canvas.grid.measurePath([combatants[tokenId].trail.at(-1)?.pixel, { x, y }], { gridSpaces: true });
          
    return {
        'pixel': { 'x': x, 'y': y },
        'grid': pointToGrid(x, y),
        'distance': movement.distance, 
        'cost': movement.cost,
        'diagonal': movement.diagonals > 0  
    };
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
function mergeDiagonals(combatant, newCoordinate, movement){
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

function getInitCoordinate(tokenId) {
  const token = canvas.tokens.get(tokenId);
  return {
    'pixel': { 'x': token.x, 'y': token.y },
    'grid': pointToGrid(token.x, token.y),
    'distance': 0,
    'diagonal': false
  };
}
