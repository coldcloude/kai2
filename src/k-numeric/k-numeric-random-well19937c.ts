/**
 * translated from Apache commons-math3
 * 
 * original LICENSE:
 * 
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * original NOTICE:
 * 
 * Apache Commons Math
 * Copyright 2001-2016 The Apache Software Foundation
 * 
 * This product includes software developed at
 * The Apache Software Foundation (http://www.apache.org/).
 * 
 * This product includes software developed for Orekit by
 * CS Systèmes d'Information (http://www.c-s.fr/)
 * Copyright 2010-2012 CS Systèmes d'Information
 */

import RandomWell from "./k-numeric-random-well.js";

/** This class implements the WELL19937c pseudo-random number generator
 * from Fran&ccedil;ois Panneton, Pierre L'Ecuyer and Makoto Matsumoto.
 * <p>This generator is described in a paper by Fran&ccedil;ois Panneton,
 * Pierre L'Ecuyer and Makoto Matsumoto <a
 * href="http://www.iro.umontreal.ca/~lecuyer/myftp/papers/wellrng.pdf">Improved
 * Long-Period Generators Based on Linear Recurrences Modulo 2</a> ACM
 * Transactions on Mathematical Software, 32, 1 (2006). The errata for the paper
 * are in <a href="http://www.iro.umontreal.ca/~lecuyer/myftp/papers/wellrng-errata.txt">wellrng-errata.txt</a>.</p>
 * @see <a href="http://www.iro.umontreal.ca/~panneton/WELLRNG.html">WELL Random number generator</a>
 */
export default class RandomWell19937c extends RandomWell {
    constructor(seed?:bigint|number[]){
        super(19937,70,179,449,seed);
    }
    ___next(bits:number):number{

        const indexRm1 = this.___iRm1[this.___index];
        const indexRm2 = this.___iRm2[this.___index];

        const v0       = this.___v[this.___index];
        const vM1      = this.___v[this.___i1[this.___index]];
        const vM2      = this.___v[this.___i2[this.___index]];
        const vM3      = this.___v[this.___i3[this.___index]];

        const z0 = (0x80000000 & this.___v[indexRm1]) ^ (0x7FFFFFFF & this.___v[indexRm2]);
        const z1 = (v0 ^ (v0 << 25))  ^ (vM1 ^ (vM1 >>> 27));
        const z2 = (vM2 >>> 9) ^ (vM3 ^ (vM3 >>> 1));
        const z3 = z1      ^ z2;
        let z4 = z0 ^ (z1 ^ (z1 << 9)) ^ (z2 ^ (z2 << 21)) ^ (z3 ^ (z3 >>> 21));

        this.___v[this.___index]     = z3;
        this.___v[indexRm1]  = z4;
        this.___v[indexRm2] &= 0x80000000;
        this.___index        = indexRm1;

        // add Matsumoto-Kurita tempering
        // to get a maximally-equidistributed generator
        z4 ^= (z4 <<  7) & 0xe46e1700;
        z4 ^= (z4 << 15) & 0x9b868000;

        return z4 >>> (32 - bits);
    }
}
