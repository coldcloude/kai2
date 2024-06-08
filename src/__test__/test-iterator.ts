import { arrayStream,unionStream } from "../k-iterator.js";

export default function testIterator(){
    const s1 = arrayStream(["a","b","c"]);
    const s2 = arrayStream(["x","y","z"]);
    const s3 = arrayStream(["n","m","l"]);
    const s = unionStream(s1,s2,s3);
    s.foreach((v)=>console.log(v));
}
