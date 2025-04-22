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

import BitsStreamGenerator from "./k-numeric-random-bits.js";

const INT32_MASK = 0x00ffffffffn;

let gsn = 0;

function random():bigint{
    const p1 = BigInt(new Date().getTime());
    const p2 = BigInt(gsn++);
    return p1+p2;
}

function seeding(n:bigint):number[]{
    return [Number((n>>32n)&INT32_MASK),Number(n&INT32_MASK)];
}

/** This abstract class implements the WELL class of pseudo-random number generator
 * from Fran&ccedil;ois Panneton, Pierre L'Ecuyer and Makoto Matsumoto.
 * <p>This generator is described in a paper by Fran&ccedil;ois Panneton,
 * Pierre L'Ecuyer and Makoto Matsumoto <a
 * href="http://www.iro.umontreal.ca/~lecuyer/myftp/papers/wellrng.pdf">Improved
 * Long-Period Generators Based on Linear Recurrences Modulo 2</a> ACM
 * Transactions on Mathematical Software, 32, 1 (2006). The errata for the paper
 * are in <a href="http://www.iro.umontreal.ca/~lecuyer/myftp/papers/wellrng-errata.txt">wellrng-errata.txt</a>.</p>
 * @see <a href="http://www.iro.umontreal.ca/~panneton/WELLRNG.html">WELL Random number generator</a>
 */
export default abstract class RandomWell extends BitsStreamGenerator {
    ___v:number[];
    ___iRm1:number[];
    ___iRm2:number[];
    ___i1:number[];
    ___i2:number[];
    ___i3:number[];
    ___index:number;
    constructor(k:number,m1:number,m2:number,m3:number,seed?:bigint|number[]){
        super();

        const seeds:number[] = seed===undefined?
            seeding(random())
        :typeof seed === "bigint"?
            seeding(seed as bigint)
        :seed as number[];
		
		const w = 32;
		const r = ((k+w-1)/w)|0;
		this.___v = [];
		this.___iRm1 = [];
		this.___iRm2 = [];
		this.___i1 = [];
		this.___i2 = [];
		this.___i3 = [];
        for(let j=0; j<r; j++){
            this.___iRm1.push((j + r - 1) % r);
            this.___iRm2.push((j + r - 2) % r);
            this.___i1.push((j + m1)    % r);
			this.___i2.push((j + m2)    % r);
            this.___i3.push((j + m3)    % r);
        }

		const slen = seeds.length;
        for(let i=0; i<r; i++){
			if(i<slen){
				this.___v.push(seeds[i]);
			}
			else{
				const l = BigInt(this.___v[i-slen]);
				this.___v.push(Number((1812433253n * (l ^ (l >> 30n)) + BigInt(i)) & 0xffffffffn));
			}
        }

		this.___index = 0;
    }
}