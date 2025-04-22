import { biginthash, KHashTable, KNumTable, KStrTable, numhash, strhash } from "./k-hashtable.js";
import { KList } from "./k-list.js";
import { KMap } from "./k-map.js";
import { bigintcmp, KAVLTree, KNumTree, numcmp, strcmp } from "./k-tree.js";

export type KValue = number|string|KObject|KValue[];

export interface KObject {
	[key:string]: KValue
}

export interface KSerializable {
    serialize():KObject;
}

export function arraySerialize<T extends KSerializable>(list:T[]):KValue[]{
    const arr:KValue[] = [];
    for(const v of list){
        arr.push(v.serialize());
    }
    return arr;
}

export function deserializeArray<T>(arr:KValue[],op:(v:KValue)=>T):T[]{
    const list:T[] = [];
    for(const v of arr){
        list.push(op(v));
    }
    return list;
}

export function listSerialize<T>(list:KList<T>,op:(v:T)=>KValue):KValue[]{
    const arr:KValue[] = [];
    list.foreach(v=>{
        arr.push(op(v));
    });
    return arr;
}

export function objListSerialize<T extends KSerializable>(list:KList<T>):KValue[]{
    return listSerialize(list,v=>v.serialize());
}

export function valListSerialize(list:KList<KValue>):KValue[]{
    return listSerialize(list,v=>v);
}

export function deserializeList<T>(arr:KValue[],op:(v:KValue)=>T):KList<T>{
    const list = new KList<T>();
    for(const v of arr){
        list.push(op(v));
    }
    return list;
}

export function mapSerialize<T>(map:KMap<string,T>,op:(v:T)=>KValue):KObject{
    const obj:KObject = {};
    map.foreach((k,v)=>{
        obj[k] = op(v);
    });
    return obj;
}

export function objMapSerialize<T extends KSerializable>(map:KMap<string,T>):KObject{
    return mapSerialize(map,v=>v.serialize());
}

export function valMapSerialize(map:KMap<string,KValue>):KObject{
    return mapSerialize(map,v=>v);
}

export function deserializeMap<T>(obj:KObject,op:(v:KValue)=>T):KMap<string,T>{
    const map = new KStrTable<T>();
    for(const k in obj){
        map.set(k,op(obj[k]));
    }
    return map;
}

export function setFromArray<K>(arr:K[],cmp:(a:K,b:K)=>number,hash?:(k:K)=>number):KMap<K,boolean>{
	const set = hash?new KHashTable<K,boolean>(cmp,hash):new KAVLTree<K,boolean>(cmp);
    for(const k of arr){
        set.set(k,true);
    }
    return set;
}

export function setFromNumArray(arr:number[]):KMap<number,boolean>{
    return setFromArray(arr,numcmp,numhash);
}

export function setFromStrArray(arr:string[]):KMap<string,boolean>{
    return setFromArray(arr,strcmp,strhash);
}

export function setFromBigIntArray(arr:bigint[]):KMap<bigint,boolean>{
    return setFromArray(arr,bigintcmp,biginthash);
}

export function mapFromArray<K,T>(arr:[K,T][],cmp:(a:K,b:K)=>number,hash?:(k:K)=>number):KMap<K,T>{
	const map = hash?new KHashTable<K,T>(cmp,hash):new KAVLTree<K,T>(cmp);
    for(const [k,v] of arr){
        map.set(k,v);
    }
    return map;
}

export function mapFromNumArray<T>(arr:[number,T][]):KMap<number,T>{
    return mapFromArray(arr,numcmp,numhash);
}

export function mapFromStrArray<T>(arr:[string,T][]):KMap<string,T>{
    return mapFromArray(arr,strcmp,strhash);
}

export function mapFromBigIntArray<T>(arr:[bigint,T][]):KMap<bigint,T>{
    return mapFromArray(arr,bigintcmp,biginthash);
}

export function indexMapFromArray<T>(arr:T[],keepOrder?:boolean):KMap<number,T>{
	const map = keepOrder?new KNumTree<T>():new KNumTable<T>();
    for(let i=0; i<arr.length; i++){
        map.set(i,arr[i]);
    }
    return map;
}
