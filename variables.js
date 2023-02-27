
export function substituteString(str, dict) {
    const regex = /{{\w+}}/g;
    str.match(regex).forEach(match => {
        let val = dict[match.replace("{{", "").replace("}}", "")];
        if (val != undefined) {
            str = str.replace(match, val);
        }
    }); 
    return str;
}