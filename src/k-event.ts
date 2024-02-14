import { KList } from "./k-list.js";

export type KEventHandler = {
	cancel:()=>void
};

export class KEvent<T> {

	capacity:number|undefined;

	handlers:KList<(v:T)=>void> = new KList();

	constructor(capacity?:number){
		this.capacity = capacity;
	}

	register(h:(v:T)=>void):KEventHandler{
		const h$ = this.handlers.push(h);
		if(this.capacity&&this.handlers.size>this.capacity){
			this.handlers.shift();
		}
		return {
			cancel:()=>{
				this.handlers.removeNode(h$);
			}
		};
	}

	trigger(value:T){
		this.handlers.foreach((h:(v:T)=>void)=>{
			h(value);
		});
	}

	once(h:(v:T)=>void):KEventHandler{
		const h$ = this.register((v)=>{
			h$!.cancel();
			h(v);
		});
		return h$;
	}
}
