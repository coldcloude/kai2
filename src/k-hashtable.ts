import { KPair } from "./k.js";
import { KMap } from "./k-map.js";
import { KList, KListNode } from "./k-list.js";
import { KAVLTree, KAVLTreeNode } from "./k-tree.js";

type HashNode<K,V> = KListNode<KPair<K,V>>;

type HashHandler<K,V> = {
    tree:KAVLTree<K,HashNode<K,V>>,
    node:KAVLTreeNode<K,HashNode<K,V>>|undefined
};

export class KHashTable<K,V> extends KMap<K,V> {
    compare:(a:K,b:K)=>number;
    hash:(k:K)=>number;
    lru:boolean = false;
    mask:number = 0xFF;
    capacity:number = 0x100;
    buckets:KAVLTree<K,HashNode<K,V>>[] = [];
    nodes:KList<KPair<K,V>> = new KList();
    constructor(compare:(a:K,b:K)=>number,hash:(k:K)=>number,lru?:boolean){
        super();
        this.compare = compare;
        this.hash = hash;
        this.lru = !!lru;
        this._recapacity();
    }
    _enlarge(){
        this.size++;
        //enlarge capacity
        if(this.size>(this.capacity>>2)+(this.capacity>>1)){
            this.capacity <<= 1;
            this.mask = (this.mask<<1)|1;
            this._recapacity();
            this._rehash();
        }
    }
    _recapacity(){
        const rest = this.capacity-this.buckets.length;
        for(let i=0; i<rest; i++){
            this.buckets.push(new KAVLTree<K,HashNode<K,V>>(this.compare));
        }
    }
    _rehash(){
        const size = this.capacity>>1;
        for(let i=0; i<size; i++){
            const tree = this.buckets[i];
            tree.removeIf((k:K,hn:HashNode<K,V>)=>{
                const hash = this.hash(k)|0;
                const index = hash&this.mask;
                if(index!==i){
                    //insert new
                    this.buckets[index].set(k,hn);
                    return true;
                }
                return false;
            });
        }
    }
    _find(k:K):HashHandler<K,V>{
        const hash = this.hash(k)|0;
        const index = hash&this.mask;
        const tree = this.buckets[index];
        const node = tree.getNode(k);
        return {tree:tree,node:node};
    }
    _remove(hh:HashHandler<K,V>){
        this.size--;
        //remove from tree
        hh.tree.removeNode(hh.node!);
        //remove from list
        this.nodes.removeNode(hh.node!.value!);
    }
    compute(k:K,op:(kvp:KPair<K,V>|undefined)=>KPair<K,V>|undefined,readonly?:boolean):KPair<K,V>|undefined{
        const found = this._find(k);
        if(found.node===undefined){
            //not found, skip or insert
			const r = op(undefined);
			if(r!==undefined){
                const hn = new KListNode(r);
                if(this.lru){
                    //oder by time desc
                    this.nodes.insertNodeAfter(hn,null);
                }
                else{
                    //order by time asc
                    this.nodes.insertNodeBefore(hn,null);
                }
                found.tree.set(k,hn);
                this._enlarge();
            }
            return r;
        }
        else{
            const hn = found.node.value;
			const r = op(hn.value);
			//found, remove or replace
            if(r===undefined){
                this._remove(found);
            }
            else{
                if(this.lru){
                    //order by use time desc
                    this.nodes.removeNode(hn);
                    this.nodes.insertNodeAfter(hn,null);
                }
                else {
                    //order by set time asc
                    if(!readonly){
                        this.nodes.removeNode(hn);
                        this.nodes.insertNodeBefore(hn,null);
                    }
                }
                hn.value = r;
            }
            return hn.value;
        }
    }
    getFirst(remove?:boolean,condition?:(k:K,v:V)=>boolean):KPair<K,V>|undefined{
        const hn = this.nodes.head;
        if(hn===null){
            return undefined;
        }
        else{
            if(remove&&(condition===undefined||condition(hn.value.key,hn.value.value))){
                const found = this._find(hn.value.key);
                this._remove(found);
            }
            return hn.value;
        }
    }
    getLast(remove?:boolean,condition?:(k:K,v:V)=>boolean):KPair<K,V>|undefined{
        const hn = this.nodes.tail;
        if(hn===null){
            return undefined;
        }
        else{
            if(remove&&(condition===undefined||condition(hn.value.key,hn.value.value))){
                const found = this._find(hn.value.key);
                this._remove(found);
            }
            return hn.value;
        }
    }
    foreach(op:(k:K,v:V)=>boolean|void,reverse?:boolean):boolean{
        return this.nodes.foreach((kvp:KPair<K,V>)=>op(kvp.key,kvp.value),reverse);
    }
    removeIf(pred:(k:K,v:V)=>boolean){
        for(let i=0; i<this.buckets.length; i++){
            const tree = this.buckets[i];
            tree.removeIf((k:K,hn:HashNode<K,V>)=>{
                if(pred(hn.value.key,hn.value.value)){
                    this.nodes.removeNode(hn!);
                    return true;
                }
                else{
                    return false;
                }
            });
        }
    }
}

export const numhash = (num:number)=>{
	return num&0x7FFFFFFF;
};

export const strhash = (str:string)=>{
    let h = 0;
    for(let i=0; i<str.length; i++) {
        h = (31*h+str.charCodeAt(i)|0)&0x7FFFFFFF;
    }
    return h;
};

export const biginthash = (num:bigint)=>{
    return Number(num&0x7FFFFFFFn);
};
