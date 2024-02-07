import { min,max } from "../k-math.js";

export default function test(callback:()=>void){
    const minv1 = min(...[3,1,2,5,4]);
    console.log("min val 1 = "+minv1);
    const minv2 = min(3,1,2,5,4);
    console.log("min val 2 = "+minv2);
    const maxv1 = max(...[3,1,2,5,4]);
    console.log("max val 1 = "+maxv1);
    const maxv2 = max(3,1,2,5,4);
    console.log("max val 2 = "+maxv2);
    callback();
}
