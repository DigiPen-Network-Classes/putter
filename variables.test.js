import { substituteString } from "./variables";

test('var substitution', ()=>{ 
    let str = "http://{{address}}:{{port}}";
    const dict = { "address": "foo", "port": "12345", "nothere" : "not in use" };

    let result = substituteString(str, dict);
    expect(result).toBe("http://foo:12345");
});



test('var substitution with unknowns', ()=>{ 
    let str = "http://{{address}}:{{port}}/{{notfound}}";
    const dict = { "address": "foo", "port": "12345", "nothere" : "not in use" };

    let result = substituteString(str, dict);
    expect(result).toBe("http://foo:12345/{{notfound}}");
});






