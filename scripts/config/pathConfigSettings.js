//Export used by settings.js
//This file contains the logic for displaying the popup menu for configuring the the path to the value of the token's movement speed

/*
Specific uses: 
  {PathConfigSettings, getDefaultPaths} by settings.js
    PathConfigSettings is a class extending FormApplication
    getDefaultsPaths() is a getter to allow the settings files to register the proper path given the game system. 


Depends upon: 
settingsMenu.hbs    ~ the parent form file 
 - partials/manualEntry.hbs
 - partials/dictEntry.hbs
 - partials/arrayEntry.hbs
*/

const DEFAULT_PATHS = {
  "a5e": {
    "default": {
      "path": "system.attributes.movement.walk.distance",
      "label": "walk"
    },
    "movementSpeeds": [
      {
        "type" : "dictionary",
        "path" : "system.attributes.movement",
        "value": ".distance"
      }
    ]
  },
  "dnd5e" : {
    "default": {
      "path": "system.attributes.movement.walk",
      "label": "walk"
    },
    "movementSpeeds": [
      {
        "type" : "dictionary",
        "path" : "system.attributes.movement",
        "value": ""
      }
    ]
  },
  "pf2e" : {
    "default": {
      "path": "system.attributes.speed.total",
      "label": "land speed"
    },
    "movementSpeeds": [
      {
        "type" : "array",
        "path" : "system.attributes.movement.otherSpeeds",
        "value": ".value",
        "label": ".label"
      }
    ]
  }
}

export class PathConfigSettings extends FormApplication {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "hello-world-app",
      title: "Movement Paths Configuration",
      template: "modules/athenas-movement-trail/templates/settingsMenu.hbs",
      width: 700
    });
  }

  getData() {
    return {
      manualPath: "system.attributes.movement.walk", 
      label: "Walk"
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Handle the click event for the collapsible rows
    html.on("click", ".athena-collapsible-row", (event) => {
      event.preventDefault();
      const $header = $(event.currentTarget);
      const $content = $header.next(".athena-collapsible-row-content");
      $content.toggle();
      const $caret = $header.find(".caret i");
      $caret.toggleClass("athena-rotated");
    });
    //Handle the click event so clicking on the input doesn't toggle the dropdown
    html.on("click", ".path-field", (event) => {
      event.stopPropagation();
    });
    // Handle the click event for deleting rows
    html.on("click", ".athena-delete-row", (event) => {
      event.stopPropagation();
      $(event.currentTarget).closest(".athena-entry").remove();
    });
    // Handle the click event for adding a new entry
    html.on("click", ".athena-add-entry", (event) => {
      event.stopPropagation();
      $(".athena-dropdown-add-menu").toggle();
    });
    html.on("click", ".add-option", async (event) => {
      event.stopPropagation();
      $(".athena-dropdown-add-menu").toggle();

      const type = $(event.currentTarget).data("type");
      let row; 
      switch (type){
          case "manual":
            row = $( await renderTemplate("modules/athenas-movement-trail/templates/partials/manualEntry.hbs", {}))
            break;
          case "dictionary":
            row = $( await renderTemplate("modules/athenas-movement-trail/templates/partials/dictEntry.hbs", {}))
            break;
          case "array":
            row = $( await renderTemplate("modules/athenas-movement-trail/templates/partials/arrayEntry.hbs", {}))
            break;
      }
      $(".athena-table").append(row)
    });

  }
  async _updateObject(event, formData) {
    console.log("Form submitted:", formData);
    
    let pathData = {"movementSpeeds":[]}
    
    //Process the manual rows
    //Multiple manual rows
    if(typeof(formData.manualPath)!=='string'){
      for(let i =0; i< formData.manualPath.length; i++){
        let formattedData = processManualRow(formData.manualPath[i], formData.manualLabel[i], formData.isDefaultPath[i]);
        if (formattedData["type"]===undefined){
          pathData["default"] = formattedData["default"];
        }
        else{
          pathData.movementSpeeds.push(formattedData)
        }
      }
    }
    else{//Only one manual row. Per rules this must be a default path
      pathData['default'] = {
        "path": formData.manualPath,
        "label": formData.manualLabel
      }
    }
    //Process Dictionary Rows
    if(formData.dictionaryPath !== undefined){
      if( typeof(formData.dictionaryPath)!=='string'){
        for(let i =0; i< formData.dictionaryPath.length; i++){
          pathData.movementSpeeds.push(processDictionaryRow(formData.dictionaryPath[i], formData.dictionaryValuePath[i]));
        }
      }
      else {
        pathData.movementSpeeds.push(processDictionaryRow(formData.dictionaryPath, formData.dictionaryValuePath));
      }
    }
    //Process Array Rows
    if(formData.arrayPath !== undefined){
      if( typeof(formData.arrayPath)!=='string'){
        for(let i =0; i< formData.arrayPath.length; i++){
          pathData.movementSpeeds.push(processArrayRow(formData.arrayPath[i], formData.arrayPath[i], formData.arrayValuePath[i]));
        }
      }
      else {
        pathData.movementSpeeds.push(processArrayRow(formData.arrayPath, formData.arrayValuePath, formData.arrayValuePath));
      }
    }
    console.log(pathData);
    await game.settings.set('athenas-movement-trail','movementPaths', pathData);

  }
}

function processManualRow(path, label, isDefault){
  if (isDefault){
    return {
      "default": {
        "path": path,
        "label": label
      }
    }
  }
  else{
    return {
      "type": "manual",
      "path": path,
      "label": label
    }
  }
}
function processDictionaryRow(path, value){
  return{
    "type":"dictionary",
    "path":path,
    "value":value
  }
}
function processArrayRow(path, value, label){
  return{
    "type": "array",
    "path":path,
    "value":value,
    "label":label
  } 
}
export function getDefaultPaths(){
  if(game.system.id in DEFAULT_PATHS){
    return DEFAULT_PATHS[game.system.id]
  }
  return DEFAULT_PATHS['dnd5e']
}