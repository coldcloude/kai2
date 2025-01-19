// demo of instance of

class A {

}

class B extends A {

}

class C extends B {

}

console.log("B is A = "+(new B() instanceof A));

console.log("C is B = "+(new C() instanceof B));

console.log("C is A = "+(new C() instanceof A));

// demo of declare later

type X = {
    a: string,
    b: Z
};

class Y {
    v:number;
    p:Z;
    constructor(v:number,p:Z){
        this.v = v;
        this.p = p;
    }
}

class Z {
    cs:Y[] = [];
    add(){
        this.cs.push(new Y(this.cs.length,this));
    }
}

const x:X = {
    a: "demo",
    b: new Z()
};

x.b.add();

console.log(x.b.cs[0].p.cs[0].v);

//demo as

const a:unknown = 12;

const b = a as Date;

console.log(b.getTime);

// tests

import { testListConcat, testListFindMid } from "./test-list.js";

console.log(">>>>>>>>>>>>>>>>test list concat");
testListConcat();

console.log(">>>>>>>>>>>>>>>>test list find mid");
testListFindMid();

import testAsyncLoader from "./test-loader.js";

console.log(">>>>>>>>>>>>>>>>test async loader");
await testAsyncLoader();

import testRandom from "./test-math-random.js";

console.log(">>>>>>>>>>>>>>>>test random");
testRandom();

import testTree from "./test-tree.js";

console.log(">>>>>>>>>>>>>>>>test tree");
testTree();

import testHashTable from "./test-hashtable.js";

console.log(">>>>>>>>>>>>>>>>test hash table");
testHashTable();

import testIterator from "./test-iterator.js";

console.log(">>>>>>>>>>>>>>>>test iterator");
testIterator();

import testDateFormat from "./test-date.js";

console.log(">>>>>>>>>>>>>>>>test date format");
testDateFormat();

import testNormalDistribution from "./test-dist-norm.js";

console.log(">>>>>>>>>>>>>>>>test normal distribution");
testNormalDistribution();

import testSerialize from "./test-serialize.js";

console.log(">>>>>>>>>>>>>>>>test serialize");
testSerialize();

import testFormatXml from "./test-xml.js";

console.log(">>>>>>>>>>>>>>>>test format xml");
testFormatXml("D:\\test\\test.tmx");
