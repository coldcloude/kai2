import { KAsync } from "./k.js";
import { KEvent } from "./k-event.js";
import { KHashTable, strhash } from "./k-hashtable.js";
import { strcmp } from "./k-tree.js";

class Task{
	id:string;
	op:KAsync;
	started = false;
	finished = false;
	_event = new KEvent<void>();
	_rests = new KHashTable<string,void>(strcmp,strhash);
	_start(){
		if(this._rests.size===0){
			if(!this.started){
				this.started = true;
				this.op(()=>{
					this.finished = true;
					this._event.trigger();
				});
			}
		}
	}
	constructor(id:string,op:KAsync,deps:Task[]){
		this.id = id;
		this.op = op;
		//add self
		this._rests.set(id);
		//add unfinished deps
		for(const task of deps){
			if(!task.finished){
				this._rests.set(task.id);
				task.onFinish(()=>{
					this._rests.get(task.id,true);
					this._start();
				});
			}
		}
	}
	start(){
		this._rests.get(this.id,true);
		this._start();
	}
	onFinish(cb:()=>void){
		if(!this.finished){
			this._event.register(cb);
		}
		else{
			cb();
		}
	}
}

function TaskId(id:string|number):string{
    switch(typeof id){
        case "string":
            return "*"+id;
        case "number":
            return ":"+id;
    }
}

export class KRunner {
    taskMap = new KHashTable<string,Task>(strcmp,strhash);
	sn = 0;
	_findDeps(deps:(number|string)[]){
		const dts:Task[] = [];
		for(const d of deps){
			const dtid = TaskId(d);
			const dtask = this.taskMap.get(dtid)!;
			dts.push(dtask);
		}
		return dts;
	}
    runTask(id:string|number,op:KAsync,...deps:(number|string)[]){
        const tid = TaskId(id);
		const dts = this._findDeps(deps);
		const task = new Task(tid,op,dts);
		this.taskMap.set(tid,task);
		task.start();
    }
    run(op:KAsync,...deps:(number|string)[]){
        const tid = "?"+(this.sn++);
		const dts = this._findDeps(deps);
		const task = new Task(tid,op,dts);
		task.start();
    }
}

export function KSequence(ops:KAsync[]){
	return (cb?:()=>void)=>{
		const runner = new KRunner();
		for(let i=0; i<ops.length; i++){
			if(i===0){
				runner.runTask(i,ops[i]);
			}
			else{
				runner.runTask(i,ops[i],i-1);
			}
		}
		if(cb!==undefined){
			runner.run(cb,ops.length-1);
		}
	};
}

export function KConcurrent(ops:KAsync[]){
	return (cb?:()=>void)=>{
		const runner = new KRunner();
		const deps:number[] = [];
		for(let i=0; i<ops.length; i++){
			runner.runTask(i,ops[i]);
			deps.push(i);
		}
		if(cb!==undefined){
			runner.run(cb,...deps);
		}
	};
}
