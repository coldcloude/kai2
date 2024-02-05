function setAsSide<K,V>(node:KTreeNode<K,V>|null,parent:KTreeNode<K,V>|null,side:number){
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
function setAsLeft<K,V>(node:KTreeNode<K,V>|null,parent:KTreeNode<K,V>|null){
	if(parent!==null){
		parent.left = node;
	}
	if(node!==null){
		node.parent = parent;
		node._side = -1;
	}
}
function setAsRight<K,V>(node:KTreeNode<K,V>|null,parent:KTreeNode<K,V>|null){
	if(parent!==null){
		parent.right = node;
	}
	if(node!==null){
		node.parent = parent;
		node._side = 1;
	}
}

export class KTreeNode<K,V> {

	key:K;
	value:V|undefined;

	parent:KTreeNode<K,V>|null = null;
	left:KTreeNode<K,V>|null = null;
	right:KTreeNode<K,V>|null = null;
	_height:number = 1;
	_factor:number = 0;
	_side:number = 0;

	constructor(key:K,value?:V){
		this.key = key;
		this.value = value;
	}

	_update(){
		const leftHeight = this.left===null?0:this.left._height;
		const rightHeight = this.right===null?0:this.right._height;
		this._height = Math.max(leftHeight,rightHeight)+1;
		this._factor = rightHeight-leftHeight;
	}
	_rotateLeft():KTreeNode<K,V>{
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
	_rotateRight():KTreeNode<K,V>{
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
	_rotateLeftRight():KTreeNode<K,V>{
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
	_rotateRightLeft():KTreeNode<K,V>{
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
	_factorRotateOnce():KTreeNode<K,V>{
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
	_rebalanceForInsert():KTreeNode<K,V>{
		let balanced = false;
		let last:KTreeNode<K,V> = this.parent!;
		let curr:KTreeNode<K,V>|null = this.parent;
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
		let init:KTreeNode<K,V>;
		if(this.left!==null&&this.right!==null){
			//both sides
			if(this.left.right===null){
				init = this.left;
				//left can link right, shift up left sub tree
				setAsSide(this.left,this.parent,this._side);
				setAsRight(this.right,this.left);
			}
			else if(this.right.left===null){
				init = this.right;
				//right can link left, shift up right sub tree
				setAsSide(this.right,this.parent,this._side);
				setAsLeft(this.left,this.right);
			}
			else{
				//find nearest
				let left = this.left.right;
				let ldepth = 0;
				while(left.right!=null){
					left = left.right;
					ldepth++;
				}
				let right = this.right.left;
				let rdepth = 0;
				while(right.left!=null){
					right = right.left;
					rdepth++;
				}
				if(this._factor===-1||this._factor===0&&ldepth<rdepth){
					init = left.parent!;
					//update left's parent, shift up left's left subtree
					setAsRight(left.left,init);
					//set left to new root
					setAsSide(left,this.parent,this._side);
					//set old child to new root
					setAsLeft(this.left,left);
					setAsRight(this.right,left);
					//update new root
					left._update();
				}
				else{
					init = right.parent!;
					//update right's parent, shift up right's right subtree
					setAsLeft(right.right,init);
					//set right to new root
					setAsSide(right,this.parent,this._side);
					//set old right to new root right
					setAsLeft(this.left,right);
					setAsRight(this.right,right);
					//update new root
					right._update();
				}
			}
		}
		else if(this.left!==null){
			//only left
			init = this.parent!;
			//set left to new root
			setAsSide(this.left,this.parent,this._side);
		}
		else if(this.right!==null){
			//only right
			init = this.parent!;
			//set right to new root
			setAsSide(this.right,this.parent,this._side);
		}
		else{
			//no child
			init = this.parent!;
			//no new root
			if(this._side===-1){
				init.left = null;
			}
			else{
				init.right = null;
			}
		}
		//rebalance
		let balanced = false;
		let last:KTreeNode<K,V> = init;
		let curr:KTreeNode<K,V>|null = init;
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
		//return neo root
		return last;
	}
}

export class KTree<K,V> {
	compare:(a:K,b:K)=>number;
	root:KTreeNode<K,V>|null = null;
	size = 0;
	constructor(compare:(a:K,b:K)=>number){
		this.compare = compare;
	}
	_findNearest(k:K):KTreeNode<K,V>{
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
	remove(node:KTreeNode<K,V>){
		if(node.parent==null){
			//root;
			this.root = null;
		}
		else{
			//not root
			this.root = node._eraseAndRebalance();
		}
		this.size--;
	}
	set(k:K,v?:V):KTreeNode<K,V>{
		if(this.root===null){
			this.root = new KTreeNode(k,v);
			this.size = 1;
			return this.root;
		}
		else{
			const nearest = this._findNearest(k);
			const diff = this.compare(k,nearest.key);
			if(diff===0){
				nearest.key = k;
				nearest.value = v;
				return nearest;
			}
			else{
				const rst = new KTreeNode(k,v);
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
				return rst;
			}
		}
	}
	get(k:K,remove?:boolean):KTreeNode<K,V>|undefined{
		if(this.root===null){
			return undefined;
		}
		else{
			const node = this._findNearest(k);
			if(this.compare(k,node.key)===0){
				if(remove){
					this.remove(node);
				}
				return node;
			}
			else{
				return undefined;
			}
		}
	}
	getLeast(remove?:boolean):KTreeNode<K,V>|undefined{
		if(this.root===null){
			return undefined;
		}
		else{
			let curr = this.root;
			while(curr.left!==null){
				curr = curr.left;
			}
			if(remove){
				this.remove(curr);
			}
			return curr;
		}
	}
	getGreatest(remove?:boolean):KTreeNode<K,V>|undefined{
		if(this.root===null){
			return undefined;
		}
		else{
			let curr = this.root;
			while(curr.right!==null){
				curr = curr.right;
			}
			if(remove){
				this.remove(curr);
			}
			return curr;
		}
	}
	forEach(op:($:KTreeNode<K,V>)=>boolean|void,reverse?:boolean):boolean{
		let rr = false;
		if(this.root!=null){
			const nodeStack:KTreeNode<K,V>[] = [];
			const stateStack:number[] = [];
			nodeStack.push(this.root);
			stateStack.push(0);
			while(nodeStack.length>0){
				const node = nodeStack.pop()!;
				const state = stateStack.pop()!;
				let r:boolean|void = undefined;
				switch(state){
					case 0:
						nodeStack.push(node);
						stateStack.push(1);
						if(reverse){
							if(node.right!==null){
								nodeStack.push(node.right);
								stateStack.push(0);
							}
						}
						else{
							if(node.left!==null){
								nodeStack.push(node.left);
								stateStack.push(0);
							}
						}
						break;
					case 1:
						r = op(node);
						if(reverse){
							if(node.left!==null){
								nodeStack.push(node.left);
								stateStack.push(0);
							}
						}
						else{
							if(node.right!==null){
								nodeStack.push(node.right);
								stateStack.push(0);
							}
						}
						break;
				}
				if(r){
					rr = true;
					break;
				}
			}
		}
		return rr;
	}
}
