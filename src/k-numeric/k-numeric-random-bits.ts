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

import RandomGenerator from "./k-numeric-random.js";

export default abstract class BitsStreamGenerator implements RandomGenerator {
    abstract ___next(n:number):number;
    ___nextGaussian:number = Number.NaN;
    nextBoolean():boolean{
        return this.___next(1)!==0;
    }
    nextDouble():number{
        const high = this.___next(26);
        const low = this.___next(26);
        //          0x1.0p-26d                0x1.0p-52d
        return high*1.4901161193847656E-8+low*2.220446049250313e-16;
    }
    nextFloat():number{
        //                      0x1.0p-23f
        return this.___next(23)*1.1920929E-7;
    }
    nextGaussian():number{
        if (isNaN(this.___nextGaussian)) {
            // generate a new pair of gaussian numbers
            const x = this.nextDouble();
            const y = this.nextDouble();
            const alpha = 2 * Math.PI * x;
            const r     = Math.sqrt(-2 * Math.log(y));
            const random               = r * Math.cos(alpha);
            this.___nextGaussian = r * Math.sin(alpha);
            return random;
        } else {
            // use the second element of the pair already generated
            const random = this.___nextGaussian;
            this.___nextGaussian = Number.NaN;
            return random;
        }
    }
    nextInt():number{
        return this.___next(32);
    }
    nextLong():bigint{
        const high = BigInt(this.___next(32));
        const low = BigInt(this.___next(32));
        return (high<<32n)+low;
    }
}
