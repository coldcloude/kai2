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

import { Decimal } from 'decimal.js';
import { MAX_INT32 } from '../k-math.js';
import { ZERO,HALF,ONE,TWO,NAN,POSITIVE_INFINITY,PI } from './k-numeric-hp.js';
import ContinuedFraction from './k-numeric-hp-cf.js';

/**
 * <p>
 * This is a utility class that provides computation methods related to the
 * &Gamma; (Gamma) family of functions.
 * </p>
 * <p>
 * Implementation of {@link #invGamma1pm1(Decimal)} and
 * {@link #logGamma1p(Decimal)} is based on the algorithms described in
 * <ul>
 * <li><a href="http://dx.doi.org/10.1145/22721.23109">Didonato and Morris
 * (1986)</a>, <em>Computation of the Incomplete Gamma Function Ratios and
 *     their Inverse</em>, TOMS 12(4), 377-393,</li>
 * <li><a href="http://dx.doi.org/10.1145/131766.131776">Didonato and Morris
 * (1992)</a>, <em>Algorithm 708: Significant Digit Computation of the
 *     Incomplete Beta Function Ratios</em>, TOMS 18(3), 360-373,</li>
 * </ul>
 * and implemented in the
 * <a href="http://www.dtic.mil/docs/citations/ADA476840">NSWC Library of Mathematical Functions</a>,
 * available
 * <a href="http://www.ualberta.ca/CNS/RESEARCH/Software/NumericalNSWC/site.html">here</a>.
 * This library is "approved for public release", and the
 * <a href="http://www.dtic.mil/dtic/pdf/announcements/CopyrightGuidance.pdf">Copyright guidance</a>
 * indicates that unless otherwise stated in the code, all FORTRAN functions in
 * this library are license free. Since no such notice appears in the code these
 * functions can safely be ported to Commons-Math.
 * </p>
 *
 */

const DEFAULT_EPSILON = new Decimal(10e-15);

const GAMMA = new Decimal("0.577215664901532860606512090082");

const LANCZOS_G = new Decimal(607).div(new Decimal(128));

const LANCZOS_STR = [
     "0.99999999999999709182",
      "57.156235665862923517",
     "-59.597960355475491248",
      "14.136097974741747174",
    "-0.49191381609762019978",
     "0.33994649984811888699e-4",
     "0.46523628927048575665e-4",
    "-0.98374475304879564677e-4",
     "0.15808870322491248884e-3",
    "-0.21026444172410488319e-3",
     "0.21743961811521264320e-3",
    "-0.16431810653676389022e-3",
     "0.84418223983852743293e-4",
    "-0.26190838401581408670e-4",
     "0.36899182659531622704e-5",
];

const LANCZOS:Decimal[] = [];
for(const s of LANCZOS_STR){
    LANCZOS.push(new Decimal(s));
}

const HALF_LOG_2_PI = HALF.mul(TWO.mul(PI).ln());

const SQRT_TWO_PI = TWO.mul(PI).sqrt();

const C_LIMIT = new Decimal(49);

const S_LIMIT = new Decimal(1e-5);

const INV_GAMMA1P_M1_A0 = new Decimal( "0.611609510448141581788E-08");

const INV_GAMMA1P_M1_A1 = new Decimal( "0.624730830116465516210E-08");

const INV_GAMMA1P_M1_B1 = new Decimal( "0.203610414066806987300E+00");

const INV_GAMMA1P_M1_B2 = new Decimal( "0.266205348428949217746E-01");

const INV_GAMMA1P_M1_B3 = new Decimal( "0.493944979382446875238E-03");

const INV_GAMMA1P_M1_B4 = new Decimal("-0.851419432440314906588E-05");

const INV_GAMMA1P_M1_B5 = new Decimal("-0.643045481779353022248E-05");

const INV_GAMMA1P_M1_B6 = new Decimal( "0.992641840672773722196E-06");

const INV_GAMMA1P_M1_B7 = new Decimal("-0.607761895722825260739E-07");

const INV_GAMMA1P_M1_B8 = new Decimal( "0.195755836614639731882E-09");

const INV_GAMMA1P_M1_P0 = new Decimal( "0.6116095104481415817861E-08");

const INV_GAMMA1P_M1_P1 = new Decimal( "0.6871674113067198736152E-08");

const INV_GAMMA1P_M1_P2 = new Decimal( "0.6820161668496170657918E-09");

const INV_GAMMA1P_M1_P3 = new Decimal( "0.4686843322948848031080E-10");

const INV_GAMMA1P_M1_P4 = new Decimal( "0.1572833027710446286995E-11");

const INV_GAMMA1P_M1_P5 = new Decimal("-0.1249441572276366213222E-12");

const INV_GAMMA1P_M1_P6 = new Decimal( "0.4343529937408594255178E-14");

const INV_GAMMA1P_M1_Q1 = new Decimal( "0.3056961078365221025009E+00");

const INV_GAMMA1P_M1_Q2 = new Decimal( "0.5464213086042296536016E-01");

const INV_GAMMA1P_M1_Q3 = new Decimal( "0.4956830093825887312020E-02");

const INV_GAMMA1P_M1_Q4 = new Decimal( "0.2692369466186361192876E-03");

const INV_GAMMA1P_M1_C =   new Decimal("-0.422784335098467139393487909917598E+00");

const INV_GAMMA1P_M1_C0 =  new Decimal( "0.577215664901532860606512090082402E+00");

const INV_GAMMA1P_M1_C1 =  new Decimal("-0.655878071520253881077019515145390E+00");

const INV_GAMMA1P_M1_C2 =  new Decimal("-0.420026350340952355290039348754298E-01");

const INV_GAMMA1P_M1_C3 =  new Decimal( "0.166538611382291489501700795102105E+00");

const INV_GAMMA1P_M1_C4 =  new Decimal("-0.421977345555443367482083012891874E-01");

const INV_GAMMA1P_M1_C5 =  new Decimal("-0.962197152787697356211492167234820E-02");

const INV_GAMMA1P_M1_C6 =  new Decimal( "0.721894324666309954239501034044657E-02");

const INV_GAMMA1P_M1_C7 =  new Decimal("-0.116516759185906511211397108401839E-02");

const INV_GAMMA1P_M1_C8 =  new Decimal("-0.215241674114950972815729963053648E-03");

const INV_GAMMA1P_M1_C9 =  new Decimal( "0.128050282388116186153198626328164E-03");

const INV_GAMMA1P_M1_C10 = new Decimal("-0.201348547807882386556893914210218E-04");

const INV_GAMMA1P_M1_C11 = new Decimal("-0.125049348214267065734535947383309E-05");

const INV_GAMMA1P_M1_C12 = new Decimal( "0.113302723198169588237412962033074E-05");

const INV_GAMMA1P_M1_C13 = new Decimal("-0.205633841697760710345015413002057E-06");

function invGamma1pm1(x:Decimal):Decimal{

    if (x.lt(HALF.neg())) {
        throw new Error("NumberIsTooSmallException: ");
    }
    if (x.gt(1.5)) {
        throw new Error("NumberIsTooLargeException: "+x);
    }

    const t = x.lte(HALF) ? x : x.sub(HALF).sub(HALF);
    if (t.isNeg()) {
        const a = INV_GAMMA1P_M1_A0.add(t.mul(INV_GAMMA1P_M1_A1));
 
        let b = INV_GAMMA1P_M1_B8;
        b = INV_GAMMA1P_M1_B7.add(t.mul(b));
        b = INV_GAMMA1P_M1_B6.add(t.mul(b));
        b = INV_GAMMA1P_M1_B5.add(t.mul(b));
        b = INV_GAMMA1P_M1_B4.add(t.mul(b));
        b = INV_GAMMA1P_M1_B3.add(t.mul(b));
        b = INV_GAMMA1P_M1_B2.add(t.mul(b));
        b = INV_GAMMA1P_M1_B1.add(t.mul(b));
        b = ONE.add(t.mul(b));

        let c = INV_GAMMA1P_M1_C13.add(t.mul(a.div(b)));
        c = INV_GAMMA1P_M1_C12.add(t.mul(c));
        c = INV_GAMMA1P_M1_C11.add(t.mul(c));
        c = INV_GAMMA1P_M1_C10.add(t.mul(c));
        c = INV_GAMMA1P_M1_C9.add(t.mul(c));
        c = INV_GAMMA1P_M1_C8.add(t.mul(c));
        c = INV_GAMMA1P_M1_C7.add(t.mul(c));
        c = INV_GAMMA1P_M1_C6.add(t.mul(c));
        c = INV_GAMMA1P_M1_C5.add(t.mul(c));
        c = INV_GAMMA1P_M1_C4.add(t.mul(c));
        c = INV_GAMMA1P_M1_C3.add(t.mul(c));
        c = INV_GAMMA1P_M1_C2.add(t.mul(c));
        c = INV_GAMMA1P_M1_C1.add(t.mul(c));
        c = INV_GAMMA1P_M1_C.add(t.mul(c));
        if (x.gt(HALF)) {
            return t.mul(c).div(x);
        } else {
            return x.mul(c.add(HALF).add(HALF));
        }
    } else {
        let p = INV_GAMMA1P_M1_P6;
        p = INV_GAMMA1P_M1_P5.add(t.mul(p));
        p = INV_GAMMA1P_M1_P4.add(t.mul(p));
        p = INV_GAMMA1P_M1_P3.add(t.mul(p));
        p = INV_GAMMA1P_M1_P2.add(t.mul(p));
        p = INV_GAMMA1P_M1_P1.add(t.mul(p));
        p = INV_GAMMA1P_M1_P0.add(t.mul(p));

        let q = INV_GAMMA1P_M1_Q4;
        q = INV_GAMMA1P_M1_Q3.add(t.mul(q));
        q = INV_GAMMA1P_M1_Q2.add(t.mul(q));
        q = INV_GAMMA1P_M1_Q1.add(t.mul(q));
        q = ONE.add(t.mul(q));

        let c = INV_GAMMA1P_M1_C13.add(p.div(q).mul(t));
        c = INV_GAMMA1P_M1_C12.add(t.mul(c));
        c = INV_GAMMA1P_M1_C11.add(t.mul(c));
        c = INV_GAMMA1P_M1_C10.add(t.mul(c));
        c = INV_GAMMA1P_M1_C9.add(t.mul(c));
        c = INV_GAMMA1P_M1_C8.add(t.mul(c));
        c = INV_GAMMA1P_M1_C7.add(t.mul(c));
        c = INV_GAMMA1P_M1_C6.add(t.mul(c));
        c = INV_GAMMA1P_M1_C5.add(t.mul(c));
        c = INV_GAMMA1P_M1_C4.add(t.mul(c));
        c = INV_GAMMA1P_M1_C3.add(t.mul(c));
        c = INV_GAMMA1P_M1_C2.add(t.mul(c));
        c = INV_GAMMA1P_M1_C1.add(t.mul(c));
        c = INV_GAMMA1P_M1_C0.add(t.mul(c));

        if (x .gt(HALF)) {
            return t.div(x).mul(c.sub(HALF).sub(HALF));
        } else {
            return x.mul(c);
        }
    }
}

function logGamma1p(x:Decimal):Decimal{
    return ONE.add(invGamma1pm1(x)).ln().neg();
}

function lanczos(x:Decimal):Decimal{
    let sum = ZERO;
    for (let i = LANCZOS.length - 1; i > 0; --i) {
        sum = sum.add(LANCZOS[i].div(x.add(i)));
    }
    return sum.add(LANCZOS[0]);
}

export function logGamma(x:Decimal):Decimal{
    if (x.isNaN() || !x.isPos()) {
        return NAN;
    } else if (x.lt(HALF)) {
        return logGamma1p(x).sub(x.ln());
    } else if (x.lte(2.5)) {
        return logGamma1p(x.sub(HALF).sub(HALF));
    } else if (x.lte(8)) {
        const n = (Math.floor(x.toNumber() - 1.5))|0;
        let prod = ONE;
        for (let i = 1; i <= n; i++) {
            prod = prod.mul(x.sub(i));
        }
        return logGamma1p(x.sub(n + 1)).add(prod.ln());
    } else {
        const sum = lanczos(x);
        const tmp = x.add(LANCZOS_G).add(HALF);
        return x.add(HALF).mul(tmp.ln()).sub(tmp).add(HALF_LOG_2_PI).add(sum.div(x).ln());
    }
}

function regularizedGammaPImpl(a:Decimal,x:Decimal,epsilon:Decimal,maxIterations:number):Decimal{
        // calculate series
        let n = 0; // current element index
        let an = ONE.div(a); // n-th element in the series
        let sum = an; // partial sum
        while (an.div(sum).gt(epsilon) &&
               n < maxIterations &&
               sum.lt(POSITIVE_INFINITY)) {
            // compute next element in the series
            n += 1|0;
            an = an.mul(x.div(a.add(n)));
            // update partial sum
            sum = sum.add(an);
        }
        if (n >= maxIterations) {
            throw new Error("MaxCountExceededException: "+maxIterations);
        } else if (!sum.isFinite()) {
            return ONE;
        } else {
            return x.neg().add(a.mul(x.ln())).sub(logGamma(a)).exp().mul(sum);
        }
}

class GammaContinuedFraction extends ContinuedFraction{
    a:Decimal;
    constructor(a:Decimal){
        super();
        this.a = a;
    }
    getA(n: number, x: Decimal): Decimal {
        return new Decimal((2 * n|0) + 1).sub(this.a).add(x);
    }
    getB(n: number, x: Decimal): Decimal {
        const nn = new Decimal(n);
        return nn.mul(this.a.sub(nn));
    }
}

function regularizedGammaQImpl(a:Decimal,x:Decimal,epsilon:Decimal,maxIterations:number):Decimal{
        // create continued fraction
        const cf = new GammaContinuedFraction(a);
        const ret = ONE.div(cf.evaluate(x, {
            epsilon: epsilon,
            maxIterations: maxIterations
        }));
        return x.neg().add(a.mul(x.ln())).sub(logGamma(a)).exp().mul(ret);
}

export function regularizedGammaP(a:Decimal,x:Decimal,args?:{
    epsilon?:Decimal
    maxIterations?:number
}):Decimal{
    const epsilon = args!==undefined&&args.epsilon!==undefined?args.epsilon:DEFAULT_EPSILON;
    const maxIterations = args!==undefined&&args.maxIterations!==undefined?args.maxIterations:MAX_INT32;
    if (a.isNaN() || x.isNaN() || !a.isPos() || x.isNeg()) {
        return NAN;
    } else if (x.eq(ZERO)) {
        return ZERO;
    } else if (x.gte(a.add(ONE))) {
        // use regularizedGammaQ because it should converge faster in this
        // case.
        return ONE.sub(regularizedGammaQImpl(a, x, epsilon, maxIterations));
    } else {
        return regularizedGammaPImpl(a, x, epsilon, maxIterations);
    }
}

export function regularizedGammaQ(a:Decimal,x:Decimal,args?:{
    epsilon?:Decimal
    maxIterations?:number
}):Decimal{
    const epsilon = args!==undefined&&args.epsilon!==undefined?args.epsilon:DEFAULT_EPSILON;
    const maxIterations = args!==undefined&&args.maxIterations!==undefined?args.maxIterations:MAX_INT32;
    if (a.isNaN() || x.isNaN() || !a.isPos() || x.isNeg()) {
        return NAN;
    } else if (x.eq(ZERO)) {
        return ONE;
    } else if (x.lt(a.add(ONE))) {
        // use regularizedGammaP because it should converge faster in this
        // case.
        return ONE.sub(regularizedGammaPImpl(a, x, epsilon, maxIterations));
    } else {
        return regularizedGammaQImpl(a, x, epsilon, maxIterations);
    }
}

export function digamma(x:Decimal):Decimal{

    if (x.isNaN() || !x.isFinite()) {
        return x;
    }

    if (x.isPos() && x.lte(S_LIMIT)) {
        // use method 5 from Bernardo AS103
        // accurate to O(x)
        return GAMMA.neg().sub(ONE.div(x));
    }

    if (x.gte(C_LIMIT)) {
        // use method 4 (accurate to O(1/x^8)
        const inv = ONE.div(x.mul(x));
        //			1	   1		1		 1
        // log(x) -  --- - ------ + ------- - -------
        //		   2 x   12 x^2   120 x^4   252 x^6
        return x.ln().sub(HALF.div(x)).sub(inv.mul(ONE.div(12).add(inv.mul(ONE.div(120).sub(inv.div(252))))));
    }

    return digamma(x.add(ONE)).sub(ONE.div(x));
}

export function trigamma(x:Decimal):Decimal{

    if (x.isNaN() || !x.isFinite()) {
        return x;
    }

    if (x.isPos() && x.lte(S_LIMIT)) {
        return ONE.div(x.mul(x));
    }

    if (x.gte(C_LIMIT)) {
        const inv = ONE.div(x.mul(x));
        //  1	1	  1	   1	   1
        //  - + ---- + ---- - ----- + -----
        //  x	  2	  3	   5	   7
        //	  2 x	6 x	30 x	42 x
        return ONE.div(x).add(inv.div(TWO)).add(inv.div(x).mul((ONE.div(6).sub(inv.mul((ONE.div(30).add(inv.div(42))))))));
    }

    return trigamma(x.add(ONE)).add(ONE.div(x.mul(x)));
}

export function gamma(x:Decimal):Decimal{

    if (x.isInteger() && !x.isPos()) {
        return NAN;
    }

    const absX = x.abs();
    if (absX.lte(20)) {
        if (x.gte(ONE)) {
            /*
             * From the recurrence relation
             * Gamma(x) = (x - 1) * ... * (x - n) * Gamma(x - n),
             * then
             * Gamma(t) = 1 / [1 + invGamma1pm1(t - 1)],
             * where t = x - n. This means that t must satisfy
             * -0.5 <= t - 1 <= 1.5.
             */
            let prod = ONE;
            let t = x;
            while (t.gt(2.5)) {
                t = t.sub(ONE);
                prod = prod.mul(t);
            }
            return prod.div(ONE.add(invGamma1pm1(t.sub(ONE))));
        } else {
            /*
             * From the recurrence relation
             * Gamma(x) = Gamma(x + n + 1) / [x * (x + 1) * ... * (x + n)]
             * then
             * Gamma(x + n + 1) = 1 / [1 + invGamma1pm1(x + n)],
             * which requires -0.5 <= x + n <= 1.5.
             */
            let prod = x;
            let t = x;
            while (t.lt(HALF.neg())) {
                t = t.add(ONE);
                prod = prod.mul(t);
            }
            return ONE.div(prod.mul(ONE.add(invGamma1pm1(t))));
        }
    } else {
        const y = absX.add(LANCZOS_G).add(HALF);
        const gammaAbs = SQRT_TWO_PI.div(absX)
            .mul(y.pow(absX.add(HALF)))
            .mul(y.neg().exp())
            .mul(lanczos(absX));
        if (x.isPos()) {
            return gammaAbs;
        } else {
            /*
             * From the reflection formula
             * Gamma(x) * Gamma(1 - x) * sin(pi * x) = pi,
             * and the recurrence relation
             * Gamma(1 - x) = -x * Gamma(-x),
             * it is found
             * Gamma(x) = -pi / [x * sin(pi * x) * Gamma(-x)].
             */
            return PI.neg().div(x.mul(PI.mul(x).sin()).mul(gammaAbs));
        }
    }
}
