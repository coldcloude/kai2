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

	concatBefore(l:KList<T>,a:KListNode<T>|null){
		if(l.head!==null&&l.tail!==null){
			if(a===null){
				if(this.tail===null){
					//empty list replace
					this.head = l.head;
				}
				else{
					//add after tail
					this.tail.next = l.head;
					l.head.prev = this.tail;
				}
				this.tail = l.tail;
			}
			else{
				if(a.prev===null){
					//before head
					this.head = l.head;
				}
				else{
					//mid
					a.prev.next = l.head;
					l.head.prev = a.prev;
				}
				a.prev = l.tail;
				l.tail.next = a;
			}
			this.size += l.size;
		}
	}

	concatAfter(l:KList<T>,a:KListNode<T>|null){
		if(l.head!==null&&l.tail!==null){
			if(a===null){
				if(this.head===null){
					//empty list replace
					this.tail = l.tail;
				}
				else{
					//add before head
					this.head.prev = l.tail;
					l.tail.next = this.head;
				}
				this.head = l.head;
			}
			else{
				if(a.next===null){
					//after tail
					this.tail = l.tail;
				}
				else{
					//mid
					a.next.prev = l.tail;
					l.tail.next = a.next;
				}
				a.next = l.head;
				l.head.prev = a;
			}
			this.size += l.size;
		}
	}

	toArray():T[]{
		const arr:T[] = [];
		this.foreach(v=>{
			arr.push(v);
		});
		return arr;
	}

	fromArray(arr:T[]){
		for(const v of arr){
			this.push(v);
		}
	}

}

type SortContext<T> = {
	mid$: KListNode<T>,
	lower$: KListNode<T>|null
	upper$: KListNode<T>|null,
	state: number
};

export function findMid<T>(list:KList<T>, lower$:KListNode<T>|null, upper$:KListNode<T>|null){
	if(!list.head||!list.tail||lower$&&upper$&&lower$===upper$||lower$&&lower$.next===upper$||upper$&&upper$.prev===lower$){
		return null;
	}
	let curr$ = lower$?lower$.next:list.head;
	let mid$ = curr$;
	while(curr$&&mid$){
		if(curr$===upper$){
			break;
		}
		curr$ = curr$.next;
		if(!curr$||curr$===upper$){
			break;
		}
		curr$ = curr$.next;
		mid$ = mid$.next;
	}
	return mid$;
}

export function approxSort<T>(listOrArr:KList<T>|T[], comp:(v1:T,v2:T)=>number){
	let list:KList<T>;
	if(listOrArr instanceof KList){
		list = listOrArr as KList<T>;
	}
	else{
		list = new KList<T>();
		for(const v of listOrArr as T[]){
			list.push(v);
		}
	}
	const rss = new KList<KList<T>>();
	while(list.size>0){
		const rs = new KList<T>();
		const stack = new KList<SortContext<T>>();
		let mid$ = findMid(list,null,null);
		if(mid$){
			list.removeNode(mid$);
			rs.insertNodeBefore(mid$,null);
			stack.push({
				mid$: mid$,
				lower$: null,
				upper$: null,
				state: 0,
			});
			while(stack.tail){
				const ctx = stack.tail.value;
				if(ctx.state===0){
					//move left 1 to right
					const left = new KList<T>();
					let curr$ = ctx.lower$?ctx.lower$.next:rs.head;
					while(curr$){
						if(curr$===ctx.mid$){
							break;
						}
						const next$ = curr$.next;
						const r = comp(curr$.value,ctx.mid$.value);
						if(r>0){
							rs.removeNode(curr$);
							left.insertNodeBefore(curr$,null);
						}
						curr$ = next$;
					}
					//move right -1 to left
					const right = new KList<T>();
					curr$ = ctx.mid$.next;
					while(curr$){
						if(curr$===ctx.upper$){
							break;
						}
						const next$ = curr$.next;
						const r = comp(curr$.value,ctx.mid$.value);
						if(r<0){
							rs.removeNode(curr$);
							right.insertNodeBefore(curr$,null);
						}
						curr$ = next$;
					}
					//change left right
					rs.concatBefore(right,mid$);
					rs.concatAfter(left,mid$);
					//add all -1 to left and all 1 to right
					curr$ = list.head;
					while(curr$){
						const next$ = curr$.next;
						const r = comp(curr$.value,ctx.mid$.value);
						if(r!==0){
							list.removeNode(curr$);
							if(r<0){
								rs.insertNodeBefore(curr$,ctx.mid$);
							}
							else{
								rs.insertNodeBefore(curr$,ctx.upper$);
							}
						}
						curr$ = next$;
					}
					ctx.state++;
				}
				else if(ctx.state===1){
					//process left
					mid$ = findMid(rs,ctx.lower$,ctx.mid$);
					if(mid$){
						stack.push({
							mid$: mid$,
							lower$: ctx.lower$,
							upper$: ctx.mid$,
							state: 0
						});
					}
					ctx.state++;
				}
				else if(ctx.state===2){
					//process right
					mid$ = findMid(rs,ctx.mid$,ctx.upper$);
					if(mid$){
						stack.push({
							mid$: mid$,
							lower$: ctx.mid$,
							upper$: ctx.upper$,
							state: 0
						});
					}
					ctx.state++;
				}
				else {
					stack.pop();
				}
			}
		}
		rss.push(rs);
	}
	if(listOrArr instanceof KList){
		rss.foreach((rs)=>{
			list.concatBefore(rs,null);
		});
	}
	else{
		const arr = listOrArr as T[];
		let index = 0;
		rss.foreach((rs)=>{
			rs.foreach((v)=>{
				arr[index] = v;
				index++;
			});
		});
	}
}
