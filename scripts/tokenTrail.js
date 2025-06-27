
import { renderCombatantTrail} from "./render.js";
import { socket } from "./registerHooks_movementTrail.js";

let combatants = {};
let rulerMovedCombatants= new Set(); //stupid race conditions
let untrackedCombatants = new Set(); // This will hold the ids of combatants that are not currently in the combat tracker but have moved. Resets at top of the round.
let canCondensePaths = true; // This is a global variable that can be toggled to enable or disable path condensing
let canTrack = true; 
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
export function addToUntracked(tokenId){
    untrackedCombatants.add(tokenId);
}

export async function updateTrail(tokenId, changes, userId) {
    console.log(`Normal updateTrail triggering`);
    if (rulerMovedCombatants.has(tokenId) || !canTrack) {
        console.log(`Update trail for token ${tokenId} is currently being updated by the ruler or is on pause due to toggle, skipping.`);
        return;
    }
    await loadData(); 
    //check if the token is being tracked add it if not
    if (combatants[tokenId] === undefined){
        offTurn_registerCombatant(tokenId)
    } 
    
    const movementData = getMovementData(changes, tokenId);
    if (movementData.distance === 0) {
        console.log(`Token ${tokenId} did not move, skipping trail update.`);
        return; // No movement, no need to update the trail
    }
    
    if (movementData.distance > canvas.scene.grid.distance){
        console.log('throwing a hissy fit for no good reason')
        console.log(movementData.distance)
        console.log(canvas.scene.grid.distance)
        // This means that the token is not moving to an adjacent square, so we ignore the movement
        combatants[tokenId].trail.push(movementData);
        combatants[tokenId].trail.at(-1).cost = 0; // Set the cost to 0 for non-adjacent movements
        backtracking(tokenId);

        //render
        socket.executeAsGM(saveData, tokenId, combatants[tokenId])
        socket.executeForEveryone(renderCombatantTrail, tokenId, combatants[tokenId].trail, userId); 
        return
    }
    
    combatants[tokenId].trail.push(movementData);
    combatants[tokenId].total_moved += movementData.cost; 

    if(canCondensePaths){
        backtracking(tokenId); 
        mergeDiagonals(tokenId);
    }

    console.log(combatants);
      
    //render
    socket.executeAsGM(saveData, tokenId, combatants[tokenId])
    socket.executeForEveryone(renderCombatantTrail, tokenId, combatants[tokenId].trail, userId); 
    console.log(`Normal updateTrail end`);
}

//Segments: ['ray':{"A":{'x':num, 'y':num}, B:{'x':num, 'y':num}}, teleport: boolean]
export async function rulerUpdateTrail(tokenId, segments, userId, resultPromise) {
    console.log('Update trail from ruler start');
    if (!canTrack){
        console.log(`Update trail for token ${tokenId} is currently on pause due to toggle, skipping.`);
        return;
    }

    rulerMovedCombatants.add(tokenId); // prevent race conditions
    await loadData(); // Load the latest data to ensure we have the most up-to-date combatants
    if (combatants[tokenId] === undefined){
        offTurn_registerCombatant(tokenId)
    }
    
    const movementSuccessful = await resultPromise;

    if (!movementSuccessful) {
        console.log("Movement blocked by wall or other obstacle, not updating trail.");
        rulerMovedCombatants.delete(tokenId); // allow other updates
        return;
    }
    for(let i = 0; i< segments.length; i++)
    {
        if(segments[i].teleport === true){ // dnd5e does not seem to use this to teleport. Adding it just in case
            continue
        }
        const points = getGridSquaresFromRay(segments[i].ray)


        for(let j = 1; j < points.length; j++){
            //console.log(`Adding (${points[j].x}, ${points[j].y})`)
            const movementData = getMovementDataFromPoints(points[j-1], points[j])
            combatants[tokenId].trail.push(movementData);
            combatants[tokenId].total_moved += movementData.cost; 

            if(canCondensePaths){
                backtracking(tokenId); 
                mergeDiagonals(tokenId);
            }

        }
    }
    console.log(combatants);
    socket.executeAsGM(saveData, tokenId, combatants[tokenId])
    socket.executeForEveryone(renderCombatantTrail, tokenId, combatants[tokenId].trail, userId);
    console.log('Update trail from ruler end');
    rulerMovedCombatants.delete(tokenId); // allow other updates
}

export async function showTrail(tokenId){
    await loadData();
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
    const movement = canvas.grid.measurePath([combatants[tokenId].trail.at(-1)?.pixel, snapToCorner(x, y)], { gridSpaces: true });
          
    return {
        'pixel': snapToCorner(x, y),
        'grid': pointToGrid(x, y),
        'distance': movement.distance, 
        'cost': movement.cost,
        'diagonal': movement.diagonals > 0  
    };
}
// 'a' and 'b' are both points representing the current grid position {'x': num, 'y':num}
function getMovementDataFromPoints(a, b){
    const movement = canvas.grid.measurePath([gridToPoint(a), gridToPoint(b)], { gridSpaces: true });
    return {
        'pixel': gridToPoint(b),
        'grid': {'x':b.y, "y": b.x}, // idk why they're swapped but they are. If it bricks after a foundry update this may be the cause? 
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
    let i = 0
    while(combatants[combatantId].trail.length >= 3 && isAdjacent(combatant.trail.at(-1), combatant.trail.at(-3))){
        console.log(`Iteration ${i++}`);
        if(isWalledOff(combatant.trail.at(-1), combatant.trail.at(-3))){
            // If the last two points are adjacent but walled off, we cannot merge them
            console.log('Cannot merge points due to wall');
            return;
        }
        console.log('Merging points');   
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
function isWalledOff(coordA, coordB) {
    const gridSize = canvas.grid.size;
    const wallCheck = ClockwiseSweepPolygon.testCollision(
        { x: coordA.pixel.x + gridSize/2, y: coordA.pixel.y + gridSize/2},
        { x: coordB.pixel.x+gridSize/2, y: coordB.pixel.y+gridSize/2 },
        {type: "move"}
    );
    return wallCheck.length > 0;
}
function checkTokenCollision(tokenId, a, b){
    let token = canvas.tokens.get(tokenId);
    let modifiedB = {'x': b.x + canvas.grid.size/2, 'y': b.y + canvas.grid.size/2}; // Adjust for the center of the grid square
    let result = token.checkCollision(modifiedB, {type: "move", "mode": "any"});
    console.log("Result of checkTokenCollision",result)
    return result
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
export function togglePathCondensing() {
    canCondensePaths = !canCondensePaths;
    console.log(`Path condensing is now ${canCondensePaths ? 'enabled' : 'disabled'}`);
}
export function toggleMovementTracking() {
    canTrack = !canTrack;
    console.log(`Tracking is now ${canTrack ? 'enabled' : 'disabled'}`);
}
//Save data
export async function saveData(tokenId, updatedData){
    console.log("Athena's Movement Trail | Saving data");
    if (game.user.isGM === false) {
        return;
    }

    if (tokenId !== undefined){
        combatants[tokenId] = updatedData;
    }
    await game.scenes.active.setFlag("athenas-movement-trail", "movementTrailData", {
        combatants: combatants,
        untrackedCombatants: Array.from(untrackedCombatants)
    });
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
// Point{'x':num, 'y':num}
function gridToPoint(point){
    const converted = canvas.grid.getPixelsFromGridPosition(point.x, point.y)
    return {'x': converted[0], 'y':converted[1]}
}

function isAdjacent(coordA, coordB) { 
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

function getGridSquaresFromRay(ray) {
  const [x0, y0] = canvas.grid.getGridPositionFromPixels(ray.A.x, ray.A.y);
  const [x1, y1] = canvas.grid.getGridPositionFromPixels(ray.B.x, ray.B.y);

  const points = [];

  // Bresenham's Line Algorithm
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = x0 < x1 ? 1 : -1;
  let sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  let x = x0;
  let y = y0;

  while (true) {
    points.push({x, y});

    if (x === x1 && y === y1) break;

    let e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  return points;
}
