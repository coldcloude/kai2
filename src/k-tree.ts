import { KPair } from "./k.js";
import { KMap, testRemove } from "./k-map.js";

function setAsSide<K,V,N extends KTreeNode<K,V,N>>(node:N|null,parent:N|null,side:number){
	if(parent!==null){
		switch(side){
			case -1:
				parent.left = node;
				break;
			case 1:
				parent.right = node;
				break;
		}
	}
	if(node!==null){
		node.parent = parent;
		node._side = side;
	}
}
function setAsLeft<K,V,N extends KTreeNode<K,V,N>>(node:N|null,parent:N|null){
	if(parent!==null){
		parent.left = node;
	}
	if(node!==null){
		node.parent = parent;
		node._side = -1;
	}
}
function setAsRight<K,V,N extends KTreeNode<K,V,N>>(node:N|null,parent:N|null){
	if(parent!==null){
		parent.right = node;
	}
	if(node!==null){
		node.parent = parent;
		node._side = 1;
	}
}

export class KTreeNode<K,V,N extends KTreeNode<K,V,N>> {

	key:K;
	value:V;

	parent:N|null = null;
	left:N|null = null;
	right:N|null = null;
	_side:number = 0;

	constructor(key:K,value:V){
		this.key = key;
		this.value = value;
	}
	prev():N|undefined{
		if(this.left!==null){
			//now at center, find left sub tree's right most
			let curr = this.left;
			while(curr.right!==null){
				curr = curr.right;
			}
			return curr;
		}
		else{
			//end of sub tree, find nearest right sub tree root
			if(this._side===1){
				//this is right sub tree root
				return this.parent!;
			}
			else{
				let curr:N|null = this.parent;
				while(curr!==null&&curr._side!==1){
					curr = curr.parent;
				}
				return curr===null?undefined:curr.parent!;
			}
		}
	}
	next():N|undefined{
		if(this.right!==null){
			//now at center, find right sub tree's left most
			let curr = this.right;
			while(curr.left!==null){
				curr = curr.left;
			}
			return curr;
		}
		else{
			//end of sub tree, find nearest left sub tree root
			if(this._side===-1){
				//this is left sub tree root
				return this.parent!;
			}
			else{
				let curr:N|null = this.parent;
				while(curr!==null&&curr._side!==-1){
					curr = curr.parent;
				}
				return curr===null?undefined:curr.parent!;
			}
		}
	}
}

export class KAVLTreeNode<K,V> extends KTreeNode<K,V,KAVLTreeNode<K,V>>{

	_height:number = 1;
	_factor:number = 0;

	constructor(key:K,value:V){
		super(key,value);
	}

	_update(){
		const leftHeight = this.left===null?0:this.left._height;
		const rightHeight = this.right===null?0:this.right._height;
		this._height = Math.max(leftHeight,rightHeight)+1;
		this._factor = rightHeight-leftHeight;
	}
	_rotateLeft():KAVLTreeNode<K,V>{
        /*
                c(2)                       r(0)
               / \          ==>           /  \
             [l]  r(1)                   c(0) rr
                 / \                    / \
               [rl] rr                [l] [rl]
        */
        /*
                c(2)                       r(-1)
               / \          ==>           /  \
             [l]  r(0)                   c(1) rr
                 / \                    / \
                rl rr                 [l]  rl
        */
		const r = this.right!;
		//set r to root
		setAsSide(r,this.parent,this._side);
		//set rl to c right
		setAsRight(r.left,this);
		//set c to r left
		setAsLeft(this,r);
		//reset statistic
		this._update();
		r._update();
		//return new root
		return r;
	}
	_rotateRight():KAVLTreeNode<K,V>{
        /*
                 c(-2)                  l(0)
               /    \        ==>       /  \
              l(-1) [r]               ll   c(0)
             / \                          / \
            ll [lr]                     [lr] [r]
        */
        /*
                 c(-2)                  l(1)
               /    \        ==>       /  \
              l(0)  [r]               ll   c(-1)
             / \                          / \
            ll lr                        lr [r]
        */
			const l = this.left!;
		//set l to root
		setAsSide(l,this.parent,this._side);
		//set lr to c left
		setAsLeft(l.right,this);
		//set c to l right
		setAsRight(this,l);
		//reset statistic
		this._update();
		l._update();
		//return new root
		return l;
	}
	_rotateLeftRight():KAVLTreeNode<K,V>{
        /*
                 |                                |
                 c(-2)                            lr
                / \                             /    \
               /   \        ==>                /      \
            (1)l    [r]                       l        c
            /   \                            / \      /  \
          [ll]   lr                      [ll] [lrl] [lrr] [r]
               /   \
            [lrl] [lrr]
        */
		const l = this.left!;
		const lr = l.right!;
		//set lr to root
		setAsSide(lr,this.parent,this._side);
		//set lrl to l right
		setAsRight(lr.left,l);
		//set lrr to c left
		setAsLeft(lr.right,this);
		//set l to lr left
		setAsLeft(l,lr);
		//set c to lr right
		setAsRight(this,lr);
		//reset statistic
		this._update();
		l._update();
		lr._update();
		//return new root
		return lr;
	}
	_rotateRightLeft():KAVLTreeNode<K,V>{
        /*
                |                                  |
                c(1)                               rl
               /  \                             /      \
              /    \                           /        \
            [l]    r(-1)          ==>         c          r
                   / \                       / \        / \
                 rl  [rr]                  [l] [rll] [rlr] [rr]
               /   \
             [rll] [rlr]
        */
		const r = this.right!;
		const rl = r.left!;
		//set rl to root
		setAsSide(rl,this.parent,this._side);
		//set rlr to r left
		setAsLeft(rl.right,r);
		//set rll to c right
		setAsRight(rl.left,this);
		//set r to rl right
		setAsRight(r,rl);
		//set c to rl left
		setAsLeft(this,rl);
		//reset statistic
		this._update();
		r._update();
		rl._update();
		//return new root
		return rl;
	}
	_factorRotateOnce():KAVLTreeNode<K,V>{
		if(this._factor==2){
			//rotate left
			if(this.right!._factor==-1){
				//rotate right left
				return this._rotateRightLeft();
			}
			else{
				//rotate left only
				return this._rotateLeft();
			}
		}
		else if(this._factor==-2){
			//rotate right
			if(this.left!._factor==1){
				//rotate left right
				return this._rotateLeftRight();
			}
			else{
				//rotate right only
				return this._rotateRight();
			}
		}
		else{
			//no rotate
			return this;
		}
	}
	_rebalanceForInsert():KAVLTreeNode<K,V>{
		let balanced = false;
		let last:KAVLTreeNode<K,V> = this.parent!;
		let curr:KAVLTreeNode<K,V>|null = this.parent;
		while(curr!=null){
			//balance
			if(!balanced){
				curr._update();
				if(curr._factor===0){
					//from -1 or 1, height not changed
					balanced = true;
				}
				else {
					curr = curr._factorRotateOnce();
				}
			}
			//recursion
			last = curr;
			curr = curr.parent;
		}
		//return new root
		return last;
	}
	_eraseAndRebalance(){
		let curr:KAVLTreeNode<K,V>|null = null;
		let last:KAVLTreeNode<K,V>|null = null;
		if(this.left!==null&&this.right!==null){
			//both sides
			if(this.left.right===null){
				curr = this.left;
				last = this.left;
				//left can link right, shift up left sub tree
				setAsSide(this.left,this.parent,this._side);
				setAsRight(this.right,this.left);
			}
			else if(this.right.left===null){
				curr = this.right;
				last = this.right;
				//right can link left, shift up right sub tree
				setAsSide(this.right,this.parent,this._side);
				setAsLeft(this.left,this.right);
			}
			else{
				//find nearest
				let leftMostRP = this.left;
				let leftMostR = this.left.right;
				let ldepth = 0;
				while(leftMostR.right!=null){
					leftMostRP = leftMostR;
					leftMostR = leftMostR.right;
					ldepth++;
				}
				let rightMostLP = this.right;
				let rightMostL = this.right.left;
				let rdepth = 0;
				while(rightMostL.left!=null){
					rightMostLP = rightMostL;
					rightMostL = rightMostL.left;
					rdepth++;
				}
				if(this._factor===-1||this._factor===0&&ldepth<rdepth){
					last = leftMostRP;
					curr = leftMostRP;
					//update left's parent, shift up left's left subtree
					setAsRight(leftMostR.left,leftMostRP);
					//set left to new root
					setAsSide(leftMostR,this.parent,this._side);
					//set old child to new root
					setAsLeft(this.left,leftMostR);
					setAsRight(this.right,leftMostR);
					//update new root
					leftMostR._update();
				}
				else{
					last = rightMostLP;
					curr = rightMostLP;
					//update right's parent, shift up right's right subtree
					setAsLeft(rightMostL.right,rightMostLP);
					//set right to new root
					setAsSide(rightMostL,this.parent,this._side);
					//set old right to new root right
					setAsLeft(this.left,rightMostL);
					setAsRight(this.right,rightMostL);
					//update new root
					rightMostL._update();
				}
			}
		}
		else if(this.left!==null){
			//only left
			last = this.left;
			curr = this.parent;
			//set left to new root
			setAsSide(this.left,this.parent,this._side);
		}
		else if(this.right!==null){
			//only right
			last = this.right;
			curr = this.parent;
			//set right to new root
			setAsSide(this.right,this.parent,this._side);
		}
		else{
			//no child
			last = null;
			curr = this.parent;
			//no new root
			if(curr!==null){
				if(this._side===-1){
					curr.left = null;
				}
				else{
					curr.right = null;
				}
			}
		}
		//rebalance
		if(curr!==null){
			let balanced = false;
			while(curr!=null){
				if(!balanced){
					curr._update();
					if(curr._factor===-1||curr._factor===1){
						//from 0, height not changed
						balanced = true;
					}
					else {
						curr = curr._factorRotateOnce();
					}
				}
				//recursion
				last = curr;
				curr = curr.parent;
			}
		}
		//return neo root
		return last;
	}
}

export abstract class KTree<K,V,N extends KTreeNode<K,V,N>> extends KMap<K,V> {

	compare:(a:K,b:K)=>number;
	root:N|null = null;

	constructor(compare:(a:K,b:K)=>number){
		super();
		this.compare = compare;
	}

	_findNearestNode(k:K):N{
		let curr = this.root!;
		let diff = this.compare(k,curr.key);
		while(diff!==0){
			if(diff<0){
				if(curr.left!=null){
					curr = curr.left;
				}
				else{
					break;
				}
			}
			else{
				if(curr.right!=null){
					curr = curr.right;
				}
				else{
					break;
				}
			}
			diff = this.compare(k,curr.key);
		}
		return curr;
	}

	_testAndRemove(node:N|undefined,remove?:boolean,condition?:(k:K,v:V)=>boolean):KPair<K,V>|undefined{
		if(node===undefined){
			return undefined;
		}
		else{
            if(testRemove(node.key,node.value,remove,condition)){
                this.removeNode(node);
            }
			return {key:node.key,value:node.value};
		}
	}

	abstract createNode(k:K,v:V):N;
	abstract removeNode(node:N):void;
	abstract insertNode(node:N,nearest?:N,diff?:number):void;

	computeNode(k:K,op:(kvp:KPair<K,V>|undefined)=>KPair<K,V>|undefined):N|undefined{
		if(this.root===null){
			//not found, skip or insert
			const r = op(undefined);
			if(r!==undefined){
				const node = this.createNode(r.key,r.value);
				this.root = node;
				this.size = 1;
				return node;
			}
			else{
				return undefined;
			}
		}
		else{
			const node = this._findNearestNode(k);
			const diff = this.compare(k,node.key);
			if(diff===0){
				//found, remove or replace
				const r = op({key:node.key,value:node.value});
				if(r===undefined){
					this.removeNode(node);
				}
				else{
					node.key = r.key;
					node.value = r.value;
				}
				return node;
			}
			else{
				//not found, skip or insert
				const r = op(undefined);
				if(r!==undefined){
					const neo = this.createNode(r.key,r.value);
					this.insertNode(neo,node,diff);
					return neo;
				}
				else{
					return undefined;
				}
			}
		}
	}
	getNode(k:K):N|undefined{
		return this.computeNode(k,(kvp:KPair<K,V>|undefined)=>{
			return kvp;
		});
	}
	setNode(k:K,v:V):N{
        return this.computeNode(k,()=>{
            return {key:k,value:v};
        })!;
	}
	getLeastNode():N|undefined{
		if(this.root===null){
			return undefined;
		}
		else{
			let curr = this.root;
			while(curr.left!==null){
				curr = curr.left;
			}
			return curr;
		}
	}
	getGreatestNode():N|undefined{
		if(this.root===null){
			return undefined;
		}
		else{
			let curr = this.root;
			while(curr.right!==null){
				curr = curr.right;
			}
			return curr;
		}
	}
	getFloorNode(k:K):N|undefined{
		if(this.root===null){
			return undefined;
		}
		else{
			const curr = this._findNearestNode(k);
			const sign = this.compare(curr.key,k);
			return sign<=0?curr:curr.prev();
		}
	}
	getCeilNode(k:K):N|undefined{
		if(this.root===null){
			return undefined;
		}
		else{
			const curr = this._findNearestNode(k);
			const sign = this.compare(curr.key,k);
			return sign>=0?curr:curr.next();
		}
	}


	compute(k:K,op:(kvp:KPair<K,V>|undefined)=>KPair<K,V>|undefined):KPair<K,V>|undefined{
		const node = this.computeNode(k,op);
		return node===undefined?undefined:{key:node.key,value:node.value};
	}
	getFirst(remove?:boolean,condition?:(k:K,v:V)=>boolean):KPair<K,V>|undefined{
		const node = this.getLeastNode();
		return this._testAndRemove(node,remove,condition);
	}
	getLast(remove?:boolean,condition?:(k:K,v:V)=>boolean):KPair<K,V>|undefined{
		const node = this.getGreatestNode();
		return this._testAndRemove(node,remove,condition);
	}
	getOrBefore(k:K,remove?:boolean,condition?:(k:K,v:V)=>boolean):KPair<K,V>|undefined{
		const node = this.getFloorNode(k);
		return this._testAndRemove(node,remove,condition);
	}
	getOrAfter(k:K,remove?:boolean,condition?:(k:K,v:V)=>boolean):KPair<K,V>|undefined{
		const node = this.getCeilNode(k);
		return this._testAndRemove(node,remove,condition);
	}
	foreach(op:(k:K,v:V)=>boolean|void,reverse?:boolean):boolean{
		let curr:N|undefined = reverse?this.getGreatestNode():this.getLeastNode();
		while(curr!==undefined){
			if(op(curr.key,curr.value)){
				return true;
			}
			else{
				curr = reverse?curr.prev():curr.next();
			}
		}
		return false;
	}
	removeIf(pred:(k:K,v:V)=>boolean){
		let curr:N|undefined = this.getLeastNode();
		let last:N|undefined = undefined;
		while(curr!==undefined){
			if(pred(curr.key,curr.value)){
				this.removeNode(curr);
				curr = last===undefined?this.getLeastNode():last.next();
			}
			else{
				//no op, step on
				last = curr;
				curr = curr.next();
			}
		}
	}
}

export class KAVLTree<K,V> extends KTree<K,V,KAVLTreeNode<K,V>> {
	constructor(compare:(a:K,b:K)=>number){
		super(compare);
		this.compare = compare;
	}
	createNode(k:K,v:V):KAVLTreeNode<K,V>{
		return new KAVLTreeNode(k,v);
	}
	insertNode(rst:KAVLTreeNode<K,V>,nearest?:KAVLTreeNode<K,V>,diff?:number):void {
		nearest = nearest||this._findNearestNode(rst.key);
		diff = diff||this.compare(rst.key,nearest.key);
		if(diff<0){
			nearest.left = rst;
			rst.parent = nearest;
			rst._side = -1;
		}
		else{
			nearest.right = rst;
			rst.parent = nearest;
			rst._side = 1;
		}
		this.root = rst._rebalanceForInsert();
		this.size++;
	}
	removeNode(node:KAVLTreeNode<K,V>){
		this.root = node._eraseAndRebalance();
		if(this.root!==null){
			this.root._side = 0;
		}
		this.size--;
	}
	clear(): void {
		this.size = 0;
		this.root = null;
	}
}

export const numcmp = (a:number,b:number)=>{
	return a-b;
};

export const strcmp = (a:string,b:string)=>{
	return a===b?0:a<b?-1:1;
};

export const bigintcmp = (a:bigint,b:bigint)=>{
	const sign = a-b;
	return sign===0n?0:sign<0?-1:1;
};
