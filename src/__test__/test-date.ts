import { DateFormat } from "../k-date.js";

export default function testDateFormat(){
    const df1 = new DateFormat("yyyy-MM-dd HH:mm:ss.SSS");
    const df2 = new DateFormat("dd/MM/yyyy HHmmss +SSS");
    const d = df1.parse("2024-06-10 18:57:30.876");
    console.log(d.getTime());
    console.log(df2.format(d));
}