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
