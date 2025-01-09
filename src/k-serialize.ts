import { KHashTable, strhash } from "./k-hashtable.js";
import { KList } from "./k-list.js";
import { KMap } from "./k-map.js";
import { strcmp } from "./k-tree.js";

export type KValue = number|string|KObject|KValue[];

export interface KObject {
	[key:string]: KValue
}

export interface KSerializable {
    toObj():KObject;
}

export function rawToArray<T extends KSerializable>(list:T[]):KValue[]{
    const arr:KValue[] = [];
    for(const v of list){
        arr.push(v.toObj());
    }
    return arr;
}

export function rawFromArray<T>(arr:KValue[],op:(v:KValue)=>T):T[]{
    const list:T[] = [];
    for(const v of arr){
        list.push(op(v));
    }
    return list;
}

export function toArray<T>(list:KList<T>,op:(v:T)=>KValue):KValue[]{
    const arr:KValue[] = [];
    list.foreach(v=>{
        arr.push(op(v));
    });
    return arr;
}

export function toObjArray<T extends KSerializable>(list:KList<T>):KValue[]{
    return toArray(list,v=>v.toObj());
}

export function toValArray(list:KList<KValue>):KValue[]{
    return toArray(list,v=>v);
}

export function fromArray<T>(arr:KValue[],op:(v:KValue)=>T):KList<T>{
    const list = new KList<T>();
    for(const v of arr){
        list.push(op(v));
    }
    return list;
}

export function toObject<T>(map:KMap<string,T>,op:(v:T)=>KValue):KObject{
    const obj:KObject = {};
    map.foreach((k,v)=>{
        obj[k] = op(v);
    });
    return obj;
}

export function toObjObject<T extends KSerializable>(map:KMap<string,T>):KObject{
    return toObject(map,v=>v.toObj());
}

export function toValObject(map:KMap<string,KValue>):KObject{
    return toObject(map,v=>v);
}

export function fromObject<T>(obj:KObject,op:(v:KValue)=>T):KMap<string,T>{
    const map = new KHashTable<string,T>(strcmp,strhash);
    for(const k in obj){
        map.set(k,op(obj[k]));
    }
    return map;
}

export function setFromArray<K>(arr:K[],cmp:(a:K,b:K)=>number,hash:(k:K)=>number):KMap<K,void>{
	const set = new KHashTable<K,void>(cmp,hash);
    for(const k of arr){
        set.set(k);
    }
    return set;
}
