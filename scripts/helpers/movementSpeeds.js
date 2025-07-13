// Small files with helper functions to parse the movement speed paths and get the values.

/*
Specific uses: 
    {getTokenSpeed} by render.js
        Gets the specific speed for that token. Returns 0 if the speed doesn't exist. 
    { getActorFlags } by tokenHUD.js
        If there is no flag it sets it, and returns the default value. Else Gets the flag makes sure the movements and movement speeds are up to date
*/


export function getTokenSpeed(tokenId, speed){
    const speeds = getTokenSpeeds(tokenId);
    
    if(speed === undefined){
        speed = game.settings.get("athenas-movement-trail", "movementPaths").default.label
    }

    if(speed in speeds)
        return speeds[speed]
    else
        return 0

}
function getTokenSpeeds(tokenId){
    const actor = canvas.tokens.get(tokenId).actor;
    if (actor === undefined){
        let defaultLabel = game.settings.get("athenas-movement-trail", "movementPaths").default.label;
        return {
            [defaultLabel] : 0
        }
    }
    const unparsedPaths = game.settings.get("athenas-movement-trail", "movementPaths");
    return parsePaths(unparsedPaths, actor)
}
function parsePaths(unparsedPaths, actor){
    let speeds = {}

    unparsedPaths.movementSpeeds.forEach(entry => {
        if(entry.type === 'manual'){
            speeds[entry.label] = parsePath(entry.path, actor);
        }
        else if (entry.type === 'dictionary'){
            let actorSpeeds = parsePath(entry.path, actor);
            for(let speed in actorSpeeds){
                speeds[speed] = parsePath("." + speed + entry.value.trim(), actorSpeeds);
            }
        }
        else if(entry.type === "array"){
            let actorSpeeds = parsePath(entry.path, actor);
            console.log(actorSpeeds)
            console.log(entry.label)
            for(let i =0; i< actorSpeeds.length; i++){
                speeds[actorSpeeds[i][entry.label.trim().slice(1)]] = actorSpeeds[i][entry.value.trim().slice(1)];
            }
        }
    });
    speeds[unparsedPaths.default.label] = parsePath(unparsedPaths.default.path, actor);

    return speeds
}

function parsePath(path, startPoint){
    return path.split('.').filter(Boolean).reduce((acc, key) => acc[key], startPoint) || 0;
}

export async function getActorFlags(tokenId){
    console.log('getActorFlags called');
    let actor = canvas.tokens.get(tokenId).actor
    console.log(actor)
    let data = actor.getFlag("athenas-movement-trail", "actorSpeeds")

     if (data === undefined)
        data = defaultActorFlag(tokenId)
    else
        data["speedData"] = updateSpeedList(tokenId, data["speedData"])
  
    console.log("Pre setFlag");
    //actor.setFlag("athenas-movement-trail", "actorSpeeds", data);
    console.log("Post setFlag")
    return data
}

function defaultActorFlag(tokenId){
    console.log('defaultActorFlag called');
  let speeds = getTokenSpeeds(tokenId)

  let flags = {
    currentMovement : Object.entries(speeds).reduce((max, [key, value]) => {return value > speeds[max] ? key : max;}, Object.keys(speeds)[0]), //hightest available speed 
    initPenalty : 0,
    globalBonus: 0, 
    speedData : {}
  }
  for(let speed in speeds){
    flags.speedData[speed] = {multiplier: 1, speed: speeds[speed]}
  }
  return flags
}

function updateSpeedList(tokenId, speedData){
    console.log("UpdateSpeedList called")
  let speeds = getTokenSpeeds(tokenId)
  let rSpeedData = {}

  for(let speed in speeds){
    if(speed in speedData)
      rSpeedData[speed] = {multiplier: speedData[speed].multiplier, speed: speeds[speed]}
    else
      rSpeedData[speed] = {multiplier: 1, speed: speeds[speed]}
  }
  return rSpeedData
}