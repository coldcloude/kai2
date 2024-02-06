import { KList, KListNode } from "./k.js";
import { KAVLTree, KAVLTreeNode } from "./k-tree.js";

type P<K,V> = {key:K,value?:V};

type HashNode<K,V> = KListNode<P<K,V>>;

export class KHashTableRecord<K,V>{
    key:K;
    value:V|undefined;
    remove:()=>void;
    prev:()=>(KHashTableRecord<K,V>|undefined);
    next:()=>(KHashTableRecord<K,V>|undefined);
    constructor(table:KHashTable<K,V>,tree:KAVLTree<HashNode<K,V>,undefined>,node:KAVLTreeNode<HashNode<K,V>,undefined>){
        this.key = node.key.value.key;
        this.value = node.key.value.value;
        this.remove = ()=>{
            table.size--;
            //remove from tree
            tree.remove(node);
            //remove from list
            table.nodes.remove(node.key);
            //remove this remove
            this.remove = ()=>{};
        };
        this.prev = ()=>{
            const prev = node.key.prev;
            if(prev===null){
                return undefined;
            }
            else{
                return table.get(prev.value.key);
            }
        };
        this.next = ()=>{
            const next = node.key.next;
            if(next===null){
                return undefined;
            }
            else{
                return table.get(next.value.key);
            }
        };
    }
}

export class KHashTable<K,V>{
    compare:(a:K,b:K)=>number;
    hash:(k:K)=>number;
    lru:boolean = false;
    mask:number = 0xFF;
    capacity:number = 0x100;
    backets:KAVLTree<HashNode<K,V>,undefined>[] = [];
    nodes:KList<P<K,V>> = new KList();
    size = 0;
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
        for(let i=0; i<this.capacity-this.backets.length; i++){
            this.backets.push(new KAVLTree<HashNode<K,V>,undefined>((n1,n2)=>{
                return this.compare(n1.value.key,n2.value.key);
            }));
        }
    }
    _rehash(){
        const size = this.capacity>>1;
        for(let i=0; i<size; i++){
            const tree = this.backets[i];
            tree.removeIf((hn:HashNode<K,V>)=>{
                const hash = this.hash(hn.value.key)|0;
                const index = hash&this.mask;
                if(index!==i){
                    //insert new
                    this.backets[index].set(hn);
                    return true;
                }
                return false;
            });
        }
    }
    _find(k:K):{tree:KAVLTree<HashNode<K,V>,undefined>,node:KAVLTreeNode<HashNode<K,V>,undefined>|undefined}{
        const hash = this.hash(k)|0;
        const index = hash&this.mask;
        const tree = this.backets[index];
        const node = tree.get(new KListNode({key:k,value:undefined}));
        return {tree:tree,node:node};
    }
    set(k:K,v:V){
        //new node add to tail
        const hn = this.nodes.push({key:k,value:v});
        const found = this._find(k);
        if(found.node!==undefined){
            //key exists, replace node
            this.nodes.remove(found.node.key);
            found.node.key = hn;
        }
        else{
            //key not exist, insert new node
            found.tree.set(hn);
            this.size++;
            //enlarge capacity
            if(this.size>(this.capacity>>2)*3){
                this._enlarge();
            }
        }
    }
    get(k:K,remove?:boolean):KHashTableRecord<K,V>|undefined{
        const found = this._find(k);
        if(found.node===undefined){
            return undefined;
        }
        else{
            //adjust least recent use
            if(!remove&&this.lru){
                this.nodes.remove(found.node.key);
                this.nodes.insertNodeAfter(found.node.key,null);
            }
            //return
            const r = new KHashTableRecord(this,found.tree,found.node);
            if(remove){
                r.remove();
            }
            return r;
        }
    }
    getFirst(remove?:boolean):KHashTableRecord<K,V>|undefined{
        if(this.nodes.head===null){
            return undefined;
        }
        else{
            const r = this.get(this.nodes.head.value.key)!;
            if(remove){
                r.remove();
            }
            return r;
        }
    }
    getLast(remove?:boolean):KHashTableRecord<K,V>|undefined{
        if(this.nodes.tail===null){
            return undefined;
        }
        else{
            const r = this.get(this.nodes.tail.value.key)!;
            if(remove){
                r.remove();
            }
            return r;
        }
    }
    foreach(op:(kvp:P<K,V>)=>boolean|void,reverse?:boolean){
        return this.nodes.foreach(($:HashNode<K,V>)=>{
            op($.value);
        },reverse);
    }
    removeIf(pred:(kvp:P<K,V>)=>boolean){
        for(let i=0; i<this.backets.length; i++){
            const tree = this.backets[i];
            tree.removeIf((hn:HashNode<K,V>)=>{
                if(pred(hn.value)){
                    this.nodes.remove(hn);
                    return true;
                }
                else{
                    return false;
                }
            });
        }
    }
}