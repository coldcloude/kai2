export type KAsync<T,R> = (cb:(r:R)=>void,v:T)=>void

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

	insertBefore(v:T):KListNode<T>{
		return this.list.insertBefore(v,this);
	}

	insertAfter(v:T):KListNode<T>{
		return this.list.insertAfter(v,this);
	}

	remove(){
		this.list.remove(this);
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

export type KEventHandler<T,C> = (val:T,ctx?:C)=>void

export type KEventNodeHandler<T,C> = KListNode<KEventHandler<T,C>>

export class KEvent<T,C> {

	context:C|undefined;
	handlers:KList<KEventHandler<T,C>> = new KList();

	constructor(context?:C){
		this.context = context;
	}

	register(h:KEventHandler<T,C>):KEventNodeHandler<T,C>{
		return this.handlers.push(h);
	}

	trigger(value:T){
		this.handlers.foreach((h$:KEventNodeHandler<T,C>)=>{
			h$.value(value,this.context);
		});
	}

	once(h:KEventHandler<T,C>){
		let h$:KEventNodeHandler<T,C>|undefined = undefined;
		h$ = this.register((v,c)=>{
			h$?.remove();
			h(v,c);
		});
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

	onDone(h:KEventHandler<void,void>):KEventNodeHandler<void,void>{
		return this.event.register(h);
	}

	/**
	 * 
	 * @param {KAsync<void,void>} op 
	 */
	load(op:KAsync<void,void>){
		this.count++;
		op(()=>{
			this.complete();
		});
	}
}
