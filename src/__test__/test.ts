
import { KSequence } from "../k-runner.js";

import testLoader from "./test-loader.js";

import testMath from "./test-math.js";

import testRandom from "./test-math-random.js";

import testTree from "./test-tree.js";

import testHashTable from "./test-hashtable.js";

KSequence([
    testLoader,
    testMath,
    (cb)=>{
        testRandom(cb);
    },
    (cb)=>{
        testTree(cb);
    },
    testHashTable
])();
