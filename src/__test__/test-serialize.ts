import { KObject } from "../k-serialize.js";

export default function testSerialize(){

    const r:KObject = {
        "num": 123,
        "str": "abc"
    };
    r["obj"] = {
        "n": 789,
        "s": "xyz"
    };
    r["arr"] = [
        456,
        "nml"
    ];
    r.obj.o = {"hello":"world"};
    
    console.log(JSON.stringify(r));
    
    for(const k in r){
        console.log(k+"="+r[k]);
    }
}
