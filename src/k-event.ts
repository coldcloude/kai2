import { KList } from "./k-list.js";

export type KEventHandler = {
	cancel:()=>void
};

export class KEvent<T,C> {

	capacity:number|undefined;

	context:C|undefined;
	handlers:KList<(v:T,c?:C)=>void> = new KList();

	constructor(capacity?:number,context?:C){
		this.capacity = capacity;
		this.context = context;
	}

	register(h:(v:T,c?:C)=>void):KEventHandler{
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
		this.handlers.foreach((h:(v:T,c?:C)=>void)=>{
			h(value,this.context);
		});
	}

	once(h:(v:T,c?:C)=>void):KEventHandler{
		const h$ = this.register((v,c)=>{
			h$!.cancel();
			h(v,c);
		});
		return h$;
	}
}
