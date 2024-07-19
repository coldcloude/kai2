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

// tests

import testAsyncLoader from "./test-loader.js";

await testAsyncLoader();

import testMath from "./test-math.js";

testMath();

import testRandom from "./test-math-random.js";

testRandom();

import testTree from "./test-tree.js";

testTree();

import testHashTable from "./test-hashtable.js";

testHashTable();

import testIterator from "./test-iterator.js";

testIterator();

import testDateFormat from "./test-date.js";

testDateFormat();

import testNormalDistribution from "./test-dist-norm.js";

testNormalDistribution();

import testSerialize from "./test-serialize.js";

testSerialize();
