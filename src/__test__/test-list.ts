import { findMid } from "../k-list.js";
import { deserializeList, valListSerialize } from "../k-serialize.js";

export function testListConcat(){
    const srcs: string[][] = [[],["a"],["a","b"]];
    const dsts: string[][] = [[],["x"],["x","y"]];
    for(const s of srcs){
        for(const d of dsts){
            let sl = deserializeList(s,v=>v);
            let dl = deserializeList(d,v=>v);
            console.log("before null");
            sl.concatBefore(dl,null);
            console.log("["+sl.size+"]"+valListSerialize(sl).join(" "));
            sl = deserializeList(s,v=>v);
            dl = deserializeList(d,v=>v);
            console.log("before head");
            sl.concatBefore(dl,sl.head);
            console.log("["+sl.size+"]"+valListSerialize(sl).join(" "));
            sl = deserializeList(s,v=>v);
            dl = deserializeList(d,v=>v);
            console.log("before tail");
            sl.concatBefore(dl,sl.tail);
            console.log("["+sl.size+"]"+valListSerialize(sl).join(" "));
            sl = deserializeList(s,v=>v);
            dl = deserializeList(d,v=>v);
            console.log("after null");
            sl.concatAfter(dl,null);
            console.log("["+sl.size+"]"+valListSerialize(sl).join(" "));
            sl = deserializeList(s,v=>v);
            dl = deserializeList(d,v=>v);
            console.log("after head");
            sl.concatAfter(dl,sl.head);
            console.log("["+sl.size+"]"+valListSerialize(sl).join(" "));
            sl = deserializeList(s,v=>v);
            dl = deserializeList(d,v=>v);
            console.log("after tail");
            sl.concatAfter(dl,sl.tail);
            console.log("["+sl.size+"]"+valListSerialize(sl).join(" "));
        }
    }
}

export function testListFindMid(){
    console.log("mid of size 0");
    let src:string[] = [];
    let sl = deserializeList(src,v=>v);
    let m$ = findMid(sl,null,null);
    console.log(m$?m$.value:"null");
    m$ = findMid(sl,sl.head,null);
    console.log(m$?m$.value:"null");
    m$ = findMid(sl,null,sl.tail);
    console.log(m$?m$.value:"null");
    m$ = findMid(sl,sl.head,sl.tail);
    console.log(m$?m$.value:"null");
    console.log("mid of size 1");
    src = ["0"];
    sl = deserializeList(src,v=>v);
    m$ = findMid(sl,null,null);
    console.log(m$?m$.value:"null");
    m$ = findMid(sl,sl.head,null);
    console.log(m$?m$.value:"null");
    m$ = findMid(sl,null,sl.tail);
    console.log(m$?m$.value:"null");
    m$ = findMid(sl,sl.head,sl.tail);
    console.log(m$?m$.value:"null");
    console.log("mid of size 2");
    src = ["0","1"];
    sl = deserializeList(src,v=>v);
    m$ = findMid(sl,null,null);
    console.log(m$?m$.value:"null");
    m$ = findMid(sl,sl.head,null);
    console.log(m$?m$.value:"null");
    m$ = findMid(sl,null,sl.tail);
    console.log(m$?m$.value:"null");
    m$ = findMid(sl,sl.head,sl.tail);
    console.log(m$?m$.value:"null");
    console.log("mid of size 3");
    src = ["0","1","2"];
    sl = deserializeList(src,v=>v);
    m$ = findMid(sl,null,null);
    console.log(m$?m$.value:"null");
    m$ = findMid(sl,sl.head,null);
    console.log(m$?m$.value:"null");
    m$ = findMid(sl,null,sl.tail);
    console.log(m$?m$.value:"null");
    m$ = findMid(sl,sl.head,sl.tail);
    console.log(m$?m$.value:"null");
}
