import { KAsync } from "./k.js";
import { KEvent } from "./k-event.js";
import { KHashTable, strhash } from "./k-hashtable.js";
import { strcmp } from "./k-tree.js";

function TaskId(id:string|number):string{
    switch(typeof id){
        case "string":
            return "*"+id;
        case "number":
            return ":"+id;
    }
}

export class KRunner {
    eventMap = new KHashTable<string,KEvent<void>>(strcmp,strhash);
    run(id:string|number,op:KAsync,...deps:(number|string)[]){
        const tid = TaskId(id);
    }
    finish(id:string|number,cb:KAsync){

    }
}


export class KLoader{

	count:number = 1;
	event:KEvent<void> = new KEvent();

	complete(){
		this.count--;
		if(this.count===0){
			this.event.trigger();
		}
	}

	onDone(h:()=>void){
		this.event.register(h);
	}

	load(op:KAsync){
		this.count++;
		op(()=>{
			this.complete();
		});
	}
}

export class KSequenceRunner{
	queue:KAsync[] = [];
	_check(){
		const async = this.queue.shift();
		if(async){
			setTimeout(()=>async(()=>this._check()),0);
		}
	}
	add(async:KAsync){
		this.queue.push(async);
	}
	start(){
		this._check();
	}
}

export class KDependencyRunner{
	taskLists:KAsync[][] = [];
	events:KEvent<void>[] = [];
	add(batch:number,task:KAsync){
		this.taskLists[batch] = this.taskLists[batch]||[];
		this.taskLists[batch].push(task);
	}
	start(batch:number){
		const taskList = this.taskLists[batch];
		if(taskList){
			const loader = new KLoader();
			for(const task of taskList){
				loader.load(task);
			}
			const event = this.events[batch];
			if(event){
				loader.onDone(()=>event.trigger());
			}
			loader.complete();
		}
	}
	depend(batch:number,deps:number[]){
		const dl = deps.length;
		let dc = 0;
		const handler = ()=>{
			dc++;
			if(dc===dl){
				this.start(batch);
			}
		};
		for(const dep of deps){
			this.events[dep] = this.events[dep]||new KEvent();
			this.events[dep].register(handler);
		}
	}
	onDone(batch:number,op:()=>void){
		this.events[batch] = this.events[batch]||new KEvent();
		this.events[batch].register(op);
	}
}
