
export function substituteString(str, dict) {
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

export function convertHeaders(keyvalues) {
    let result = {};
    if (keyvalues !== null) {
       keyvalues.forEach(kv => {
            result[kv.key] = kv.value;
        });
    }
    return result;
}