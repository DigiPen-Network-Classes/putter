
export function substituteString(str, dict) {
    const regex = /{{\w+}}/g;
    str.match(regex).forEach(match => {
        let val = dict.get(match.replace("{{", "").replace("}}", ""));
        if (val != undefined) {
            str = str.replace(match, val);
        }
    }); 
    return str;
}

export function convertHeaders(keyvalues) {
    let result = {};
    keyvalues.forEach(kv => {
        result[kv.key] = kv.value;
    });
    return result;
}