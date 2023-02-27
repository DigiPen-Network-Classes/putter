
test('example test', ()=> {

    const regex = /{{\w+}}/g;
    

    let matches = str.match(regex);
    matches.forEach(match => {
        let val = dict[match.replace("{{", "").replace("}}", "")];
        console.log(val);
        str = str.replace(match, val);
    });
    console.log(str);
    
});