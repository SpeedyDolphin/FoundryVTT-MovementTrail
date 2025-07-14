// Exports used by registerHooks_movementTrail.js
// The purpose of this file is to let all game.settings.register calls live in one file. 

/*
Specific uses: 
  { registerSettings } by registerHooks_movementTrail.js
    - Nearly every function in this file is called by registerSettings() 
*/
import {PathConfigSettings, getDefaultPaths} from "./pathConfigSettings.js";

export function registerSettings(){
    // DM settings
    setMovementPathsMenu();
    minOwnership();
    addTokenHUDButton();
    showSwimClimbAsHalfSpeed();

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
      "custom": "Custom",
    },

  });
  
  new window.Ardittristan.ColorSetting("athenas-movement-trail", "customColor1", {
    name: "Custom Color 1",           // The name of the setting in the settings menu
    hint: "The first color the movement indicator uses",        // A description of the registered setting and its behavior
    label: "Color Picker",              // The text label used in the button
    restricted: false,                  // Restrict this setting to gamemaster only?
    defaultColor: "#00ff00ff",          // The default color of the setting
    scope: "client",                    // The scope of the setting
    onChange: (value) => {},            // A callback function which triggers when the setting is changed
    insertAfter: "athenas-movement-trail.movementUsageColorScheme"   // If supplied it will place the setting after the supplied setting
  })
  new window.Ardittristan.ColorSetting("athenas-movement-trail", "customColor2", {
    name: "Custom Color 2",           // The name of the setting in the settings menu
    hint: "The second color the movement indicator uses",        // A description of the registered setting and its behavior
    label: "Color Picker",              // The text label used in the button
    restricted: false,                  // Restrict this setting to gamemaster only?
    defaultColor: "#ffff00ff",          // The default color of the setting
    scope: "client",                    // The scope of the setting
    onChange: (value) => {},            // A callback function which triggers when the setting is changed
    insertAfter: "athenas-movement-trail.customColor1"   // If supplied it will place the setting after the supplied setting
  })
  new window.Ardittristan.ColorSetting("athenas-movement-trail", "customColor3", {
    name: "Custom Color 3",           // The name of the setting in the settings menu
    hint: "The third color the movement indicator uses",        // A description of the registered setting and its behavior
    label: "Color Picker",              // The text label used in the button
    restricted: false,                  // Restrict this setting to gamemaster only?
    defaultColor: "#ffa500ff",          // The default color of the setting
    scope: "client",                    // The scope of the setting
    onChange: (value) => {},            // A callback function which triggers when the setting is changed
    insertAfter: "athenas-movement-trail.customColor2"   // If supplied it will place the setting after the supplied setting
  })
  new window.Ardittristan.ColorSetting("athenas-movement-trail", "customColor4", {
    name: "Custom Color 4",           // The name of the setting in the settings menu
    hint: "The fourth color the movement indicator uses",        // A description of the registered setting and its behavior
    label: "Color Picker",              // The text label used in the button
    restricted: false,                  // Restrict this setting to gamemaster only?
    defaultColor: "#ff0000ff",          // The default color of the setting
    scope: "client",                    // The scope of the setting
    onChange: (value) => {},            // A callback function which triggers when the setting is changed
    insertAfter: "athenas-movement-trail.customColor3"   // If supplied it will place the setting after the supplied setting
  })
}
export function setUpColorSchemeListener(html){
  // Line for v13 compatibility. Thanks to Michael in the Foundry Discord for this
  html = html instanceof HTMLElement ? html : html[0];

  const mySettings = html.querySelector('section[data-tab="athenas-movement-trail"]');
  const colorThemeSelect = mySettings.querySelector('div[data-settings-key="athenas-movement-trail.movementUsageColorScheme"]').querySelector('select');
  
  function updateVisibility(){
    const colorTheme = colorThemeSelect.value
    for(let i=1; i<=4; i++){
      if(colorTheme === 'custom')
        mySettings.querySelector(`div[data-settings-key="athenas-movement-trail.customColor${i}"]`).style.display = "";
      else
        mySettings.querySelector(`div[data-settings-key="athenas-movement-trail.customColor${i}"]`).style.display = "none";
    }
  }
  updateVisibility()
  colorThemeSelect.addEventListener("change", updateVisibility);

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
function addTokenHUDButton(){
  game.settings.register("athenas-movement-trail", "addTokenHUDButton", {
    name: "Show Token HUD Button",
    hint: "Adds a button to the token HUD to be able to change movement types.",
    scope: "world",       // or "world" depending on your use case
    config: true,          // show in settings UI
    default: true,
    type: Boolean,
  });
}
function showSwimClimbAsHalfSpeed(){
  game.settings.register("athenas-movement-trail", "includeSwimClimb", {
    name: "Show Swim/Climb Speed",
    hint: "Shows the Swim/Climb speed in the tokenHUD as half of the default movement speed",
    scope: "world",       // or "world" depending on your use case
    config: true,          // show in settings UI
    default: true,
    type: Boolean,
  });
}
function setMovementPathsMenu(){
  loadPartials();
  game.settings.register("athenas-movement-trail", "movementPaths", {
    name: "Actor Movement Speed Paths",
    hint: "The paths to the actor's movement speed attribute.",
    scope: "world",       // or "world" depending on your use case
    config: false,          // show in settings UI
    default: getDefaultPaths(),
    type: Object
  });
  game.settings.registerMenu("athenas-movement-trail", "movementPathsMenu", {
    name: "Movement Paths Configuration", // The name of the button in the settings
    label: "Open Menu", // The button label in the settings
    scope: "world",
    hint: "Click to open the configuration menu.",
    icon: "fas fa-cog", // FontAwesome icon
    type: PathConfigSettings, // A FormApplication class (defined below)
    restricted: true, // Only GMs can access
  });
}
function loadPartials(){
  const paths = [
    "modules/athenas-movement-trail/templates/partials/arrayEntry.hbs",
    "modules/athenas-movement-trail/templates/partials/dictEntry.hbs",
    "modules/athenas-movement-trail/templates/partials/manualEntry.hbs",
    "modules/athenas-movement-trail/templates/partials/testPopulate.hbs"
  ]
  loadTemplates(paths);
}

