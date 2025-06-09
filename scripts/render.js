let mainContainer
let subContainers

const delay = 3000; // 3 seconds

const colorPalette = {
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
    }
}

export function renderInit(){
    mainContainer = new PIXI.Container();
    subContainers = {};
    const layer = canvas.layers.find((l) => l.options?.name === "grid");
    layer.addChild(mainContainer)
}
export async function renderCombatantTrail(combatantId, trail, userId){
    //adds a unique container for each combatant if it doesn't exist
    if (subContainers[combatantId] === undefined){
        subContainers[combatantId] = {'container' : new PIXI.Container(), 'version':0, 'color': getUserColor(combatantId, userId)};
        mainContainer.addChild(subContainers[combatantId].container);
    }
    //remove the previous container's children
    subContainers[combatantId].container.removeChildren().forEach(child => child.destroy({ children: true }));

    //render the new trail
    drawTrail(trail, subContainers[combatantId].container, subContainers[combatantId].color);
    subContainers[combatantId].version += 1;
    const currContainer = subContainers[combatantId].version;

    //cleanup the container after a delay
    await new Promise(resolve => setTimeout(resolve, delay));
    if (currContainer == subContainers[combatantId].version){
        subContainers[combatantId].container.removeChildren().forEach(child => child.destroy({ children: true }));
    }
}

function drawTrail(trail, container, color){
    let cost = 0
    for (let i = 0; i < trail.length; i++){
        cost = Math.round(cost + trail[i].cost ?? 0); // rounding to avoid floating point issues
        drawSquare(trail[i].pixel.x, trail[i].pixel.y, color, String(cost), container)
        movementUsageIndicator(trail[i].pixel.x, trail[i].pixel.y, cost, container); 
     }
     console.log(`Total travel cost ${cost}`);
}
function movementUsageIndicator(x, y, currentCost, container){

    switch (game.settings.get("athenas-movement-trail", "movementUsageIndicator")){
        case 'none':
            break;
        case 'basic':
            drawBasicMovementUsageIndicator(x, y, currentCost, container);
            break;
        case 'footprints':
            drawFootprintMovementUsageIndicator(x, y, currentCost, container);
            break;
    }
}
function drawBasicMovementUsageIndicator(x, y,currentCost, container){
    const gridSize = canvas.grid.size;
    const userMovement = 30; //TODO get the actual movement of the actor 

    //Draw Square
    const square = new PIXI.Graphics();
    console.log(currentCost);
    console.log(`Current step: ${Math.floor(currentCost / userMovement)}, Current color: ${game.settings.get("athenas-movement-trail", "movementUsageColorScheme")}`);
    const color = colorPalette[game.settings.get("athenas-movement-trail", "movementUsageColorScheme")][Math.floor(currentCost / userMovement)];
    square.lineStyle(3, color, .6);  // (thickness, color, alpha) 3px red outline
    square.drawRoundedRect(0, 0, gridSize - gridSize*.07, gridSize - gridSize*.07, gridSize*.15); // Position and size
    square.endFill();
    
    //Position and mount square
    square.x = x + gridSize*.03; 
    square.y = y + gridSize*.03;
    container.addChild(square);
}    
//x, y should be the coordinates for the top left corner 
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
    
    // Add label 
    if (number){
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