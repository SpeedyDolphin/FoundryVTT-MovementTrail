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
  }
}

