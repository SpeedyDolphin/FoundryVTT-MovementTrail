//Purpose: Add the button to the token HUD and handle all logic that lets the user manipulate their speed
/*
Specific uses: 
	{ renderTokenHUD } by registerHooks_movementTrail.js
	 	Adds an extra button to the token HUD allows players more control over their movement speed
*/


export async function renderTokenHUD(app, [html]){
    // Line for v13 compatibility. Thanks to Michael in the Foundry Discord for this
    html = html instanceof HTMLElement ? html : html[0];
    console.log(html);
    // Create a new button
    const btn = $(`<div class="athena-hud-button control-icon" data-tooltip="Movement Type">
      <img class="athena-hud-icon" src="modules/athenas-movement-trail/images/wingfoot.svg"/>
    </div>`);
    
    const speedData = {
        walk : {label: "Walk", speed: 30, multiplier: 1},
        swim : {label: "Swim", speed: 15, multiplier: 1},
        climb : {label: "Climb", speed: 15, multiplier: 1}, 
    }
    const speed_multipliers = [0.25, 0.5, 1, 2,3,4];
    const sidePanel =  $( await renderTemplate("modules/athenas-movement-trail/templates/tokenHUD_menu.hbs", {speedData, speed_multipliers})).hide();
    
  
  // Add click behavior
  btn.on("click", () => {
    btn.toggleClass("active");
    sidePanel.toggle();
  });

  // Append it to the left-side controls (e.g., below "effects" or "target")
  html.querySelector(".left").appendChild(btn[0])
  html.querySelector(".left").appendChild(sidePanel[0])
}