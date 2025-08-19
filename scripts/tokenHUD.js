//Purpose: Add the button to the token HUD and handle all logic that lets the user manipulate their speed

import { getTokenFlags, setTokenFlags } from "./helpers/movementSpeeds.js";
/*
Specific uses: 
	{ renderTokenHUD } by registerHooks_movementTrail.js
	 	Adds an extra button to the token HUD allows players more control over their movement speed

Depends upon: 
  tokenHUD_menu.hbs

*/
const sampleActorFlags = {
  speedData : { // This will get updated every time the side panel in the HUD is opened. Only values with a speed > 0 are stored. 
      walk : {label: "Walk", multiplier: 1},
      swim : {label: "Swim", multiplier: 1},
      climb : {label: "Climb", multiplier: 1}, 
  },
  currentMovement : "Walk",
  initPenalty : 0,
  globalBonus: 0
}

export async function renderTokenHUD(app, [html]){
    // Line for v13 compatibility. Thanks to Michael in the Foundry Discord for this
    html = html instanceof HTMLElement ? html : html[0];
    // Create a new button
    const btn = $(`<div class="athena-hud-button control-icon" data-tooltip="Movement Type">
      <img class="athena-hud-icon" src="modules/athenas-movement-trail/images/wingfoot.svg"/>
    </div>`);
  
    const flags = await getTokenFlags(app.document._id)
    console.log(flags)
    const speed_multipliers = [0.25, 0.5, 1, 2,3,4];
    const $sidePanel =  $( await renderTemplate("modules/athenas-movement-trail/templates/tokenHUD_menu.hbs", {speedData: cleanSpeedData(flags.speedData), speed_multipliers, currentMovement:flags.currentMovement})).hide();
    

    console.log("side panel options?")
    
  
    console.log("Flag data")
    console.log(flags);
  // Add click behavior to the hud button
  btn.on("click", () => {
    btn.toggleClass("active");
    $sidePanel.toggle();
  });

  // Append it to the left-side controls (e.g., below "effects" or "target")
  html.querySelector(".left").appendChild(btn[0])
  html.querySelector(".left").appendChild($sidePanel[0])

  sidePanelListeners(flags)
  
}
function sidePanelListeners(flags){
  $(".speed-panel").on("click", ".speed-item", function (event) {
    console.log("Clicked", $(this).data("speed_type"));
    //Remove the active class from the previous element
    $(".speed-panel").find(".speed-item").removeClass("activeSpeed");

    // Add active class back to the parent of the changed select
    $(this).closest(".speed-item").addClass("activeSpeed");

    //Bookkeeping 
    flags.currentMovement = $(this).data("speed_type").toLowerCase()
    //Note to future self - Flags is a reference so we don't need to manually call setFlag to update the flag 
  });  

  $(".speed-panel").on("change", ".speed-select", function (event) {
      console.log("Multiplier changed to:", $(this).val());
      //Bookkeeping 
      let speedType = $(this).closest(".speed-item").data("speed_type").toLowerCase();
      flags.speedData[speedType]['multiplier'] = Number($(this).val())
  });
}
function cleanSpeedData(speedData){
  for(let entry in speedData){
    speedData[entry]["label"] = toTitleCase(entry)
    speedData[entry]["type"] = entry
    if ((entry === "climb" || entry === "swim") && game.settings.get("athenas-movement-trail", "includeSwimClimb") ){
      if (speedData[entry].speed <= 0){
        const defaultSpeed = game.settings.get("athenas-movement-trail", "movementPaths").default.label;
        speedData[entry].speed = Math.floor(speedData[defaultSpeed].speed /2);
      }
    }
    else if (speedData[entry].speed <= 0){
      delete speedData[entry]
    }
  }
  return speedData
}
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ").trim();
}
