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

import { MAX_INT32 } from '../k-math.js';
import { Decimal } from 'decimal.js';
import { ZERO,ONE } from './k-numeric-hp.js';

const DEFAULT_EPSILON = 10e-9;

const SMALL = new Decimal(1e-50);

function equals(x:Decimal,y:Decimal,small:Decimal){
    const sgn = x.isNeg()&&y.isPos()?-1:x.isPos()&&y.isNeg()?1:0;
    if(sgn===0){
        return x.sub(y).abs().lt(small);
    }
    else{
        const dx = x.abs();
        const dy = y.abs();
        return dx.lt(small)&&dy.lt(small)&&dx.add(dy).lt(small);
    }
}

/**
 * Provides a generic means to evaluate continued fractions.  Subclasses simply
 * provided the a and b coefficients to evaluate the continued fraction.
 *
 * <p>
 * References:
 * <ul>
 * <li><a href="http://mathworld.wolfram.com/ContinuedFraction.html">
 * Continued Fraction</a></li>
 * </ul>
 * </p>
 *
 */
export default abstract class ContinuedFraction {
	abstract getA(n:number,x:Decimal):Decimal;
	abstract getB(n:number,x:Decimal):Decimal;
	evaluate(x:Decimal,args?:{
		epsilon?:Decimal
		maxIterations?:number
	}):Decimal{

		const epsilon = args!==undefined&&args.epsilon!==undefined?args.epsilon:DEFAULT_EPSILON;
		const maxIterations = args!==undefined&&args.maxIterations!==undefined?args.maxIterations:MAX_INT32;

		let hPrev = this.getA(0, x);

		// use the value of small as epsilon criteria for zero checks
		if (equals(hPrev, ZERO, SMALL)) {
			hPrev = SMALL;
		}

		let n = 1;
		let dPrev = ZERO;
		let cPrev = hPrev;
		let hN = hPrev;

		while (n < maxIterations) {
			const a = this.getA(n, x);
			const b = this.getB(n, x);

			let dN = a.add(b.mul(dPrev));
			if (equals(dN, ZERO, SMALL)) {
				dN = SMALL;
			}
			let cN = a.add(b.div(cPrev));
			if (equals(cN, ZERO, SMALL)) {
				cN = SMALL;
			}

			dN = ONE.div(dN);
			const deltaN = cN.mul(dN);
            
			hN = hPrev.mul(deltaN);

			if (!hN.isFinite()) {
				throw "ConvergenceException";
			}
			if (hN.isNaN()) {
				throw "ConvergenceException";
			}

			if (deltaN.sub(ONE).abs().lt(epsilon)) {
				break;
			}

			dPrev = dN;
			cPrev = cN;
			hPrev = hN;
			n++;
		}

		if (n >= maxIterations) {
			throw "MaxCountExceededException: "+maxIterations;
		}

		return hN;
	}
}
