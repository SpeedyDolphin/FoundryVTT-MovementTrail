import {showTrail, togglePathCondensing} from "../tokenTrail.js";

export function setKeybindings(){
  setShowTrailKeybinding(); // Default: V
  setPathCondensingToggleKeybinding(); // Default: B
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