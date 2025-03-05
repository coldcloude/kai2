import { arrayStream } from "./k-iterator.js";
import { KNumTree } from "./k-tree.js";

export type Histogram = {
    min: number,
    max: number,
    histo: number[]
};

export function histogramFixed(n:number,min:number,max:number,...valss:number[][]):Histogram{
    const histo:number[] = [];
    for(let i=0; i<(n|0); i++){
        histo.push(0);
    }
    if(valss.length>0&&!isNaN(min)&&!isNaN(max)){
        if(!isNaN(min)&&!isNaN(max)){
            const gap = (max-min)/n;
            arrayStream(valss).flatMap((vals)=>arrayStream(vals)).foreach(function(v){
                if(!isNaN(v)){
                    const index = Math.max(0,Math.min(n-1,Math.floor((v-min)/gap)|0));
                    histo[index]++;
                }
            });
        }
    }
    return {
        min: min,
        max: max,
        histo: histo
    };
}

export function histogram(n:number,...valss:number[][]):Histogram{
    let min = Number.NaN;
    let max = Number.NaN;
    if(valss.length>0){
        arrayStream(valss).flatMap((vals)=>arrayStream(vals)).foreach(function(v){
            if(!isNaN(v)){
                if(isNaN(min)||v<min){
                    min = v;
                }
                if(isNaN(max)||max<v){
                    max = v;
                }
            }
        });
    }
    return histogramFixed(n,min,max,...valss);
}

export type PercentValue = {
    percent: number,
    value: number
};

export function percents(poss:number[],...valss:number[][]):PercentValue[]{
    
    let size = 0;
    const vset = new KNumTree<number>();
    arrayStream(valss).flatMap((vals)=>arrayStream(vals)).foreach(function(v){
        if(!isNaN(v)){
            vset.compute(v,(kv)=>{
                if(kv===undefined){
                    kv = {
                        key: v,
                        value: 1
                    };
                }
                else{
                    kv.value += 1;
                }
                return kv;
            });
            size++;
        }
    });

    const pset = new KNumTree<number>();
    for(const pos of poss){
        const index = Math.max(0,Math.min(size-1,Math.round((size-1)*pos*0.01)|0));
        pset.set(index,pos);
    }

    let offset = 0;
    let vnode = vset.getLeastNode();
    let pnode = pset.getLeastNode();
    const rst:PercentValue[] = [];
    while(pnode!==undefined&&vnode!==undefined){
        const val = vnode.key;
        const cnt = vnode.value;
        const index = pnode.key;
        const pos = pnode.value;
        if(index<offset+cnt){
            //matched
            rst.push({
                percent: pos,
                value: val
            });
            pnode = pnode.next();
        }
        else{
            offset += cnt;
            vnode = vnode.next();
        }
    }
    return rst;
}
