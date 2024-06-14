export const MAX_INT8 = 0x0000007f|0;
export const MIN_INT8 = 0xffffff80|0;
export const MAX_INT16 = 0x00007fff|0;
export const MIN_INT16 = 0xffff8000|0;
export const MAX_INT32 = 0x7fffffff|0;
export const MIN_INT32 = 0x80000000|0;

const NUM2HEX = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
const HEX2NUM = new Map<string,number>();
for(let i=0; i<NUM2HEX.length; i++){
	HEX2NUM.set(NUM2HEX[i],i);
}

export function byte2hex(byte:number):string{
	return NUM2HEX[(byte>>4)&0x0F]+NUM2HEX[byte&0x0F];
}

export function hex2byte(hex:string):number{
	return uint8((((HEX2NUM.get(hex[0])||0)<<4)|(HEX2NUM.get(hex[1])||0)));
}

function UIntN(N:number):(n:number)=>number{
	const mask = 0xFFFFFFFF>>>(32-N|0);
	return function(n){
		return (n|0)&mask;
	};
}

const uint8 = UIntN(8);
const uint16 = UIntN(16);
const uint32 = UIntN(32);

export {
	uint8,
	uint16,
	uint32
};

export function uintN(n:number,N:number):number{
	return (n|0)&(0xFFFFFFFF>>>(32-(N|0)));
}

export function max(...arr:number[]):number|undefined{
	let rst:number|undefined = undefined;
	for(const n of arr){
		rst = rst?Math.max(rst,n):n;
	}
	return rst;
}

export function min(...arr:number[]):number | undefined{
	let rst:number|undefined = undefined;
	for(const n of arr){
		rst = rst?Math.min(rst,n):n;
	}
	return rst;
}

export function fix0Cycle(num:number,top:number):number{
	while(num<0){
		num += top;
	}
	while(num>=top){
		num -= top;
	}
	return num;
}

export function fix0Symmetric(num:number,s:number){
	const top = s*2;
	num = fix0Cycle(num,top);
	return num>s?top-num:num;
}

export function pad0(num:number,len:number,radix?:number):string{
	radix = radix||10;
	let str = num.toString(radix);
	while(str.length<len){
		str = "0"+str;
	}
	return str;
}
