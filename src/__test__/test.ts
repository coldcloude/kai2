import {min,KLoader} from "../index.js";

console.log(min(5,4,3,2,1));

console.log(min(...[5,4,3,2,1]));

const loader = new KLoader();

loader.onDone(()=>console.log("done"));

loader.load((cb)=>{
    setTimeout(()=>{
        console.log("triggered");
        cb();
    },3000);
});

loader.complete();
