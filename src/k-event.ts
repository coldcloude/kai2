import { KAHandler } from "./k-async.js";
import { KList } from "./k-list.js";

export type KEventRegistry = {
	cancel:()=>void
};

export class KEvent<T> {

	capacity:number|undefined;

	handlers:KList<KAHandler<T>> = new KList();

	constructor(capacity?:number){
		this.capacity = capacity;
	}

	register(h:KAHandler<T>):KEventRegistry{
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

	async trigger(value:T):Promise<void>{
		const ps:Promise<void>[] = [];
		this.handlers.foreach((h:KAHandler<T>)=>{
			ps.push(h(value));
		});
		for(const p of ps){
			await p;
		}
	}

	once(h:KAHandler<T>):KEventRegistry{
		const h$ = this.register((v)=>{
			h$!.cancel();
			return h(v);
		});
		return h$;
	}
}
