import { KHashTable, strhash } from "./k-hashtable.js";
import { strcmp } from "./k-tree.js";

export type KAHandler<T> = (v:T)=>Promise<void>;

export type KAsync = KAHandler<void>;

async function run(op:KAsync,deps:Promise<void>[]){
	for(const dep of deps){
		await dep;
	}
	await op();
}

function TaskId(id:string|number):string{
    switch(typeof id){
        case "string":
            return "*"+id;
        case "number":
            return ":"+id;
    }
}

export class KARunner {
    _taskMap = new KHashTable<string,Promise<void>>(strcmp,strhash);
	_findDeps(deps:(number|string)[]){
		const dts:Promise<void>[] = [];
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
		this._taskMap.set(tid,run(op,dts));
    }
    run(op:()=>Promise<void>,...deps:(number|string)[]){
		const dts = this._findDeps(deps);
		run(op,dts);
    }
}

export async function KASequence(ops:KAsync[]){
	for(const op of ops){
		await op();
	}
}

export async function KAConcurrent(ops:KAsync[]){
	const rst:Promise<void>[] = [];
	for(const op of ops){
		rst.push(op());
	}
	for(const r of rst){
		await r;
	}
}
