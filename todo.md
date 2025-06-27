

- [X]  Save the state of movement tracker in the scene so it can persist upon reloads 
    - [X] delete the save data upon end of combat 
- [ ] Add footprints to show direction and if movement requires dashing and so on 
    - [ ] add a way to customize per token the footprint icon
    - [x] add a way to choose custom colors 
- [X] Take into account the character's actual movement speed. 
    - [X] Make the path to the movement speed customizable to the game system
- [X] Test to see if movement was caused by the ruler function or drag/teleport.                        
        Use lib-wrapper to monkey patch the move token function on the ruler 
- [X] Fix the user color selector. Currently it only uses the color of the user moving the token 
- [ ] Edit behavior for tokens larger than 1 square
- [X] ~~Hide movements done by dm~~ Restrict movement to users with a certain level of token ownership 
- [X] check to see how it handles switching scenes mid combat
- [X] Make a button that turns off auto backtracking 
- [X] Make a proper read me
- [X] If a combatant is removed from the turn tracker, add it to the list of untracked combatants
- [X] Add way to turn off movement tracking 
- [ ] Update colision checking to use Foundry's method. 

Would be nice 
- [X] Update module to use sockets instead of each person tracking the state. 
- [ ] Does not account for large creatures. Will only take the middle of the top left square into account. 
- [ ] Find a way to hide fields in foundry setting page. 



BUGS:
- [X] Does not sync properly when the tab is inactive
- [?] point to grid occasionally breaks when spamming arrow keys. Potentially not calling the snapping function first? 
      Pixel coordinates appear to  be stable
      Bug seems to happen when pressing 3 buttons simultaneously 
      Update: Bug seems to have been fixed after migrating to preUpdateToken hook. 
- [X] Will merge the path without taking into account walls  
- [X] Movement via ruler that was blocked by walls was still added as if the movement went though. 
      Fixed the race condition that properly implementing this caused
- [X] If combatant has not been registered the ruler movement does not work.   
- [X] Running into walls cause the last space to cost 0 movement