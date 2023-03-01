
// find all {{key}} and replace them with appropriate dict[key]
export function substituteString(str, dict) {
    // now we have two problems
    const regex = /{{\w+}}/g;
    let matches = str.match(regex);
    if (matches === null) {
        return str;
    }
    matches.forEach(match => {
        let val = dict.get(match.replace("{{", "").replace("}}", ""));
        if (val != undefined) {
            str = str.replace(match, val);
        }
    }); 
    return str;
}

// given a bunch of "key=value" structures,
// turn them into object of { "key": "value"}
export function convertHeaders(keyvalues) {
    let result = {};
    if (keyvalues !== null) {
       keyvalues.forEach(kv => {
            result[kv.key] = kv.value;
        });
    }
    return result;
}