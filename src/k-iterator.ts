export interface Iterator<T> {
    next():T|undefined;
}

class MapIterator<T,R> implements Iterator<R> {
    src:Iterator<T>;
    op:(v:T)=>R;
    end:boolean = false;
    constructor(src:Iterator<T>,op:(v:T)=>R){
        this.src = src;
        this.op = op;
    }
    next(){
        if(this.end){
            return undefined;
        }
        else{
            let v:R|undefined = undefined;
            const last = this.src.next();
            if(last!==undefined){
                v = this.op(last);
            }
            else{
                this.end = true;
            }
            return v;
        }
    }
}

class FlatMapIterator<T,R> implements Iterator<R>{
    src:Iterator<T>;
    op:(v:T)=>Iterator<R>;
    end:boolean = false;
    buffer:Iterator<R>|undefined = undefined;
    constructor(src:Iterator<T>,op:(v:T)=>Iterator<R>){
        this.src = src;
        this.op = op;
    }
    next(){
        if(this.end){
            return undefined;
        }
        else{
            let v = undefined;
            while(!this.end&&v===undefined){
                while(!this.end&&this.buffer===undefined){
                    const last = this.src.next();
                    if(last!==undefined){
                        this.buffer = this.op(last);
                    }
                    else{
                        this.end = true;
                    }
                }
                if(this.buffer!==undefined){
                    v = this.buffer.next();
                    if(v===undefined){
                        this.buffer = undefined;
                    }
                }
            }
            return v;
        }
    }
}

class FilterIterator<T> implements Iterator<T>{
    src:Iterator<T>;
    op:(v:T)=>boolean;
    end:boolean = false;
    constructor(src:Iterator<T>,op:(v:T)=>boolean){
        this.src = src;
        this.op = op;
    }
    next(){
        if(this.end){
            return undefined;
        }
        else{
            let v = undefined;
            while(!this.end&&v===undefined){
                const last = this.src.next();
                if(last!==undefined){
                    v = this.op(last)?last:undefined;
                }
                else{
                    this.end = true;
                }
            }
            return v;
        }
    }
}

export class Stream<T> implements Iterator<T> {
    src:Iterator<T>;
    constructor(src:Iterator<T>){
        this.src = src;
    }
    next():T|undefined{
        return this.src.next();
    }
    foreach(op:(v:T,i?:Iterator<T>)=>boolean|void){
        let end = false;
        let v = undefined;
        while(!end&&v!=true){
            const last = this.next();
            if(last!==undefined){
                v = op(last,this);
            }
            else{
                end = true;
            }
        }
        return v;
    }
    map<R>(op:(v:T)=>R){
        return new Stream<R>(new MapIterator<T,R>(this.src,op));
    }
    flatMap<R>(op:(v:T)=>Iterator<R>){
        return new Stream<R>(new FlatMapIterator<T,R>(this.src,op));
    }
    filter(op:(v:T)=>boolean){
        return new Stream<T>(new FilterIterator<T>(this.src,op));
    }
}

class NumberIterator implements Iterator<number>{
    end:number;
    step:number;
    curr:number;
    constructor(start:number,end:number,step:number){
        this.end = end;
        this.step = step;
        this.curr = start;
    }
    next(){
        if(this.step>0&&this.curr<this.end||this.step<0&&this.curr>this.end){
            const last = this.curr;
            this.curr += this.step;
            return last;
        }
        else{
            return undefined;
        }
    }
}

export function countStream(count:number,reverse?:boolean){
    const ri = reverse===true?new NumberIterator(count-1,-1,-1):new NumberIterator(0,count,1);
    return new Stream<number>(ri);
}

export function numberStream(start:number,end:number,step:number){
    const ri = new NumberIterator(start,end,step);
    return new Stream<number>(ri);
}

export function rangeStream(start:number,end:number){
    return numberStream(start,end,start<end?1:-1);
}

export function arrayStream<T>(arr:T[],reverse?:boolean){
    return countStream(arr.length,reverse).map((i:number)=>arr[i]);
}

export function subArrayStream<T>(arr:T[],start:number,end:number){
    return rangeStream(start,end).map((i:number)=>arr[i]);
}

class NilIterator<T> implements Iterator<T>{
    next(){
        return undefined;
    }
}

export function nilStream<T>(){
    return new Stream<T>(new NilIterator<T>());
}

class OnceIterator<T> implements Iterator<T>{
    op:(()=>T)|undefined;
    constructor(op:()=>T){
        this.op = op;
    }
    next(){
        if(this.op===undefined){
            return undefined;
        }
        else{
            const last = this.op();
            this.op = undefined;
            return last;
        }
    }
}

export function onceStream<T>(op:()=>T){
    return new Stream<T>(new OnceIterator<T>(op));
}

export function unionStream<T>(...ss:Stream<T>[]){
    return arrayStream(ss).flatMap((s)=>s);
}
