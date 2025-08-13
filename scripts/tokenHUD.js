//Purpose: Add the button to the token HUD and handle all logic that lets the user manipulate their speed

import { getTokenFlags } from "./helpers/movementSpeeds.js";
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
    const sidePanel =  $( await renderTemplate("modules/athenas-movement-trail/templates/tokenHUD_menu.hbs", {speedData: cleanSpeedData(flags.speedData), speed_multipliers, currentMovement:flags.currentMovement})).hide();
    
  
    console.log(cleanSpeedData(flags.speedData))
    console.log(flags);
  // Add click behavior
  btn.on("click", () => {
    btn.toggleClass("active");
    sidePanel.toggle();
  });

  // Append it to the left-side controls (e.g., below "effects" or "target")
  html.querySelector(".left").appendChild(btn[0])
  html.querySelector(".left").appendChild(sidePanel[0])
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
