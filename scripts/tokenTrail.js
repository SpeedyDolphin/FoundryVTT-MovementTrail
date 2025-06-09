
import { renderCombatantTrail} from "./render.js";

let combatants = {};
let untrackedCombatants = new Set(); // This will hold the ids of combatants that are not currently in the combat tracker but have moved. Resets at top of the round.

//This function adds a new token to the tracker or clears data from the previous round
export function registerCombatant(tokenId, actorId, round) {
    //Sets the combatant's initial position on it's turn. Does not update if moving backwards in the turn tracker 
    if (combatants[tokenId] === undefined || combatants[tokenId].round < round) {
        
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
    console.log(`Registering off-turn combatant: ${tokenId}`);
    registerCombatant(tokenId, canvas.tokens.get(tokenId).actor.id, game.combat.round); 

    if(!isCombatantInCombatTracker(tokenId)){
        // If the token is in the combat tracker, we register it normally
        untrackedCombatants.add(tokenId);
    }
}
function isCombatantInCombatTracker(tokenId) {
    // Check if the token is in the combat tracker
    return game.combat.combatants.some(c => c.token.id === tokenId);
}

export async function updateTrail(tokenId, changes, userId) {
    //check if the token is being tracked add it if not
    if (combatants[tokenId] === undefined){
        offTurn_registerCombatant(tokenId)
    } 

    const movementData = getMovementData(changes, tokenId);
    
    if (movementData.distance !== canvas.scene.grid.distance){
        // This means that the token is not moving to an adjacent square, so we ignore the movement
        combatants[tokenId].trail.push(movementData);
        combatants[tokenId].trail.at(-1).cost = 0; // Set the cost to 0 for non-adjacent movements
        backtracking(tokenId);
        return
    }
    
    combatants[tokenId].trail.push(movementData);
    combatants[tokenId].total_moved += movementData.cost; 

     
    backtracking(tokenId); 
    mergeDiagonals(tokenId);

    console.log(combatants);
      
    //render
    renderCombatantTrail(tokenId, combatants[tokenId].trail, userId); 

}

//Segments: ['Ray':{"A":{'x':num, 'y':num}, B:{'x':num, 'y':num}}, teleport: boolean]
export function rulerUpdateTrail(tokenId, segments, userId) {
    if (combatants[tokenId] === undefined){
        offTurn_registerCombatant(tokenId)
    }
}

export function showTrail(tokenId){
    if (combatants[tokenId] === undefined) {
        return;
    }
    renderCombatantTrail(tokenId, combatants[tokenId].trail, game.user.id);
}
function getMovementData(changes, tokenId){
    const token = canvas.tokens.get(tokenId);
    //get the new (x,y) coordinates. Falls back on the token's position given that 'changes' may not include both x and y.
    const x = changes.x ?? token.x;
    const y = changes.y ?? token.y; 
    const movement = canvas.grid.measurePath([combatants[tokenId].trail.at(-1)?.pixel, { x, y }], { gridSpaces: true });
          
    return {
        'pixel': snapToCorner(x, y),
        'grid': pointToGrid(x, y),
        'distance': movement.distance, 
        'cost': movement.cost,
        'diagonal': movement.diagonals > 0  
    };
}

function backtracking(combatantId){
    const combatant = combatants[combatantId];
    //Simple backtracking
    if(combatant.trail.length >=3 && isSameCoordinate(combatant.trail.at(-3), combatant.trail.at(-1))) {
        let discarded = combatant.trail.pop();
        combatant.total_moved -= discarded.cost;
        discarded = combatant.trail.pop();
        combatant.total_moved -= discarded.cost;
    }
}
function mergeDiagonals(combatantId){
    const combatant = combatants[combatantId];
    while(combatants[combatantId].trail.length >= 3 && isAdjacent(combatant.trail.at(-1), combatant.trail.at(-3))){
        combatant.total_moved  -= combatant.trail.at(-2).cost; // Remove the cost of the middle point
        combatant.trail.splice(-2, 1); // Remove the middle point
        
        //NOTE: This diagonal field may be removed in the future, as it is not used in the current implementation.
        if(isDiagonal(combatant.trail.at(-1), combatant.trail.at(-2))){
            combatant.trail.at(-1).diagonal = true; // Mark the last point as diagonal
        }
        else {
            combatant.trail.at(-1).diagonal = false; // Mark the last point as not diagonal
        }
    }
}
export function resetUntracked() {
    untrackedCombatants.forEach((tokenId) => {
        if (isCombatantInCombatTracker(tokenId)){
            untrackedCombatants.delete(tokenId);
        }
        else{
            registerCombatant(tokenId, canvas.tokens.get(tokenId).actor.id, game.combat.round);
        }
    });
}
//Save data
export async function saveData(){
    if (game.user.isGM === true) {
        await game.scenes.active.setFlag("athenas-movement-trail", "movementTrailData", {
            combatants: combatants,
            untrackedCombatants: Array.from(untrackedCombatants)
        });
    }
}
export async function loadData() {
    const data = await game.scenes.active.getFlag("athenas-movement-trail", "movementTrailData");
    if (data) {
        combatants = data.combatants;
        untrackedCombatants = new Set(data.untrackedCombatants);
    } else
    {
        // This initializes if we are switching scenes
        combatants = {};
        untrackedCombatants.clear();
    }
}
export async function clearData() {
    combatants = {};
    untrackedCombatants.clear();
    if (game.user.isGM === true) {
        await game.scenes.active.unsetFlag("athenas-movement-trail", "movementTrailData");
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
  console.log(coordA)
  console.log(coordB)  
  const dx = Math.abs(coordA.grid.x - coordB.grid.x);
  const dy = Math.abs(coordA.grid.y - coordB.grid.y);

  // Adjacent means within 1 square in any direction (including diagonals),
  // but not the same square.
  return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
}
function isDiagonal(coordA, coordB) {
  const dx = Math.abs(coordA.grid.x - coordB.grid.x);
  const dy = Math.abs(coordA.grid.y - coordB.grid.y);

  // Diagonal means exactly one square away in both x and y directions.
  return (dx === 1 && dy === 1);
}

function getInitCoordinate(tokenId) {
  const token = canvas.tokens.get(tokenId);
  return {
    'pixel': snapToCorner(token.x, token.y),
    'grid': pointToGrid(token.x, token.y),
    'distance': 0,
    'cost': 0,
    'diagonal': false
  };
}
function isSameCoordinate(coordA, coordB) {
    return coordA.grid.x === coordB.grid.x && coordA.grid.y === coordB.grid.y;
}

function snapToCorner(x,y){
    const gridSize = canvas.grid.size;
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;
    return { x: snappedX, y: snappedY };
}