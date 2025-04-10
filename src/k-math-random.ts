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

export class Random {
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
        if(!bound){
            return this.next(32);
        }
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
    nextLong():bigint{
        return (this.next(32) << 32n) + this.next(32);
    }
    nextBoolean():boolean{
        return this.next(1) !== 0n;
    }
    nextFloat():number{
        //                           0x1.0p-24f
        return Number(this.next(24))*5.9604645E-8;
    }
    nextDouble() {
        //                           0x1.0p-26d                                    0x1.0p-53d
        return Number(this.next(26))*1.4901161193847656E-8 + Number(this.next(27))*1.1102230246251565E-16;
    }

    nextNextGaussian = 0.0;
    haveNextNextGaussian = false;
    nextGaussian() {
        // See Knuth, ACP, Section 3.4.1 Algorithm C.
        if (this.haveNextNextGaussian) {
            this.haveNextNextGaussian = false;
            return this.nextNextGaussian;
        } else {
            let v1, v2, s;
            do {
                v1 = 2 * this.nextDouble() - 1; // between -1 and 1
                v2 = 2 * this.nextDouble() - 1; // between -1 and 1
                s = v1 * v1 + v2 * v2;
            } while (s >= 1 || s == 0);
            const multiplier = Math.sqrt(-2 * Math.log(s)/s);
            this.nextNextGaussian = v2 * multiplier;
            this.haveNextNextGaussian = true;
            return v1 * multiplier;
        }
    }
}
