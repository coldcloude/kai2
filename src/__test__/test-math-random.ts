import Random from "../k-math-random.js";

export default function test(seed?:bigint){
    const counts = [0,0,0,0,0,0,0,0,0,0];
    const rnd = new Random(seed);
    console.log(rnd.initSeed);
    for(let i=0; i<10000; i++){
        const v = rnd.nextInt(10n);
        counts[Number(v)]++;
    }
    console.log(counts.join(" "));
}
