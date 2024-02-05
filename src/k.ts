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

export class KListNode<T> {

	value:T;
	prev:KListNode<T>|null;
	next:KListNode<T>|null;
	list:KList<T>;

	constructor(value:T,prev:KListNode<T>|null,next:KListNode<T>|null,list:KList<T>){
		this.value = value;
		this.prev = prev;
		this.next = next;
		this.list = list;
	}
}

export class KList<T> {

	head:KListNode<T>|null;
	tail:KListNode<T>|null;
	size:number;

	constructor(){
		this.head = null;
		this.tail = null;
		this.size = 0;
	}

	_assert(node:KListNode<T>|null){
		if(node&&node.list!==this){
			throw new Error("list not match");
		}
	}

	_adjust(node:KListNode<T>,prev:KListNode<T>|null,next:KListNode<T>|null){
		if(prev){
			prev.next = node;
		}
		else{
			this.head = node;
		}
		if(next){
			next.prev = node;
		}
		else{
			this.tail = node;
		}
	}

	insertBefore(value:T,next:KListNode<T>|null):KListNode<T>{
		//test list
		this._assert(next);
		//build node
		const prev = next?next.prev:this.tail;
		const r = new KListNode(value,prev,next,this);
		this._adjust(r,prev,next);
		this.size++;
		return r;
	}

	insertAfter(value:T,prev:KListNode<T>|null):KListNode<T>{
		//test list
		this._assert(prev);
		//build node
		const next = prev?prev.next:this.head;
		const r = new KListNode(value,prev,next,this);
		this._adjust(r,prev,next);
		this.size++;
		return r;
	}

	remove(node:KListNode<T>|null):T|undefined{
		//test list
		this._assert(node);
		//test empty
		if(!node){
			return undefined;
		}
		//adjust
		if(node.prev){
			node.prev.next = node.next;
		}
		else{
			this.head = node.next;
		}
		if(node.next){
			node.next.prev = node.prev;
		}
		else{
			this.tail = node.prev;
		}
		this.size--;
		return node.value;
	}

	foreach(op:(v:KListNode<T>)=>void,reverse?:boolean){
		if(reverse){
			let curr = this.tail;
			while(curr){
				const prev = curr.prev;
				op(curr);
				curr = prev;
			}
		}
		else{
			let curr = this.head;
			while(curr){
				const next = curr.next;
				op(curr);
				curr = next;
			}
		}
	}

	push(value:T):KListNode<T>{
		return this.insertBefore(value,null);
	}

	pop():T|undefined{
		return this.remove(this.tail);
	}

	shift():T|undefined{
		return this.remove(this.head);
	}

	unshift(value:T):KListNode<T>{
		return this.insertAfter(value,null);
	}
}

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
			cancel: ()=>{
				this.handlers.remove(h$);
			}
		};
	}

	trigger(value:T){
		this.handlers.foreach((h$:KListNode<(v:T,c?:C)=>void>)=>{
			h$.value(value,this.context);
		});
	}

	once(h:(v:T,c?:C)=>void):KEventHandler{
		let h$:KEventHandler|undefined = undefined;
		h$ = this.register((v,c)=>{
			h$!.cancel();
			h(v,c);
		});
		return h$;
	}
}

export class KLoader{

	count:number = 1;
	event:KEvent<void,void> = new KEvent();

	complete(){
		this.count--;
		if(this.count===0){
			this.event.trigger();
		}
	}

	onDone(h:()=>void){
		this.event.register(h);
	}

	load(op:(cb:()=>void)=>void){
		this.count++;
		op(()=>{
			this.complete();
		});
	}
}
