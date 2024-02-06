import { KLoader } from "../k.js";

export default function test(){

    const loader = new KLoader();
    
    const start = new Date();

    loader.load((cb)=>{
        setTimeout(()=>{
            console.log("triggered");
            cb();
        },3000);
    });

    loader.onDone(()=>{
        const end = new Date();
        console.log("time elapsed = "+(end.getTime()-start.getTime())/1000.0+"s");
    });
    
    loader.complete();

    console.log("loaded");
}