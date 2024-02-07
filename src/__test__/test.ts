import testLoader from "./test-loader.js";

import { KSequenceRunner } from "../k.js";

const runner = new KSequenceRunner();

runner.add(testLoader);

import testMath from "./test-math.js";

runner.add(testMath);

import testRandom from "./test-math-random.js";

runner.add(testRandom);

import testTree from "./test-tree.js";

runner.add(testTree);

import testHashTable from "./test-hashtable.js";

runner.add(testHashTable);

runner.start();
