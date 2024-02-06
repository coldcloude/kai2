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
	prev:KListNode<T>|null = null;
	next:KListNode<T>|null = null;

	constructor(value:T){
		this.value = value;
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

	_adjust(node:KListNode<T>,prev:KListNode<T>|null,next:KListNode<T>|null){
		node.prev = prev;
		node.next = next;
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

	insertNodeBefore(node:KListNode<T>,next:KListNode<T>|null){
		const prev = next?next.prev:this.tail;
		this._adjust(node,prev,next);
		this.size++;
	}

	insertNodeAfter(node:KListNode<T>,prev:KListNode<T>|null){
		const next = prev?prev.next:this.head;
		this._adjust(node,prev,next);
		this.size++;
	}

	insertBefore(value:T,next:KListNode<T>|null):KListNode<T>{
		const r = new KListNode(value);
		this.insertNodeBefore(r,next);
		return r;
	}

	insertAfter(value:T,prev:KListNode<T>|null):KListNode<T>{
		const r = new KListNode(value);
		this.insertNodeAfter(r,prev);
		return r;
	}

	remove(node:KListNode<T>|null):T|undefined{
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

	removeIf(pred:(v:T)=>boolean){
		let curr:KListNode<T>|null = this.head;
		let last:KListNode<T>|null = null;
		while(curr!==null){
			if(pred(curr.value)){
				this.remove(curr);
				curr = last===null?this.head:last.next;
			}
			else{
				last = curr;
				curr = curr.next;
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
