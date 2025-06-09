import { registerCombatant, updateTrail, showTrail, resetUntracked, saveData, loadData, clearData, rulerUpdateTrail} from "./tokenTrail.js";
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
  game.settings.register("athenas-movement-trail", "movementUsageIndicator", {
    name: "Movement Usage Indicator",
    hint: "Adds a visual indicator of the movement usage on the token.",
    scope: "client",         // "world" or "client"
    config: true,           // Show in the settings UI
    type: String,
    default: "Basic",
    choices: {
      "basic": "Basic",
      "footprints": "Footprints",
      "none": "None"
    },  
  });
  game.settings.register("athenas-movement-trail", "movementUsageColorScheme", {
    name: "Movement Usage Color Scheme",
    hint: "Color scheme for the movement usage indicator.",
    scope: "client",         // "world" or "client"
    config: true,           // Show in the settings UI
    type: String,
    default: "Basic",
    choices: {
      "basic": "Basic (Green, Yellow, Orange, Red)",
      "embers": "Embers (Orange, Pink, Orchid, Plum)",
      "goth": "Goth (Black, DarkGrey, Grey, White)",
    },  
  });
  game.settings.register("athenas-movement-trail", "actorMovementSpeedPath", {
    name: "Actor Movement Speed Path",
    hint: "The path to the actor's movement speed attribute.",
    scope: "world",       // or "world" depending on your use case
    config: true,          // show in settings UI
    default: "system.attributes.movement.walk",
    type: String
  });
}

function monkeyPatchRuler(){
  libWrapper.register("athenas-movement-trail","Ruler.prototype.moveToken",
    function (...args) {
      console.log(`Token moved using ruler`);
      console.log(this.segments);      
      rulerUpdateTrail(this.token.id, this.segments, this.user.id);
      return;
    },
    "LISTENER"
  );
}