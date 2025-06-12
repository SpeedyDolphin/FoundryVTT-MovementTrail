

export function registerSettings(){
    // DM settings
    setMovementPath();
    minOwnership();

    // Client Settings
    fontSettings();
    movementIndicator();
    colorScheme(); 
}

function fontSettings(){
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
function movementIndicator(){
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
}
function colorScheme(){
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
} 
function minOwnership(){
    game.settings.register("athenas-movement-trail", "ownershipLevel", {
    name: "Minium Ownership Level",
    hint: "The minimum ownership level required to see the movement trail.",
    scope: "world",         // "world" or "client"
    config: true,           // Show in the settings UI
    type: Number,
    default: 1,
    choices: {
      0: "None",
      1: "Limited",
      2: "Observer",
      3: "Owner"
    },  
  });
}
function setMovementPath(){
  game.settings.register("athenas-movement-trail", "actorMovementSpeedPath", {
    name: "Actor Movement Speed Path",
    hint: "The path to the actor's movement speed attribute.",
    scope: "world",       // or "world" depending on your use case
    config: true,          // show in settings UI
    default: "system.attributes.movement.walk",
    type: String
  });
}

