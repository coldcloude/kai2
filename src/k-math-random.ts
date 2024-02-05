/**
 * The class uses a 48-bit seed, which is modified using a linear congruential formula.
 * See Donald Knuth, The Art of Computer Programming, Volume 2, Section 3.2.1.
 */

const multiplier = 0x5DEECE66Dn;
const addend = 0xBn;

const masks:bigint[] = [];
masks.push(0n);
for(let i=0; i<48; i++){
    masks.push((masks[i]<<1n)|1n);
}
const mask = masks[48];

let seedUniquifier = 8682522807148012n;

function nextSeedUniquifier(){
    return seedUniquifier = (seedUniquifier*181783497276652981n)&mask;
}

export default class Random {
    initSeed:bigint;
    seed:bigint;
    constructor(seed?:bigint){
        this.initSeed = seed===undefined?nextSeedUniquifier()^BigInt(Date.now()):seed;
        this.seed = (this.initSeed ^ multiplier) & mask;
    }
    next(bits:number){
        this.seed = (this.seed * multiplier + addend) & mask;
        return (this.seed >> BigInt(48-bits)) & masks[bits];
    }
    nextInt(bound:bigint){
        let r = this.next(31);
        const m = bound - 1n;
        if ((bound & m) === 0n) {
            // bound is a power of 2
            r = ((bound * r) >> 31n) & masks[31];
        }
        else {
            let u = r;
            r = u % bound;
            while(u-r+m<0){
                u = this.next(31);
                r = u % bound;
            }
        }
        return r;
    }
}