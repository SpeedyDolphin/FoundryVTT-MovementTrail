import { registerCombatant, updateTrail, showTrail, resetUntracked, saveData, loadData, clearData, rulerUpdateTrail, togglePathCondensing} from "./tokenTrail.js";
import { registerSettings } from "./settings.js";
import { renderInit } from "./render.js";

Hooks.once('init', async function() {
  console.log("Athena's Movement Trail | Initializing");

  setKeybindings();
  registerSettings();
  monkeyPatchRuler();
});

Hooks.on("canvasReady", async () => {
  console.log("Athena's Movement Trail | Canvas Ready Hook Triggered");
  renderInit();
  loadData();
});

Hooks.on("updateToken", async (token, changes, options, userId) => {
    console.log("Athena's Movement Trail | Update Token Hook Triggered");    
    // Check if position changed
    if (game.combat && ("x" in changes || "y" in changes)) {
      updateTrail(token.id, changes, userId);
      saveData(); //only the gm user saves the data
    }
});

Hooks.on("updateCombat", async (combat, changed) => {
    console.log("Athena's Movement Trail | Update Combat Hook Triggered");
    if(combat.combatant !== undefined) // this is a guard for when no one has rolled initiative but the tracker is advanced anyways.  
      registerCombatant(combat.combatant.token.id, combat.combatant.actor.id, combat.round);

    if (changed.round) {
        // Reset untracked combatants at the start of a new round
        resetUntracked();
    }
    saveData(); //only the gm user saves the data
});

Hooks.on("deleteCombat", (combat, options, userId) => {
  console.log("Combat has ended!");
  // Your cleanup or post-combat logic here
  clearData(); // Clear all data when combat ends
});

function setKeybindings(){
  game.keybindings.register("athenas-movement-trail", "showTrail", {
    name: "Show Movement Trail",
    hint: "Shows the movement trail of the selected token.",
    restricted: false,
    editable: [{ key: "KeyV" }],
    onDown: () => {
      const token = canvas.tokens.controlled[0];
      if (token && game.combat.active === true) {
          showTrail(token.id);
      }
      console.log("Athena's Movement Trail | V Keybinding Triggered");
    },
  });
  game.keybindings.register("athenas-movement-trail", "pathCondensingToggle", {
    name: "Toggle Path Condensing",
    hint: "When enabled, the movement trail will not automatically backtrack or merge diagonals.",
    restricted: false,
    editable: [{ key: "KeyB" }],
    onDown: () => {
      togglePathCondensing();
      console.log("Athena's Movement Trail | B Keybinding Triggered");
    },
  });
}

function monkeyPatchRuler(){
  libWrapper.register("athenas-movement-trail","Ruler.prototype.moveToken",
    function (wrapped, ...args) {
      console.log(`Token moved using ruler`);
      console.log(this.segments);
      let result = wrapped(...args);  
      if(this.token?.id !== undefined){
        rulerUpdateTrail(this.token.id, this.segments, this.user.id, result);
      }
      return result;
    },
    "WRAPPER"
  );
}