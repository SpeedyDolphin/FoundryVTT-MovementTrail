const mainContainer = new PIXI.Container();
const layer = canvas.layers.find((l) => l.options?.name === "grid");
layer.addChild(mainContainer)
const subContainers = {};

const delay = 3000; // 3 seconds

export async function renderCombatantTrail(combatantId, trail, userId){
    //adds a unique container for each combatant if it doesn't exist
    if (subContainers[combatantId] === undefined){
        subContainers[combatantId] = {'container' : new PIXI.Container(), 'version':0, 'color': getUserColor(combatantId, userId)};
        mainContainer.addChild(subContainers[combatantId]);
    }
    //remove the previous container's children
    subContainers[combatantId].removeChildren().forEach(child => child.destroy({ children: true }));

    //render the new trail
    drawTrail(trail, subContainers[combatantId].container);
    subContainers[combatantId].version += 1;
    const currContainer = subContainers[combatantId].version;

    //cleanup the container after a delay
    await new Promise(resolve => setTimeout(resolve, delay));
    if (currContainer == subContainers[combatantId].version){
        subContainers[combatantId].removeChildren().forEach(child => child.destroy({ children: true }));
    }
}

function drawTrail(trail, container){
    distance = 0
    for (let i = 0; i < trail.length; i++){
        distance += trail[i].distance ?? 0;
        distance= Math.round(distance)
        drawSquare(trail[i].pixel.x, trail[i].pixel.y, 0x03e2c8, String(distance), container) 
     }
     console.log(`Total distance ${distance}`);
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

function getUserColor(tokenId, userId) {
    //get the user of the token via the main character of the token
    let owningUsers = game.users.players.filter(u => u.character?.id === tokenId);
    if (owningUsers.length > 0) {
        return owningUsers[0].color;
    }
    //gets color of the user who moved the token
    const user = game.users.get(userId);
    return user.color;
}