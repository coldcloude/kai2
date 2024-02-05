import { KLoader } from "../k.js";

export default function test(){

    const loader = new KLoader();
    
    const start = new Date();

    loader.onDone(()=>{
        const end = new Date();
        console.log("load elapse time = "+(end.getTime()-start.getTime())/1000.0+"s");
    });

    loader.load((cb)=>{
        setTimeout(()=>{
            console.log("triggered");
            cb();
        },3000);
    });
    
    loader.complete();
}