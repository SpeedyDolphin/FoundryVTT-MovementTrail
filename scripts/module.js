import { registerCombatant, updateTrail, combatants, pointToGrid } from "./tokenTrail.js";
import { renderInit } from "./render.js";

Hooks.once('init', async function() {
  console.log("Athena's Movement Trail | Initializing");

  game.keybindings.register("athenas-movement-trail", "showTrail", {
    name: "Show Movement Trail",
    hint: "Shows the movement trail of the selected token.",
    restricted: true,
    editable: [{ key: "KeyV" }],
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

Hooks.once("canvasReady", async () => {
  console.log("Athena's Movement Trail | Canvas Ready Hook Triggered");
  renderInit();
});

Hooks.on("updateToken", async (token, changes, options, userId) => {
    console.log("Athena's Movement Trail | Update Token Hook Triggered");    
    // Check if position changed
    if ("x" in changes || "y" in changes) {
      const combatant = combatants[token.actor.id];
      updateTrail(combatant, changes, userId);
  }
});


Hooks.on("updateCombat", async (combat, changed) => {
    console.log("Athena's Movement Trail | Update Combat Hook Triggered");
    const actor = combat.combatant.actor;
    const token = canvas.tokens.placeables.find(t => t.actor?.id === actor._id);
    
    registerCombatant(token, actor._id);
});

