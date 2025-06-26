

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
- [ ] Find a way to hide fields in foundry setting page. 
- [ ] If a combatant is removed from the turn tracker, add it to the list of untracked combatants 



BUGS:
- [ ] Does not sync properly when the tab is inactive
- [ ] point to grid occasionally breaks when spamming arrow keys. Potentially not calling the snapping function first? 
      Pixel coordinates appear to  be stable
      Bug seems to happen when pressing 3 buttons simultaneously 
- [X] Will merge the path without taking into account walls 
   - [ ] Does not account for large creatures. Will only take the middle of the top left square into account.  
- [X] Movement via ruler that was blocked by walls was still added as if the movement went though. 
      Fixed the race condition that properly implementing this caused
- [X] If combatant has not been registered the ruler movement does not work.   