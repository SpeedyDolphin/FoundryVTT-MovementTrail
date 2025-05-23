import { registerCombatant, updateTrail, combatants } from "./tokenTrail";

Hooks.once('init', async function() {
  console.log("Athena's Movement Trail | Initializing");

  game.keybindings.register("athenas-movement-trail", "showTrail", {
    name: "Show Movement Trail",
    hint: "Shows the movement trail of the selected token.",
    restricted: true,
    editable: [{ key: "KeyT" }],
    onDown: () => {
      // const token = canvas.tokens.controlled[0];
      // if (token) {
      //   const combatant = combatants[token.actor.id];
      //   if (combatant) {
          
      //   }
      // }
      console.log("Athena's Movement Trail | Keybinding Triggered");
      console.log("I will one day do something :3");
    },
  });
});

Hooks.on("updateToken", async (token, changes, options, userId) => {    
    // Check if position changed
    if ("x" in changes || "y" in changes) {
      const x = changes.x ?? token.x;
      const y = changes.y ?? token.y; 
      const combatant = combatants[token.actor.id];
      
      // note: falling back on init_coordinate may be a bit redundant.  
      let movement = canvas.grid.measurePath(
          [combatant.trail.at(-1)?.pixel ?? combatant.init_coordinate.pixel, { x, y }], 
          { gridSpaces: true });
          
      const newCoordinate = {
        'pixel': { 'x': x, 'y': y },
        'grid': pointToGrid(x, y),
        'distance': movement.distance, 
        'diagonal': movement.diagonals > 0  
      };
      
      updateTrail(combatant, newCoordinate, userId);
  }
});


Hooks.on("updateCombat", async (combat, changed) => {
    const actor = combat.combatant.actor;
    const token = canvas.tokens.placeables.find(t => t.actor?.id === actor._id);
    
    registerCombatant(token, actor._id);
});

