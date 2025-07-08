//Exports used by registerHooks.js
// The purpose of this file is to let all game.keybindings.register calls live in one file
/*
  Specific uses: 
    { setKeybindings } by registerHooks.js
     - Every function in this file is called by setKeybindings()
*/
import {showTrail, togglePathCondensing, toggleMovementTracking} from "../tokenTrail.js";

export function setKeybindings(){
  setShowTrailKeybinding(); // Default: V
  setPathCondensingToggleKeybinding(); // Default: B
  setMovementTrackingToggleKeybinding(); // Default: Alt + B
}

function setShowTrailKeybinding(){
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
}
function setPathCondensingToggleKeybinding(){
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
function setMovementTrackingToggleKeybinding(){
  game.keybindings.register("athenas-movement-trail", "movementTrackingToggle", {
    name: "Toggle Movement Tracking",
    hint: "When enabled, the movement trail will not take into account token movement.",
    restricted: false,
    editable: [{ key: "KeyB", modifiers: ["Alt"] }],
    onDown: () => {
      toggleMovementTracking();
      console.log("Athena's Movement Trail | alt + B Keybinding Triggered");
    },
  });
}