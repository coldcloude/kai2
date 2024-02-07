import Random from "../k-math-random.js";
import { KAVLTree, bigintcmp } from "../k-tree.js";

function validate<K,V>(tree:KAVLTree<K,V>):string|void{
    let error:string|void = undefined;
    let node = tree.getLeast();
    while(node!==undefined){
        if(node._factor>1||node._factor<-1){
            error = "unbalance, factor="+node._factor;
            break;
        }
        let leftHeight = 0;
        let rightHeight = 0;
        if(node.left!==null){
            if(node.left.parent!==node){
                error = "this is "+node.key+", but left's parent is "+node.left.parent?.key;
                break;
            }
            if(node.left._side!==-1){
                error = "left's side is "+node.left._side;
                break;
            }
            leftHeight = node.left._height;
        }
        if(node.right!==null){
            if(node.right.parent!==node){
                error = "this is "+node.key+", but right's parent is "+node.right.parent?.key;
                break;
            }
            if(node.right._side!==1){
                error = "right's side is "+node.right._side;
                break;
            }
            rightHeight = node.right._height;
        }
        if(Math.max(leftHeight,rightHeight)+1!==node._height){
            error = "height wrong, left="+leftHeight+", right="+rightHeight+", height="+node._height;
            break;
        }
        if(rightHeight-leftHeight!==node._factor){
            error = "factor wrong, left="+leftHeight+", right="+rightHeight+", factor="+node._factor;
            break;
        }
        node = node.next();
    }
    if(error){
        return error;
    }
    let last:K|undefined = undefined;
    let r = tree.foreach((k:K)=>{
        if(last===undefined){
            last = k;
        }
        else{
            const sign = tree.compare(last,k);
            if(sign<0){
                last = k;
            }
            else{
                error = "wrong order, last="+last+", this="+k;
                return true;
            }
        }
    });
    if(r){
        return error;
    }
    last = undefined;
    r = tree.foreach((k:K)=>{
        if(last===undefined){
            last = k;
        }
        else{
            const sign = tree.compare(last,k);
            if(sign>0){
                last = k;
            }
            else{
                error = "wrong reverse order, last="+last+", this="+k;
                return true;
            }
        }
    },true);
    if(r){
        return error;
    }
}

export default function test(callback:()=>void,seed?:bigint){
    const rnd = new Random(seed);
    console.log(rnd.initSeed);
    const tree = new KAVLTree<bigint,undefined>(bigintcmp);
    let insertCorrect = 0;
    let insertWrong = 0;
    let deleteCorrect = 0;
    let deleteWrong = 0;
    for(let epoch=0; epoch<10000; epoch++){
        const inserts:bigint[] = [];
        const deletes:bigint[] = [];
        for(let i=0; i<10; i++){
            inserts.push(rnd.nextInt(100n));
            deletes.push(rnd.nextInt(100n));
        }
        for(const ins of inserts){
            try{
                tree.set(ins);
                const err = validate(tree);
                if(err){
                    console.log(err);
                }
                const rn = tree.get(ins);
                if(rn&&rn.key===ins){
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
                tree.get(del,true);
                const err = validate(tree);
                if(err){
                    console.log(err);
                }
                const rn = tree.get(del);
                if(rn===undefined){
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
    callback();
}
