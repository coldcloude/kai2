import { KHashTable,strhash } from "./k-hashtable.js";
import { KAVLTree,strcmp,numcmp } from "./k-tree.js";
import { pad0 } from "./k-math.js";

export const MS_OF_DAY = 1000*60*60*24;

export const TIMEZONE_OFFSET = new Date().getTimezoneOffset()*60000;

type PartPattern = {
    length:number,
    parse:(str:string,offset:number,date:Date)=>Date,
    format:(date:Date)=>string
};

const PART_PATTERN_MAP = new KHashTable<string,PartPattern>(strcmp,strhash);

PART_PATTERN_MAP.set("yyyy",{
    length: 4,
    parse: (str,offset,date)=>{
        date.setFullYear(parseInt(str.substring(offset,offset+4)));
        return date;
    },
    format: (date)=>{
        return pad0(date.getFullYear(),4);
    }
});

PART_PATTERN_MAP.set("MM",{
    length: 2,
    parse: (str,offset,date)=>{
        date.setMonth(parseInt(str.substring(offset,offset+2))-1);
        return date;
    },
    format: (date)=>{
        return pad0(date.getMonth()+1,2);
    }
});

PART_PATTERN_MAP.set("dd",{
    length: 2,
    parse: (str,offset,date)=>{
        date.setDate(parseInt(str.substring(offset,offset+2)));
        return date;
    },
    format: (date)=>{
        return pad0(date.getDate(),2);
    }
});

PART_PATTERN_MAP.set("HH",{
    length: 2,
    parse: (str,offset,date)=>{
        date.setHours(parseInt(str.substring(offset,offset+2)));
        return date;
    },
    format: (date)=>{
        return pad0(date.getHours(),2);
    }
});

PART_PATTERN_MAP.set("mm",{
    length: 2,
    parse: (str,offset,date)=>{
        date.setMinutes(parseInt(str.substring(offset,offset+2)));
        return date;
    },
    format: (date)=>{
        return pad0(date.getMinutes(),2);
    }
});

PART_PATTERN_MAP.set("ss",{
    length: 2,
    parse: (str,offset,date)=>{
        date.setSeconds(parseInt(str.substring(offset,offset+2)));
        return date;
    },
    format: (date)=>{
        return pad0(date.getSeconds(),2);
    }
});

PART_PATTERN_MAP.set("SSS",{
    length: 3,
    parse: (str,offset,date)=>{
        date.setMilliseconds(parseInt(str.substring(offset,offset+3)));
        return date;
    },
    format: (date)=>{
        return pad0(date.getMilliseconds(),3);
    }
});

export class DateFormat{
    pattern:string;
    ps:KAVLTree<number,PartPattern> = new KAVLTree(numcmp);
    constructor(pattern:string){
        this.pattern = pattern;
        PART_PATTERN_MAP.foreach((p,pp)=>{
            const start = pattern.indexOf(p);
            if(start>=0){
                this.ps.set(start,pp);
            }
        });
    }
    parse(str:string){
        const date = new Date(TIMEZONE_OFFSET);
        this.ps.foreach((start,pp)=>{
            pp.parse(str,start,date);
        });
        return date;
    }
    format(date:Date){
        let rst = "";
        let offset = 0;
        this.ps.foreach((start,pp)=>{
            if(offset<start){
                rst += this.pattern.substring(offset,start);
                offset += pp.length;
            }
            rst += pp.format(date);
            offset += pp.length;
        });
        if(offset<this.pattern.length){
            rst += this.pattern.substring(offset,this.pattern.length);
        }
        return rst;
    }
}
