let mainContainer
let subContainers

const delay = 3000; // 3 seconds

function getColorPalette(){
    //This is a function because it can dynamically get colors from the game settings. 
    return {
    'basic':
    {
        0: 0x00ff00, // green
        1: 0xffff00, // yellow  
        2: 0xffa500, // orange
        3: 0xff0000, // red
    }, 
    'embers':
    {
        0: 0x41436A, // plum
        1: 0x984063, // burgundy
        2: 0xF64668, // orange
        3: 0xFE9677 // Yellow
    },
    'custom':
    {
        0: getNumericalColor(game.settings.get("athenas-movement-trail", "customColor1")),
        1: getNumericalColor(game.settings.get("athenas-movement-trail", "customColor2")),
        2: getNumericalColor(game.settings.get("athenas-movement-trail", "customColor3")),
        3: getNumericalColor(game.settings.get("athenas-movement-trail", "customColor4"))
    }
  }
}
// Color format is "#RRGGBBAA"
function getNumericalColor(color){ 
  return parseInt(color.slice(1, 7), 16);
}

export function renderInit(){
    mainContainer = new PIXI.Container();
    subContainers = {};
    const layer = canvas.layers.find((l) => l.options?.name === "grid");
    layer.addChild(mainContainer)
}
export async function renderCombatantTrail(combatantId, trail, userId){
    if(!meetsOwnershipThreshold(combatantId)) {
        // If the user does not meet the ownership threshold, do not render the trail
        return;
    }

    //adds a unique container for each combatant if it doesn't exist
    if (subContainers[combatantId] === undefined){
        subContainers[combatantId] = {'container' : new PIXI.Container(), 'version':0, 'color': getUserColor(combatantId, userId)};
        mainContainer.addChild(subContainers[combatantId].container);
    }
    //remove the previous container's children
    subContainers[combatantId].container.removeChildren().forEach(child => child.destroy({ children: true }));

    //render the new trail
    drawTrail(trail, subContainers[combatantId].container, subContainers[combatantId].color, combatantId);
    subContainers[combatantId].version += 1;
    const currContainer = subContainers[combatantId].version;

    //cleanup the container after a delay
    await new Promise(resolve => setTimeout(resolve, delay));
    if (currContainer == subContainers[combatantId].version){
        subContainers[combatantId].container.removeChildren().forEach(child => child.destroy({ children: true }));
    }
}

async function drawTrail(trail, container, color, tokenId){
    let cost = 0
    for (let i = 0; i < trail.length; i++){
        if(i === trail.length-1){ // end of trail we are just estimating what the next movement would cost. 
            cost = Math.round(cost + canvas.scene.grid.distance);
            await new Promise((resolve) => setTimeout(resolve, 150)); //wait .2 seconds so the token moves first
        }
        else
            cost = Math.round(cost + trail[i+1]?.cost ?? 0); // rounding to avoid floating point issues
        drawSquare(trail[i].pixel.x, trail[i].pixel.y, color, String(cost), container, (trail[i].cost === 0 && i !== 0))
        movementUsageIndicator(trail[i].pixel.x, trail[i].pixel.y, cost, container, tokenId); 
     }
     console.log(`Total travel cost ${cost}`);
}
function movementUsageIndicator(x, y, currentCost, container, tokenId){

    switch (game.settings.get("athenas-movement-trail", "movementUsageIndicator")){
        case 'none':
            break;
        case 'basic':
            drawBasicMovementUsageIndicator(x, y, currentCost, container, tokenId);
            break;
        case 'footprints':
            drawFootprintMovementUsageIndicator(x, y, currentCost, container, tokenId);
            break;
    }
}
function drawBasicMovementUsageIndicator(x, y,currentCost, container, tokenId){
    const gridSize = canvas.grid.size;
    const userMovement = getSpeed(tokenId); //TODO get the actual movement of the actor 
    const colorPalette = getColorPalette()

    //Draw Square
    const square = new PIXI.Graphics();
    const color = colorPalette[game.settings.get("athenas-movement-trail", "movementUsageColorScheme")][Math.floor(currentCost / (userMovement+1))];
    square.lineStyle(3, color, .6);  // (thickness, color, alpha) 3px red outline
    square.drawRoundedRect(0, 0, gridSize - gridSize*.07, gridSize - gridSize*.07, gridSize*.15); // Position and size
    square.endFill();
    
    //Position and mount square
    square.x = x + gridSize*.03; 
    square.y = y + gridSize*.03;
    container.addChild(square);
}    
//x, y should be the coordinates for the top left corner 
function drawSquare(x, y, color, number, container, teleport){
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
    
    // Add label 
    if (number && !teleport){
        //Make Text
        const text = new PIXI.Text(number, {
          fontFamily: game.settings.get("athenas-movement-trail", "font"),
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
    else{
        const teleportIcon = PIXI.Sprite.from("modules/athenas-movement-trail/images/daze.svg");
        teleportIcon.x = x + gridSize / 2;
        teleportIcon.y = y + gridSize /2;
        teleportIcon.anchor.set(0.5);
        teleportIcon.width = teleportIcon.height = gridSize / 3;
        container.addChild(teleportIcon);
    }
}

function getUserColor(tokenId, userId) {
    const actorId = canvas.tokens.get(tokenId)?.actor?.id;

    //get the user of the token via the main character of the token
    let owningUsers = game.users.players.filter(u => u.character?.id === actorId);
    if (owningUsers.length > 0) {
        return owningUsers[0].color;
    }
    //gets color of the user who moved the token
    const user = game.users.get(userId);
    return user.color;
}

function meetsOwnershipThreshold(tokenId){
    const actor = canvas.tokens.get(tokenId)?.actor;
    const minOwnership = game.settings.get("athenas-movement-trail", "ownershipLevel");

    if (actor.getUserLevel(game.user) >= minOwnership || game.user.isGM) {
        return true;
    }
    return false; 

}
function getSpeed(tokenId){
    const actor = canvas.tokens.get(tokenId).actor;
    const path = game.settings.get("athenas-movement-trail", "actorMovementSpeedPath");
    return path.split('.').reduce((acc, key) => acc[key], actor) || 0;
}