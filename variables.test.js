import { substituteString, convertHeaders} from "./variables";

test('var substitution', ()=>{ 
    let str = "http://{{address}}:{{port}}";
    const dict = new Map();
    dict.set("address", "foo");
    dict.set("port", "12345");
    dict.set("nothere", "not in use");

    let result = substituteString(str, dict);

    expect(result).toBe("http://foo:12345");
});



test('var substitution with unknowns', ()=>{ 
    let str = "http://{{address}}:{{port}}/{{notfound}}";
    const dict = new Map();
    dict.set("address", "foo");
    dict.set("port", "12345");
    dict.set("nothere", "not in use");
    
    let result = substituteString(str, dict);
    
    expect(result).toBe("http://foo:12345/{{notfound}}");
});



test('keyvalue headers', () => {
    let headers = [
        {
            "key": "Content-Type",
            "value": "application/json"
        },
        {
            "key": "Parameter",
            "value": "someValue"
        }
    ];
    
    let dict = convertHeaders(headers);
    expect(dict["Content-Type"]).toBe("application/json");
    expect(dict["Parameter"]).toBe("someValue");

});



