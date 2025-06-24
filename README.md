
# Athena's Token Trail 
A Foundry VTT module that shows a trail for the movement a token does in a round of combat.  

![image](https://raw.githubusercontent.com/SpeedyDolphin/FoundryVTT-MovementTrail/refs/heads/dev/images/ModuleDemo.png)

## Usage
This module tracks movement done by pressing the arrows keys (or equivalent) or by the ruler. It does not track any movement done by picking up the token and dragging it if it moves more than 1 square. This is to facilitate teleports not being tracked. The trail automatically fades after 3 seconds. Who can view the trail is determined by the ownership level of the token. By default a player with limited ownership will be able to see the trail. 

The count for each token resets once it reaches their turn in the combat tracker. If they are not in the combat tracker, they'll reset at top of the round. No movement is tracked if there is not an combat encounter.   

The color for the path is chosen though assigned player character or the color of the user who moved it. The border changes color depending on how much speed the actor has used. If the border is black on the second square there is a high likelihood of the token not having a set walk speed.
 
By default the movement path supports backtracking and will merge diagonals 

### Keybinds
Show path ```v```:
- Shows the path for the token currently selected. 

Toggle path condensing ```b```:
- When enabled, the movement trail will not automatically backtrack or merge diagonals. This is helpful if there's a specific square you want to move to or want going back over the trail while still tracking movement. 

### Setup 
I tried to make this module system agnostic. As such you may have to configure the path to the actor movement speed. It is automatically set up for DnD5e, pathfinder, and A5e. If you'd like me to add a system lmk what the path is and I can add it.   
Currently it only works on square grids. 

## Acknowledgements
This module was inspired by [Aeris Tokens](https://foundryvtt.com/packages/aeris-tokens). It's a lovely module that shows a reachable tile grid based on movement speed, and you get a live path preview as you drag. It personally doesn't suit my needs and this module is likely incompatible with it. 

Thank you to all my friends and players who have heard me talk about this module for the past few weeks. 
Also thank you to you for checking this out! If you'd like to help out a broke college graduate feel free to buy me a coffee. 

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/speedydolphin)

## Support
For issues, bugs, or feature requests, please submit them via [GitHub Issues](https://github.com/SpeedyDolphin/FoundryVTT-MovementTrail/issues).
