import { KList, KListNode, KPair, KMap } from "./k.js";
import { KAVLTree, KAVLTreeNode } from "./k-tree.js";

type HashNode<K,V> = KListNode<KPair<K,V>>;

type HashHandler<K,V> = {
    tree:KAVLTree<K,HashNode<K,V>>,
    node:KAVLTreeNode<K,HashNode<K,V>>|undefined
};

export class KHashTable<K,V> implements KMap<K,V> {
    compare:(a:K,b:K)=>number;
    hash:(k:K)=>number;
    lru:boolean = false;
    mask:number = 0xFF;
    capacity:number = 0x100;
    buckets:KAVLTree<K,HashNode<K,V>>[] = [];
    nodes:KList<KPair<K,V>> = new KList();
    count = 0;
    constructor(compare:(a:K,b:K)=>number,hash:(k:K)=>number,lru?:boolean){
        this.compare = compare;
        this.hash = hash;
        this.lru = !!lru;
        this._recapacity();
    }
    _enlarge(){
        this.capacity <<= 1;
        this.mask = (this.mask<<1)|1;
        this._recapacity();
        this._rehash();
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
        this.count--;
        //remove from tree
        hh.tree.removeNode(hh.node!);
        //remove from list
        this.nodes.removeNode(hh.node!.value!);
    }
    size(){
        return this.count;
    }
    set(k:K,v:V){
        //new node add to tail
        const hn = this.nodes.push({key:k,value:v});
        const found = this._find(k);
        if(found.node!==undefined){
            //key exists, replace node
            this.nodes.removeNode(found.node.value!);
            found.node.value = hn;
        }
        else{
            //key not exist, insert new node
            found.tree.set(k,hn);
            this.count++;
            //enlarge capacity
            if(this.count>(this.capacity>>2)+(this.capacity>>1)){
                this._enlarge();
            }
        }
    }
	contains(k:K):boolean{
        const found = this._find(k);
        return found.node!==undefined;
    }
    get(k:K,remove?:boolean,condition?:(k:K,v:V)=>boolean):V|undefined{
        const found = this._find(k);
        if(found.node===undefined){
            return undefined;
        }
        else{
            const hn = found.node.value!;
            //adjust least recent use
            if(!remove&&this.lru){
                this.nodes.removeNode(hn);
                this.nodes.insertNodeAfter(hn,null);
            }
            //remove
            if(remove&&(condition===undefined||condition(hn.value.key,hn.value.value))){
                this._remove(found);
            }
            return hn.value.value;
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
