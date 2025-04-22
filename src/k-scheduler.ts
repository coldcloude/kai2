import { KList } from "./k-list.js";
import { KNumTree } from "./k-tree.js";

type TimeoutTask = {
    targetTime:number,
    callback:()=>void
};

type IntervalTask = TimeoutTask&{
    interval:number
};

export type KCanceler = {
    cancel: ()=>void
};

export class KScheduler {
    time = 0;
    timeoutMap = new KNumTree<[KList<TimeoutTask>,KList<IntervalTask>]>();
    assertTasks(priority:number){
        return this.timeoutMap.computeIfAbsent(priority,()=>[new KList<TimeoutTask>(),new KList<IntervalTask>()])!;
    }
    tick(dt:number){
        this.time += dt;
        this.timeoutMap.removeIf((p,tasks)=>{
            tasks[0].removeIf(task=>{
                if(this.time>=task.targetTime){
                    task.callback();
                    return true;
                }
                else{
                    return false;
                }
            });
            tasks[1].foreach(task=>{
                while(this.time>=task.targetTime){
                    task.callback();
                    task.targetTime += task.interval;
                }
            });
            return tasks[0].size===0&&tasks[1].size===0;
        });
    }
    setTimeout(callback:()=>void,timeout:number,_priority?:number):KCanceler{
        const priority = _priority||0;
        const task:TimeoutTask = {
            targetTime: this.time+timeout,
            callback: callback
        };
        const task$ = this.assertTasks(priority)[0].push(task);
        return {
            cancel: ()=>{
                const tasks = this.timeoutMap.get(priority);
                if(tasks){
                    tasks[0].removeNode(task$);
                }
            }
        };
    }
    setInterval(callback:()=>void,delay:number,interval:number,_priority?:number):KCanceler{
        const priority = _priority||0;
        const task:IntervalTask = {
            targetTime: this.time+delay,
            callback: callback,
            interval: interval
        };
        const task$ = this.assertTasks(priority)[1].push(task);
        return {
            cancel: ()=>{
                const tasks = this.timeoutMap.get(priority);
                if(tasks){
                    tasks[1].removeNode(task$);
                }
            }
        };
    }
}
