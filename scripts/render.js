const mainContainer = new PIXI.Container();
const subContainers = {};

const delay = 3000; // 3 seconds

export function renderInit(){
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
     }
     console.log(`Total travel cost ${cost}`);
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