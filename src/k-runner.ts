import { KEvent } from "./k-event.js";
import { KHashTable, strhash } from "./k-hashtable.js";
import { strcmp } from "./k-tree.js";

export type KAsync = (cb:()=>void)=>void;

export abstract class IKTask {
	started = false;
	finished = false;
	abstract start():void;
	abstract onFinish(cb:()=>void):void;
}

export interface IKRunner {
	runTask(id:string|number,op:KAsync,...deps:(number|string)[]):IKTask;
    run(op:KAsync,...deps:(number|string)[]):IKTask;
}

class Task extends IKTask {
	id:string;
	op:KAsync;
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
		super();
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

export class KRunner implements IKRunner {
    _taskMap = new KHashTable<string,Task>(strcmp,strhash);
	_sn = 0;
	_findDeps(deps:(number|string)[]){
		const dts:Task[] = [];
		for(const d of deps){
			const dtid = TaskId(d);
			const dtask = this._taskMap.get(dtid)!;
			dts.push(dtask);
		}
		return dts;
	}
    runTask(id:string|number,op:KAsync,...deps:(number|string)[]){
        const tid = TaskId(id);
		const dts = this._findDeps(deps);
		const task = new Task(tid,op,dts);
		this._taskMap.set(tid,task);
		task.start();
		return task;
    }
    run(op:KAsync,...deps:(number|string)[]){
        const tid = "?"+(this._sn++);
		const dts = this._findDeps(deps);
		const task = new Task(tid,op,dts);
		task.start();
		return task;
    }
}

export function KSequence(ops:KAsync[],runner?:IKRunner){
	return (cb?:()=>void)=>{
		runner = runner||new KRunner();
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

export function KConcurrent(ops:KAsync[],runner?:IKRunner){
	return (cb?:()=>void)=>{
		runner = runner||new KRunner();
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
