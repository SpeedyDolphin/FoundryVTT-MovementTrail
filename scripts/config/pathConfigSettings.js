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
  html.find(".athena-collapsible-row").on("click", (event) => {
    event.preventDefault();
    const $header = $(event.currentTarget);
    const $content = $header.next(".athena-collapsible-row-content");
    $content.toggle();
    const $caret = $header.find(".caret i");
    $caret.toggleClass("athena-rotated");
  });
  //Handle the click event so clicking on the input doesn't toggle the dropdown
  html.find(".path-field").on("click", (event) => {
    event.stopPropagation();
  });
  // Handle the click event for deleting rows
  html.find(".athena-delete-row").on("click", (event) => {
    event.stopPropagation();
    $(event.currentTarget).closest(".athena-entry").remove();
  });
  // Handle the click event for adding a new entry
  html.find(".athena-add-entry").on("click", (event) => {
    event.stopPropagation();
    $(".athena-dropdown-add-menu").toggle();
  });
}

  async _updateObject(event, formData) {
    console.log("Form submitted:", formData);
  }
}

