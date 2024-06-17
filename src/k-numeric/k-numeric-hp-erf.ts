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

import Decimal from "decimal.js";
import { ZERO,HALF,ONE,TWO,POSITIVE_INFINITY } from './k-numeric-hp.js';
import { regularizedGammaP,regularizedGammaQ } from "./k-numeric-hp-gamma.js";

const DEFAULT_EPSILON = new Decimal(1.0e-15);

const X_CRIT = new Decimal(0.4769362762044697);

/**
 * Returns the error function.
 *
 * <p>erf(x) = 2/&radic;&pi; <sub>0</sub>&int;<sup>x</sup> e<sup>-t<sup>2</sup></sup>dt </p>
 *
 * <p>This implementation computes erf(x) using the
 * {@link Gamma#regularizedGammaP(double, double, double, int) regularized gamma function},
 * following <a href="http://mathworld.wolfram.com/Erf.html"> Erf</a>, equation (3)</p>
 *
 * <p>The value returned is always between -1 and 1 (inclusive).
 * If {@code abs(x) > 40}, then {@code erf(x)} is indistinguishable from
 * either 1 or -1 as a double, so the appropriate extreme value is returned.
 * </p>
 */
export function erf(x:Decimal):Decimal{
    if (x.abs().gt(40)) {
        return x.isPos() ? ONE : ONE.neg();
    }
    const ret = regularizedGammaP(HALF, x.mul(x), {
        epsilon: DEFAULT_EPSILON,
        maxIterations: 10000
    });
    return x.isNeg() ? ret.neg() : ret;
}

/**
 * Returns the complementary error function.
 *
 * <p>erfc(x) = 2/&radic;&pi; <sub>x</sub>&int;<sup>&infin;</sup> e<sup>-t<sup>2</sup></sup>dt
 * <br/>
 *    = 1 - {@link #erf(double) erf(x)} </p>
 *
 * <p>This implementation computes erfc(x) using the
 * {@link Gamma#regularizedGammaQ(double, double, double, int) regularized gamma function},
 * following <a href="http://mathworld.wolfram.com/Erf.html"> Erf</a>, equation (3).</p>
 *
 * <p>The value returned is always between 0 and 2 (inclusive).
 * If {@code abs(x) > 40}, then {@code erf(x)} is indistinguishable from
 * either 0 or 2 as a double, so the appropriate extreme value is returned.
 * </p>
 */
export function erfc(x:Decimal):Decimal{
    if (x.abs().gt(40)) {
        return x.isPos() ? ZERO : TWO;
    }
    const ret = regularizedGammaQ(HALF, x.mul(x), {
        epsilon: DEFAULT_EPSILON,
        maxIterations: 10000
    });
    return x.isNeg() ? TWO.sub(ret) : ret;
}

/**
 * Returns the difference between erf(x1) and erf(x2).
 *
 * The implementation uses either erf(double) or erfc(double)
 * depending on which provides the most precise result.
 */
export function erf2(x1:Decimal,x2:Decimal):Decimal{

    if(x1.gt(x2)) {
        return erf2(x2, x1).neg();
    }

    return x1.lt(X_CRIT.neg()) ?
        x2.isNeg() ?
            erfc(x2.neg()).sub(erfc(x1.neg())) :
            erf(x2).sub(erf(x1)) :
        x2.gt(X_CRIT) && x1.isPos() ?
            erfc(x1).sub(erfc(x2)) :
            erf(x2).sub(erf(x1));
}

/**
 * Returns the inverse erf.
 * <p>
 * This implementation is described in the paper:
 * <a href="http://people.maths.ox.ac.uk/gilesm/files/gems_erfinv.pdf">Approximating
 * the erfinv function</a> by Mike Giles, Oxford-Man Institute of Quantitative Finance,
 * which was published in GPU Computing Gems, volume 2, 2010.
 * The source code is available <a href="http://gpucomputing.net/?q=node/1828">here</a>.
 * </p>
 */
export function erfInv(x:Decimal):Decimal{


    // beware that the logarithm argument must be
    // commputed as (1.0 - x) * (1.0 + x),
    // it must NOT be simplified as 1.0 - x * x as this
    // would induce rounding errors near the boundaries +/-1
    let w = ONE.sub(x).mul((ONE.add(x))).ln().neg();
    let p;

    if (w.lt(6.25)) {
        w = w.sub(3.125);
        p = new Decimal("-3.6444120640178196996e-21");
        p = new Decimal("-1.685059138182016589e-19").add(p.mul(w));
        p = new Decimal( "1.2858480715256400167e-18").add(p.mul(w));
        p =	new Decimal( "1.115787767802518096e-17").add(p.mul(w));
        p = new Decimal("-1.333171662854620906e-16").add(p.mul(w));
        p = new Decimal( "2.0972767875968561637e-17").add(p.mul(w));
        p = new Decimal( "6.6376381343583238325e-15").add(p.mul(w));
        p = new Decimal("-4.0545662729752068639e-14").add(p.mul(w));
        p = new Decimal("-8.1519341976054721522e-14").add(p.mul(w));
        p = new Decimal( "2.6335093153082322977e-12").add(p.mul(w));
        p = new Decimal("-1.2975133253453532498e-11").add(p.mul(w));
        p = new Decimal("-5.4154120542946279317e-11").add(p.mul(w));
        p =	new Decimal( "1.051212273321532285e-09").add(p.mul(w));
        p = new Decimal("-4.1126339803469836976e-09").add(p.mul(w));
        p = new Decimal("-2.9070369957882005086e-08").add(p.mul(w));
        p = new Decimal( "4.2347877827932403518e-07").add(p.mul(w));
        p = new Decimal("-1.3654692000834678645e-06").add(p.mul(w));
        p = new Decimal("-1.3882523362786468719e-05").add(p.mul(w));
        p =	new Decimal( "0.0001867342080340571352").add(p.mul(w));
        p = new Decimal("-0.00074070253416626697512").add(p.mul(w));
        p = new Decimal("-0.0060336708714301490533").add(p.mul(w));
        p =	new Decimal( "0.24015818242558961693").add(p.mul(w));
        p =	new Decimal( "1.6536545626831027356").add(p.mul(w));
    } else if (w.lt(16)) {
        w = w.sqrt().sub(3.25);
        p = new Decimal( "2.2137376921775787049e-09");
        p = new Decimal( "9.0756561938885390979e-08").add(p.mul(w));
        p = new Decimal("-2.7517406297064545428e-07").add(p.mul(w));
        p = new Decimal( "1.8239629214389227755e-08").add(p.mul(w));
        p = new Decimal( "1.5027403968909827627e-06").add(p.mul(w));
        p = new Decimal("-4.013867526981545969e-06").add(p.mul(w));
        p = new Decimal( "2.9234449089955446044e-06").add(p.mul(w));
        p = new Decimal( "1.2475304481671778723e-05").add(p.mul(w));
        p = new Decimal("-4.7318229009055733981e-05").add(p.mul(w));
        p = new Decimal( "6.8284851459573175448e-05").add(p.mul(w));
        p = new Decimal( "2.4031110387097893999e-05").add(p.mul(w));
        p = new Decimal("-0.0003550375203628474796").add(p.mul(w));
        p = new Decimal( "0.00095328937973738049703").add(p.mul(w));
        p = new Decimal("-0.0016882755560235047313").add(p.mul(w));
        p =	new Decimal( "0.0024914420961078508066").add(p.mul(w));
        p = new Decimal("-0.0037512085075692412107").add(p.mul(w));
        p =	new Decimal( "0.005370914553590063617").add(p.mul(w));
        p =	new Decimal( "1.0052589676941592334").add(p.mul(w));
        p =	new Decimal( "3.0838856104922207635").add(p.mul(w));
    } else if (w.isFinite()) {
        w = w.sqrt().sub(5);
        p = new Decimal("-2.7109920616438573243e-11");
        p = new Decimal("-2.5556418169965252055e-10").add(p.mul(w));
        p = new Decimal( "1.5076572693500548083e-09").add(p.mul(w));
        p = new Decimal("-3.7894654401267369937e-09").add(p.mul(w));
        p = new Decimal( "7.6157012080783393804e-09").add(p.mul(w));
        p = new Decimal("-1.4960026627149240478e-08").add(p.mul(w));
        p = new Decimal( "2.9147953450901080826e-08").add(p.mul(w));
        p = new Decimal("-6.7711997758452339498e-08").add(p.mul(w));
        p = new Decimal( "2.2900482228026654717e-07").add(p.mul(w));
        p = new Decimal("-9.9298272942317002539e-07").add(p.mul(w));
        p = new Decimal( "4.5260625972231537039e-06").add(p.mul(w));
        p = new Decimal("-1.9681778105531670567e-05").add(p.mul(w));
        p = new Decimal( "7.5995277030017761139e-05").add(p.mul(w));
        p = new Decimal("-0.00021503011930044477347").add(p.mul(w));
        p = new Decimal("-0.00013871931833623122026").add(p.mul(w));
        p =	new Decimal( "1.0103004648645343977").add(p.mul(w));
        p =	new Decimal( "4.8499064014085844221").add(p.mul(w));
    } else {
        // this branch does not appears in the original code, it
        // was added because the previous branch does not handle
        // x = +/-1 correctly. In this case, w is positive infinity
        // and as the first coefficient (-2.71e-11) is negative.
        // Once the first multiplication is done, p becomes negative
        // infinity and remains so throughout the polynomial evaluation.
        // So the branch above incorrectly returns negative infinity
        // instead of the correct positive infinity.
        p = POSITIVE_INFINITY;
    }

    return p.mul(x);
}

/**
 * Returns the inverse erfc.
 */
export function erfcInv(x:Decimal):Decimal{
    return erfInv(ONE.sub(x));
}
