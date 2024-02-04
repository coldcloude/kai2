export class KTreeNode<K,V> {

	key:K;
	value:V|undefined;
	tree:KTree<K,V>;

	parent:KTreeNode<K,V>|null = null;
	left:KTreeNode<K,V>|null = null;
	right:KTreeNode<K,V>|null = null;
	_height:number = 1;
	_factor:number = 0;
	_direction:number = 0;

	constructor(tree:KTree<K,V>,key:K,value?:V){
		this.tree = tree;
		this.key = key;
		this.value = value;
	}

	_update(){
		const leftHeight = this.left===null?0:this.left._height;
		const rightHeight = this.right===null?0:this.right._height;
		this._height = Math.max(leftHeight,rightHeight)+1;
		this._factor = rightHeight-leftHeight;
	}
	_rotateLeft(){
        /*
                x(2)                       y(0)
               / \          ==>           /  \
             [a]  y(1)                   x(0) c
                 / \                    / \
               [b]  c                 [a] [b]
        */
		const subR = this.right!;
		//set y to root
		subR.parent = this.parent;
		subR._direction = this._direction;
		if(subR.parent!==null){
			if(subR._direction===-1){
				subR.parent.left = subR;
			}
			else{
				subR.parent.right = subR;
			}
		}
		//set b to x right
		this.right = subR.left;
		if(this.right!=null){
			this.right.parent = this;
			this.right._direction = 1;
		}
		//set x to y left
		subR.left = this;
		this.parent = subR;
		this._direction = -1;
		//reset statistic
		this._update();
		subR._update();
	}
	_rotateRight(){
        /*
                 x(-2)                  y(0)
               /    \        ==>       /  \
              y(-1) [c]               a    x(0)
             / \                          / \
            a  [b]                      [b] [c]
        */
		const subL = this.left!;
		//set y to root
		subL.parent = this.parent;
		subL._direction = this._direction;
		if(subL.parent!==null){
			if(subL._direction===-1){
				subL.parent.left = subL;
			}
			else{
				subL.parent.right = subL;
			}
		}
		//set b to x left
		this.left = subL.right;
		if(this.left!=null){
			this.left.parent = this;
			this.left._direction = -1;
		}
		//set x to y right
		subL.right = this;
		this.parent = subL;
		this._direction = 1;
		//reset statistic
		this._update();
		subL._update();
	}
	_rotateLeftRight(){
        /*
                |                               |
                a(-2)                           c
               / \                             / \
              /   \        ==>                /   \
          (1)b    [g]                        b     a
            / \                             / \   / \
          [d]  c                          [d] e  f  [g]
              / \
             e   f
        */
		const subL = this.left!;
		const subLR = subL.right!;
		//set c to root
		subLR.parent = this.parent;
		subLR._direction = this._direction;
		if(subLR.parent!==null){
			if(subLR._direction===-1){
				subLR.parent.left = subLR;
			}
			else{
				subLR.parent.right = subLR;
			}
		}
		//set e to b right
		subL.right = subLR.left;
		if(subL.right!=null){
			subL.right.parent = subL;
			subL.right._direction = 1;
		}
		//set f to a left
		this.left = subLR.right;
		if(this.left!=null){
			this.left.parent = this;
			this.left._direction = -1;
		}
		//set b to c left
		subLR.left = subL;
		subL.parent = subLR;
		subL._direction = -1;
		//set a to c right
		subLR.right = this;
		this.parent = subLR;
		this._direction = 1;
		//reset statistic
		this._update();
		subL._update();
		subLR._update();
	}
	_rotateRightLeft(){
        /*
                |                               |
                a(1)                            c
               / \                             / \
              /   \                           /   \
            [d]   b(-1)          ==>         a     b
                 / \                        / \   / \
                c  [g]                    [d] e  f  [g]
               / \
              e  f
        */
		const subR = this.right!;
		const subRL = subR.left!;
		//set c to root
		subRL.parent = this.parent;
		subRL._direction = this._direction;
		if(subRL.parent!==null){
			if(subRL._direction===-1){
				subRL.parent.left = subRL;
			}
			else{
				subRL.parent.right = subRL;
			}
		}
		//set f to b left
		subR.left = subRL.right;
		if(subR.left!=null){
			subR.left.parent = subR;
			subR.left._direction = -1;
		}
		//set e to a right
		this.right = subRL.left;
		if(this.right!=null){
			this.right.parent = this;
			this.right._direction = 1;
		}
		//set b to c right
		subRL.right = subR;
		subR.parent = subRL;
		subR._direction = 1;
		//set a to c left
		subRL.left = this;
		this.parent = subRL;
		this._direction = -1;
		//reset statistic
		this._update();
		subR._update();
		subRL._update();
	}
	_factorRotateOnce(){
		if(this._factor==2){
			//rotate left
			if(this.right!._factor==1){
				//rotate left only
				this._rotateLeft();
			}
			else{
				//rotate right left
				this._rotateRightLeft();
			}
		}
		else if(this._factor==-2){
			//rotate right
			if(this.left!._factor==-1){
				//rotate right only
				this._rotateRight();
			}
			else{
				//rotate left right
				this._rotateLeftRight();
			}
		}
	}
	_rebalanceForInsert(){
		let curr:KTreeNode<K,V>|null = this.parent;
		while(curr!=null){
			curr._update();
			if(curr._factor===0){
				//from -1 or 1, height not changed
				break;
			}
			else {
				curr._factorRotateOnce();
			}
			//recursion
			curr = curr.parent;
		}
	}
	_eraseAndRebalance(){
		const parent = this.parent!;
		let neo:KTreeNode<K,V>|null = null;
		let init:KTreeNode<K,V> = parent;
		if(this.left!==null&&this.right!==null){
			//both sides
			if(this.left.right===null){
				//left can link right, shift up left sub tree
				this.left.right = this.right;
				neo = this.left;
				init = this.left;
			}
			else if(this.right.left===null){
				//right can link left, shift up right sub tree
				this.right.left = this.left;
				neo = this.right;
				init = this.right;
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
					//set left to new root
					neo = left;
					init = left.parent!;
					//update left's parent, shift up left's left subtree
					init.right = left.left;
					if(init.right){
						init.right.parent = init;
						init.right._direction = 1;
					}
				}
				else{
					//set right to new root
					neo = right;
					init = right.parent!;
					//update right's parent, shift up right's right subtree
					init.left = right.right;
					if(init.left){
						init.left.parent = init;
						init.left._direction = -1;
					}
				}
			}
		}
		else if(this.left!==null){
			//only left, set left to new root
			neo = this.left;
		}
		else if(this.right!==null){
			//only right, set right to new root
			neo = this.right;
		}
		//else no child, no root
		//reset neo-parent link
		if(neo!=null){
			neo.parent = parent;
			neo._direction = this._direction;
		}
		if(this._direction==-1){
			parent.left = neo;
		}
		else{
			parent.right = neo;
		}
		//rebalance
		let curr:KTreeNode<K,V>|null = init;
		while(curr!=null){
			curr._update();
			if(curr._factor===-1||curr._factor===1){
				//from 0, height not changed
				break;
			}
			else {
				curr._factorRotateOnce();
			}
			//recursion
			curr = curr.parent;
		}
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
	_remove(node:KTreeNode<K,V>){
		if(node.parent==null){
			//root;
			this.root = null;
		}
		else{
			//not root
			node._eraseAndRebalance();
		}
		this.size--;
	}
	put(k:K,v:V):KTreeNode<K,V>{
		if(this.root===null){
			this.root = new KTreeNode(this,k,v);
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
				const rst = new KTreeNode(this,k,v);
				if(diff<0){
					nearest.left = rst;
					rst.parent = nearest;
					rst._direction = -1;
				}
				else{
					nearest.right = rst;
					rst.parent = nearest;
					rst._direction = 1;
				}
				rst._rebalanceForInsert();
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
					this._remove(node);
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
				this._remove(curr);
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
				this._remove(curr);
			}
			return curr;
		}
	}
}
