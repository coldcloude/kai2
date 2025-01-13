export function memset<T>(a:T[],o:number,val:T,len:number){
	for(let i=0; i<len; i++){
		a[o+i] = val;
	}
}

export function memcpy<T>(ad:T[],od:number,as:T[],os:number,len:number){
	for(let i=0; i<len; i++){
		ad[od+i] = as[os+i];
	}
}

export const noop = ()=>{};

export type KPair<K,V> = {
	key:K,
	value:V
};

export const FALSE = 0;
export const TRUE = 1;

export function removeIf<T>(arr:T[],pred:(v:T)=>boolean):T[]{
	const removes:T[] = [];
	let src = 0;
	let dst = 0;
	while(src<arr.length){
		const v = arr[src];
		if(pred(v)){
			removes.push(v);
			src++;
		}
		else{
			if(dst!==src){
				arr[dst] = v;
			}
			src++;
			dst++;
		}
	}
	while(arr.length>dst){
		arr.pop();
	}
	return removes;
}
