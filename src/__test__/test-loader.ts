import { KConcurrent, KSequence } from "../k-runner.js";

export default function test(callback:()=>void){
    
    const start = Date.now();

    const all = KSequence([
        (cb:()=>void)=>{
            const time = (Date.now()-start)/1000;
            console.log("batch 0 start @ "+time+"s");
            setTimeout(cb,1000);
        },
        KConcurrent([
            KConcurrent([
                (cb:()=>void)=>{
                    const time = (Date.now()-start)/1000;
                    console.log("batch 1 task 0 start @ "+time+"s");
                    setTimeout(cb,500);
                },
                (cb:()=>void)=>{
                    const time = (Date.now()-start)/1000;
                    console.log("batch 1 task 1 start @ "+time+"s");
                    setTimeout(cb,1500);
                }
            ]),
            (cb:()=>void)=>{
                const time = (Date.now()-start)/1000;
                console.log("batch 2 start @ "+time+"s");
                setTimeout(cb,1000);
            }
        ]),
        (cb:()=>void)=>{
            const time = (Date.now()-start)/1000;
            console.log("batch 3 start @ "+time+"s");
            setTimeout(cb,1000);
        }
    ]);
    all(()=>{
        const time = (Date.now()-start)/1000;
        console.log("all done @ "+time+"s");
        callback();
    });
}
