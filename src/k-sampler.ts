import { Random } from "./k-math-random.js";
import { KBigIntTree } from "./k-tree.js";

export class KWeightSampler<T> {
    random:Random;
    total:bigint;
    tree = new KBigIntTree<T>();
    constructor(items:[bigint,T][],option?:{
        seed?:bigint,
        random?:Random
    }){
        this.random = option&&option.random?option.random:new Random(option?option.seed:undefined);
        this.total = 0n;
        for(const [w,t] of items){
            this.tree.set(this.total,t);
            this.total += w;
        }
    }
    reset(seed?:bigint){
        this.random = new Random(seed);
    }
    sample():T{
        const index = this.random.nextInt(this.total);
        return this.tree.getOrBefore(index)!.value;
    }
}
