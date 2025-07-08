// This is the place where is all starts and then things get delegated to other files. 

import { registerCombatant, updateTrail,resetUntracked, saveData, loadData, clearData, rulerUpdateTrail, addToUntracked} from "./tokenTrail.js";
import {renderCombatantTrail} from "./render.js"
import { registerSettings } from "./config/settings.js";
import { setKeybindings } from "./config/keybinds.js";
import { renderInit } from "./render.js";
import { renderTokenHUD } from "./tokenHUD.js";


Hooks.once('init', async function() {
  console.log("Athena's Movement Trail | Initializing");

  setKeybindings();
  registerSettings();
  monkeyPatchRuler();
});

export let socket; //export is used by tokenTrail to communicate changes to other players
Hooks.once("socketlib.ready", () => {
  socket = socketlib.registerModule("athenas-movement-trail");
  socket.register("render", renderCombatantTrail);
  socket.register("saveData", saveData);
});

Hooks.on("canvasReady", async () => {
  console.log("Athena's Movement Trail | Canvas Ready Hook Triggered");
  renderInit();
  loadData();
});

Hooks.on("preUpdateToken", async (token, changes, options, userId) => {
    console.log("Athena's Movement Trail | Update Token Hook Triggered");    
    // Check if position changed
    if (game.combat && ("x" in changes || "y" in changes) && game.combat.combatants.size !== 0) {
      updateTrail(token.id, changes, userId);
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
  clearData(); // Clear all data when combat ends
});
Hooks.once("deleteCombatant", (combatant, options, userId) => {
  console.log(`Combatant ${combatant.name} was removed from combat.`);
  addToUntracked(combatant.token.id);
  saveData(); //only the gm user saves the data
});

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

Hooks.on("renderTokenHUD", (hud, html, data) => {
  renderTokenHUD(hud, html, data);
});

