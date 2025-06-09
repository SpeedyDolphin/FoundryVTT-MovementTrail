import { registerCombatant, updateTrail, showTrail, resetUntracked, saveData, loadData, clearData} from "./tokenTrail.js";
import { renderInit } from "./render.js";

Hooks.once('init', async function() {
  console.log("Athena's Movement Trail | Initializing");

  setKeybindings();
  registerSettings();
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
}

function registerSettings(){

  // Font Setting
  game.settings.register("athenas-movement-trail", "font", {
  name: "Font",
  hint: "The font used for the movement trail text.",
  scope: "client",         // "world" or "client"
  config: true,           // Show in the settings UI
  type: String,
  default: "Brush Script MT",
  choices: {
    "Arial (sans-serif)" : "Arial", 
    "Verdana": "Verdana",
    "Tahoma": "Tahoma",
    "Trebuchet MS": "Trebuchet MS",
    "Times New Roman": "Times New Roman",
    "Georgia": "Georgia",
    "Garamond": "Garamond",
    "Courier New": "Courier New",
    "Brush Script MT": "Brush Script MT"
  },
  
});

}