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
import RandomGenerator from "./k-numeric-random.js";
import RandomWell19937c from "./k-numeric-random-well19937c.js";
import { ZERO,HALF,ONE,TWO,PI } from './k-numeric-hp.js';
import { erf,erf2,erfInv } from "./k-numeric-hp-erf.js";

const SQRT2 = TWO.sqrt();

export default class NormalDistribution {
    ___random:RandomGenerator;
    mean:Decimal;
    standardDeviation:Decimal;
    ___logStandardDeviationPlusHalfLog2Pi:Decimal;
    constructor(mean?:Decimal,sd?:Decimal,rng?:RandomGenerator){
        this.mean = mean===undefined?ZERO:mean;
        this.standardDeviation = sd===undefined?ONE:sd;
        this.___random = rng===undefined?new RandomWell19937c():rng;
		if(!this.standardDeviation.isPos()){
			throw "NotStrictlyPositiveException: "+sd;
		}
		this.___logStandardDeviationPlusHalfLog2Pi = this.standardDeviation.ln().add(HALF.mul(TWO.mul(PI).ln()));
    }
    density(x:Decimal):Decimal{
        return this.logDensity(x).exp();
    }
    logDensity(x:Decimal):Decimal{
        const x0 = x.sub(this.mean);
        const x1 = x0.div(this.standardDeviation);
        return HALF.neg().mul(x1).mul(x1).sub(this.___logStandardDeviationPlusHalfLog2Pi);
    }
    cumulativeProbability(x:Decimal):Decimal{
        const dev = x.sub(this.mean);
        if (dev.abs().gt(this.standardDeviation.mul(40))) {
            return dev.isNeg() ? ZERO : ONE;
        }
        else {
            return HALF.mul(ONE.add(erf(dev.div(this.standardDeviation.mul(SQRT2)))));
        }
    }
    inverseCumulativeProbability(p:Decimal):Decimal{
        if (p.isNeg() || p.gt(ONE)) {
            throw "OutOfRangeException: "+p;
        }
        return this.mean.add(this.standardDeviation.mul(SQRT2).mul(erfInv(TWO.mul(p).sub(ONE))));
    }
    probability(x0:Decimal,x1:Decimal):Decimal{
        if (x0.gt(x1)) {
            throw "NumberIsTooLargeException: "+x0+","+x1;
        }
        const denom = this.standardDeviation.mul(SQRT2);
        const v0 = x0.sub(this.mean).div(denom);
        const v1 = x1.sub(this.mean).div(denom);
        return HALF.mul(erf2(v0, v1));
    }
    sample():Decimal{
        return this.standardDeviation.mul(this.___random.nextGaussian()).add(this.mean);
    }
}
