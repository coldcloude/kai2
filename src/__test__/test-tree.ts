import Random from "../k-math-random.js";
import { KTree, KTreeNode } from "../k-avltree.js";

function validate<K,V>(tree:KTree<K,V>):string|void{
    let last:KTreeNode<K,V>|undefined = undefined;
    let error = "";
    const r = tree.forEach((node)=>{
        if(node._factor>1||node._factor<-1){
            error = "unbalance, factor="+node._factor;
            return true;
        }
        let leftHeight = 0;
        let rightHeight = 0;
        if(node.left!==null){
            if(node.left.parent!==node){
                error = "this is "+node.key+", but left's parent is "+node.left.parent?.key;
                return true;
            }
            if(node.left._side!==-1){
                error = "left's side is "+node.left._side;
                return true;
            }
            leftHeight = node.left._height;
        }
        if(node.right!==null){
            if(node.right.parent!==node){
                error = "this is "+node.key+", but right's parent is "+node.right.parent?.key;
                return true;
            }
            if(node.right._side!==1){
                error = "right's side is "+node.right._side;
                return true;
            }
            rightHeight = node.right._height;
        }
        if(Math.max(leftHeight,rightHeight)+1!==node._height){
            error = "height wrong, left="+leftHeight+", right="+rightHeight+", height="+node._height;
            return true;
        }
        if(rightHeight-leftHeight!==node._factor){
            error = "factor wrong, left="+leftHeight+", right="+rightHeight+", factor="+node._factor;
            return true;
        }
        if(last===undefined){
            last = node;
        }
        else{
            const sign = tree.compare(last.key,node.key);
            if(sign<0){
                last = node;
            }
            else{
                error = "wrong order, last="+last.key+", this="+node.key;
                return true;
            }
        }
    });
    if(r){
        return error;
    }
}

export default function test(seed?:bigint){
    const rnd = new Random(seed);
    console.log("seed = "+rnd.initSeed);
    const tree = new KTree<bigint,undefined>((a,b)=>{
        const sign = a-b;
        return sign===0n?0:sign<0?-1:1;
    });
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
}
