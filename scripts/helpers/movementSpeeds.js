
export function getTokenSpeed(tokenId, speed){
    //const actor = canvas.tokens.get(tokenId).actor;
    //if (actor === undefined){
        let defaultLabel = game.settings.get("athenas-movement-trail", "movementPaths").default.label;
        return {
            [defaultLabel] : 0
        }
    //}

}
export function getTokenSpeeds(tokenId){
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