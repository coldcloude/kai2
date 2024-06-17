import Decimal from "decimal.js";
import NormalDistribution from "../k-numeric/k-numeric-hp-dist-norm.js";
import { ZERO } from "../k-numeric/k-numeric-hp.js";
import { histogramFixed,percents } from "../k-statistic.js";
import { toFixed } from "../k-math.js";

export default function testNormalDistribution(){
    const dist = new NormalDistribution(ZERO,new Decimal(100));
    console.log("cumulative probability = "+dist.cumulativeProbability(new Decimal(68)));
    console.log("inverse cumulative probability = "+dist.inverseCumulativeProbability(new Decimal(0.75)));
    console.log("probability = "+dist.probability(new Decimal(-68),new Decimal(68)));
    const vals:number[] = [];
    for(let i=0; i<100000; i++){
        vals.push(dist.sample().toNumber());
    }
    const h = histogramFixed(11,-500,500,vals);
    console.log(toFixed(h.min,2)+" ["+h.histo.join(" ")+"] "+toFixed(h.max,2));
    const poss = [0,5,25,50,75,95,100];
    const ps = percents(poss,vals);
    let pps = "";
    let pvs = "";
    for(const p of ps){
        pps += p.percent+"%\t\t";
        pvs += toFixed(p.value,2)+"\t\t";
    }
    console.log(pps);
    console.log(pvs);
}