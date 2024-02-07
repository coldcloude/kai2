import { KDependencyRunner } from "../k.js";

export default function test(callback:()=>void){

    const runner = new KDependencyRunner();
    
    const start = Date.now();

    runner.add(0,(cb:()=>void)=>{
        const time = (Date.now()-start)/1000;
        console.log("batch 0 start @ "+time+"s");
        setTimeout(cb,1000);
    });

    runner.add(1,(cb:()=>void)=>{
        const time = (Date.now()-start)/1000;
        console.log("batch 1 task 0 start @ "+time+"s");
        setTimeout(cb,500);
    });

    runner.add(1,(cb:()=>void)=>{
        const time = (Date.now()-start)/1000;
        console.log("batch 1 task 1 start @ "+time+"s");
        setTimeout(cb,1500);
    });

    runner.add(2,(cb:()=>void)=>{
        const time = (Date.now()-start)/1000;
        console.log("batch 2 start @ "+time+"s");
        setTimeout(cb,1000);
    });

    runner.add(3,(cb:()=>void)=>{
        const time = (Date.now()-start)/1000;
        console.log("batch 3 start @ "+time+"s");
        setTimeout(cb,1000);
    });

    runner.depend(1,[0]);
    runner.depend(2,[0]);
    runner.depend(3,[1,2]);

    runner.onDone(3,()=>{
        const time = (Date.now()-start)/1000;
        console.log("all done @ "+time+"s");
        callback();
    });

    runner.start(0);
}