import { KPair } from "./k.js";

export function testRemove<K,V>(k:K,v:V,remove?:boolean,condition?:(k:K,v:V)=>boolean){
    return remove&&(condition===undefined||condition(k,v));
}

export abstract class KMap<K,V> {
	size:number = 0;
    abstract compute(k:K,op:(kvp:KPair<K,V>|undefined)=>KPair<K,V>|undefined,readonly?:boolean):KPair<K,V>|undefined;
	set(k:K,v:V){
        this.compute(k,()=>{
            return {key:k,value:v};
        });
    }
	getPair(k:K,remove?:boolean,condition?:(k:K,v:V)=>boolean):KPair<K,V>|undefined{
        return this.compute(k,(kvp:KPair<K,V>|undefined)=>{
            if(kvp==undefined){
                return undefined;
            }
            else{
                if(testRemove(kvp.key,kvp.value,remove,condition)){
                    return undefined;
                }
                else{
                    return kvp;
                }
            }
        },true);
    }
	contains(k:K){
        return this.getPair(k)!==undefined;
    }
	get(k:K,remove?:boolean,condition?:(k:K,v:V)=>boolean):V|undefined{
        const kvp = this.getPair(k,remove,condition);
        return kvp===undefined?undefined:kvp.value;
    }
	computeIfAbsent(k:K,creator:(kk?:K)=>V|undefined):V|undefined{
		const rkv = this.compute(k,kv=>{
			if(kv===undefined){
				const v = creator(k);
				kv = v===undefined?undefined:{
					key: k,
					value: v
				};
			}
			return kv;
		});
		return rkv===undefined?undefined:rkv.value;
	}
	abstract foreach(op:(k:K,v:V)=>boolean|void,reverse?:boolean):boolean;
	abstract removeIf(pred:(k:K,v:V)=>boolean):void;
	keyToArray():K[]{
		const arr:K[] = [];
		this.foreach((k)=>{
			arr.push(k);
		});
		return arr;
	}
	valueToArray():V[]{
		const arr:V[] = [];
		this.foreach((k,v)=>{
			arr.push(v);
		});
		return arr;
	}
	entryToArray():[K,V][]{
		const arr:[K,V][] = [];
		this.foreach((k,v)=>{
			arr.push([k,v]);
		});
		return arr;
	}
	fromArray(arr:[K,V][]){
		for(const [k,v] of arr){
			this.set(k,v);
		}
	}
}

export class KSingletonMap<K,V> extends KMap<K,V>{
	key:K|undefined;
	value:V;
	constructor(k:K|undefined,v:V){
		super();
		this.key = k;
		this.value = v;
		this.size = k===undefined?0:1;
	}
	remove(){
		this.key = undefined;
		this.size = 0;
	}
	peek(remove?:boolean,condition?:(k:K,v:V)=>boolean):KPair<K,V>|undefined{
		if(this.key===undefined){
			return undefined;
		}
		else{
			const curr = {key:this.key,value:this.value};
			if(testRemove(this.key,this.value,remove,condition)){
				this.remove();
			}
			return curr;
		}
	}
    compute(k:K,op:(kvp:KPair<K,V>|undefined)=>KPair<K,V>|undefined):KPair<K,V>|undefined{
		if(this.key===undefined||k!==this.key){
			//not found, skip or insert
			const r = op(undefined);
			if(r!==undefined){
				this.key = r.key;
				this.value = r.value;
				this.size = 1;
			}
			return r;
		}
		else{
			//found, remove or replace
			const curr = {key:this.key,value:this.value};
			const r = op(curr);
			if(r===undefined){
				this.remove();
			}
			else{
				this.key = r.key;
				this.value = r.value;
			}
			return curr;
		}
	}
	foreach(op:(k:K,v:V)=>boolean|void):boolean {
		if(this.key!==undefined){
			return !!op(this.key,this.value);
		}
		else{
			return false;
		}
	}
	removeIf(pred:(k:K,v:V)=>boolean):void {
		if(this.key!==undefined&&pred(this.key,this.value)){
			this.key = undefined;
		}
	}
}
