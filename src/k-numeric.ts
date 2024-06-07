export function div2(l:number,r:number){
	//check negative
	const nl = l<0;
	const nr = r<0;
	const ll = nl?-l:l;
	const rr = nr?-r:r;
	//divid
	let d = Math.floor(ll/rr);
	let m = Math.round(ll-rr*d);
	// check round error
	if(m===rr){
		d++;
		m = 0;
	}
	//negative back
	if(nl&&!nr||!nl&&nr){
		d = -d;
	}
	return [d,Math.round(l-d*r)];
}

export function div(l:number,r:number){
	return div2(l,r)[0];
}

export function mod(l:number,r:number){
	return div2(l,r)[1];
}

export const MAX_INT32 = 0x7fffffff|0;
export const MIN_INT32 = 0x80000000|0;

export type Long = {
	low:number,
	high:number
};


export function bits(num:number):Long{
	const buf = new ArrayBuffer(8);
	const view = new DataView(buf);
	view.setFloat64(0,num,true);
	return {
		low: view.getInt32(0,true),
		high: view.getInt32(4,true)
	};
}

export const POSITIVE_ZERO_BITS = bits(+0.0);
export const NEGATIVE_ZERO_BITS = bits(-0.0);

export function ulp(bits1:Long, bits2:Long){
	return bits1.high===bits2.high?bits1.low-bits2.low:bits1.high-bits2.high<0?MIN_INT32:MAX_INT32;
}

export function within(x:number,y:number,maxUlps:number){

	if(isNaN(x) || isNaN(y)){
		return false;
	}

	const xInt = bits(x);
	const yInt = bits(y);

	const sgn = xInt.high<0&&yInt.high>0?-1:xInt.high>0&&yInt.high<0?1:0;

	if (sgn === 0) {
		// number have same sign, there is no risk of overflow
		return Math.abs(ulp(xInt,yInt)) <= maxUlps;
	} else {
		// number have opposite signs, take care of overflow
		const deltaPlus = sgn<0?ulp(yInt,POSITIVE_ZERO_BITS):ulp(xInt,POSITIVE_ZERO_BITS);
		const deltaMinus = sgn<0?ulp(xInt,NEGATIVE_ZERO_BITS):ulp(yInt,NEGATIVE_ZERO_BITS);
		if (deltaPlus > maxUlps || deltaMinus > maxUlps) {
			return false;
		} else {
			return deltaMinus + deltaPlus <= maxUlps;
		}
	}
}

export function equals(x:number,y:number,eps:number){
	return within(x, y, 1) || Math.abs(y - x) <= eps;
}

export abstract class ContinuedFraction {
	abstract getA(n:number,x:number):number;
	abstract getB(n:number,x:number):number;
	evaluate(x:number,args?:{
		epsilon?:number
		maxIterations?:number
	}):number{
		const epsilon = args!==undefined&&args.epsilon!==undefined?args.epsilon:10e-9;
		const maxIterations = args!==undefined&&args.maxIterations!==undefined?args.maxIterations:0x7fffffff|0;

		const small = 1e-50;

		let hPrev = this.getA(0, x);

		// use the value of small as epsilon criteria for zero checks
		if (equals(hPrev, 0.0, small)) {
			hPrev = small;
		}

		let n = 1;
		let dPrev = 0.0;
		let cPrev = hPrev;
		let hN = hPrev;

		while (n < maxIterations) {
			const a = this.getA(n, x);
			const b = this.getB(n, x);

			let dN = a + b * dPrev;
			if (equals(dN, 0.0, small)) {
				dN = small;
			}
			let cN = a + b / cPrev;
			if (equals(cN, 0.0, small)) {
				cN = small;
			}

			dN = 1.0 / dN;
			const deltaN = cN * dN;
			hN = hPrev * deltaN;

			if (!isFinite(hN)) {
				throw "ConvergenceException";
			}
			if (isNaN(hN)) {
				throw "ConvergenceException";
			}

			if (Math.abs(deltaN - 1.0) < epsilon) {
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
