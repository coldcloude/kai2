import Random from "../k-math-random.js";
import { bigintcmp } from "../k-tree.js";
import { KHashTable,biginthash } from "../k-hashtable.js";
import { KPair } from "../k.js";

function validate(table:KHashTable<bigint,bigint>):string|void{
    let error:string|void = undefined;
    let last:bigint|undefined = undefined;
    if(table.foreach((k:bigint,v:bigint)=>{
        if(last===undefined){
            last = v;
        }
        else{
            if(last-v<0){
                last = v;
            }
            else{
                error = "wrong order, last="+last+", this="+v;
                return true;
            }
        }
    })){
        return error;
    }
    last = undefined;
    if(table.foreach((k:bigint,v:bigint)=>{
        if(last===undefined){
            last = v;
        }
        else{
            if(last-v>0){
                last = v;
            }
            else{
                error = "wrong reverse order, last="+last+", this="+v;
                return true;
            }
        }
    },true)){
        return error;
    }
}

export default function test(seed?:bigint){
    const rnd = new Random(seed);
    console.log(rnd.initSeed);
    const table = new KHashTable<bigint,bigint>(bigintcmp,biginthash);
    let insertCorrect = 0;
    let insertWrong = 0;
    let deleteCorrect = 0;
    let deleteWrong = 0;
    let sn = 0n;
    for(let epoch=0; epoch<10000; epoch++){
        const inserts:KPair<bigint,bigint>[] = [];
        const deletes:bigint[] = [];
        for(let i=0; i<10; i++){
            inserts.push({key:rnd.nextInt(100n),value:sn});
            deletes.push(rnd.nextInt(100n));
            sn++;
        }
        for(const ins of inserts){
            try{
                table.set(ins.key,ins.value);
                const err = validate(table);
                if(err){
                    console.log(err);
                }
                if(table.contains(ins.key)){
                    insertCorrect++;
                }
                else{
                    insertWrong++;
                }
            }
            catch(e){
                console.log("curr: "+ins);
                throw e;
            }
        }
        for(const del of deletes){
            try{
                table.get(del,true);
                const err = validate(table);
                if(err){
                    console.log(err);
                }
                if(!table.contains(del)){
                    deleteCorrect++;
                }
                else{
                    deleteWrong++;
                }
            }
            catch(e){
                console.log("curr: "+del);
                throw e;
            }
        }
        if(epoch%1000===999){
            console.log("insert correct: "+insertCorrect+", "+"insert wrong: "+insertWrong+", "+"delete correct: "+deleteCorrect+", "+"delete wrong: "+deleteWrong);
        }
    }
    console.log("insert correct: "+insertCorrect+", "+"insert wrong: "+insertWrong+", "+"delete correct: "+deleteCorrect+", "+"delete wrong: "+deleteWrong);
}
