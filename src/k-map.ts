import { KPair } from "./k.js";

export interface KMap<K,V> {
	size():number;
	set(k:K,v:V):void;
	contains(k:K):boolean;
	get(k:K,remove?:boolean,condition?:(k:K,v:V)=>boolean):V|undefined;
	getFirst(remove?:boolean,condition?:(k:K,v:V)=>boolean):KPair<K,V>|undefined;
	getLast(remove?:boolean,condition?:(k:K,v:V)=>boolean):KPair<K,V>|undefined;
	foreach(op:(k:K,v:V)=>boolean|void,reverse?:boolean):boolean;
	removeIf(pred:(k:K,v:V)=>boolean):void;
}

export class KSingletonMap<K,V> implements KMap<K,V>{
	key:K|undefined;
	value:V;
	constructor(k:K|undefined,v:V){
		this.key = k;
		this.value = v;
	}
	_get(k:K|undefined,remove?:boolean|undefined,condition?:((k:K,v:V)=>boolean)|undefined):KPair<K,V>|undefined{
		if(this.key==undefined){
			return undefined;
		}
		else{
			if(k!==undefined&&k!==this.key){
				return undefined;
			}
			else{
				const r = {key:this.key,value:this.value};
				if(remove&&(condition===undefined||condition(this.key,this.value))){
					this.key = undefined;
				}
				return r;
			}
		}
	}
	size(): number {
		return this.key===undefined?0:1;
	}
	set(k:K,v:V):void {
		this.key = k;
		this.value = v;
	}
	contains(k:K):boolean {
		return this.key===k;
	}
	get(k:K,remove?:boolean|undefined,condition?:((k:K,v:V)=>boolean)|undefined):V|undefined {
		const r = this._get(k,remove,condition);
		return r===undefined?undefined:r.value;
	}
	getFirst(remove?:boolean,condition?:(k:K,v:V)=>boolean):KPair<K,V>|undefined{
		return this._get(undefined,remove,condition);
	}
	getLast(remove?:boolean,condition?:(k:K,v:V)=>boolean):KPair<K,V>|undefined{
		return this._get(undefined,remove,condition);
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
