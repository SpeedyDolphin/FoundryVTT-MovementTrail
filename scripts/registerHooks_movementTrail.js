import { registerCombatant, updateTrail, combatants, showTrail} from "./tokenTrail.js";
import { renderInit } from "./render.js";

Hooks.once('init', async function() {
  console.log("Athena's Movement Trail | Initializing");

  game.keybindings.register("athenas-movement-trail", "showTrail", {
    name: "Show Movement Trail",
    hint: "Shows the movement trail of the selected token.",
    restricted: true,
    editable: [{ key: "KeyV" }],
    onDown: () => {
      const token = canvas.tokens.controlled[0];
      if (token && game.combat.active === true) {
          showTrail(token.id);
      }
      console.log("Athena's Movement Trail | Keybinding Triggered");
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
    registerCombatant(combat.combatant.token.id, combat.combatant.actor.id, combat.round);
});

