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

	removeNode(node:KListNode<T>|null):T|undefined{
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

	foreach(op:(v:T)=>boolean|void,reverse?:boolean):boolean{
		if(reverse){
			let curr = this.tail;
			while(curr){
				const prev = curr.prev;
				if(op(curr.value)){
					return true;
				}
				curr = prev;
			}
		}
		else{
			let curr = this.head;
			while(curr){
				const next = curr.next;
				if(op(curr.value)){
					return true;
				}
				curr = next;
			}
		}
		return false;
	}

	removeIf(pred:(v:T)=>boolean){
		let curr:KListNode<T>|null = this.head;
		let last:KListNode<T>|null = null;
		while(curr!==null){
			if(pred(curr.value)){
				this.removeNode(curr);
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
		return this.removeNode(this.tail);
	}

	shift():T|undefined{
		return this.removeNode(this.head);
	}

	unshift(value:T):KListNode<T>{
		return this.insertAfter(value,null);
	}
}
