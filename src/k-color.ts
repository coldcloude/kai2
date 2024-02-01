import {min,max,fix0Cycle,fix0Symmetric,pad0} from './k-math.js';

export type Color3 = number[];

export function colorF2I(a:number):number{
	return Math.round(a*255);
}

export function colorI2F(d:number):number{
	return d/255;
}

export function color2rgb(color:Color3):Color3{
	const rgb = [0,0,0];
	for(let i=0; i<3; i++){
		rgb[i] = colorI2F(color[i]);
	}
	return rgb;
}

export function rgb2color(rgb:Color3):Color3{
	const color = [0,0,0];
	for(let i=0; i<3; i++){
		color[i] = colorF2I(rgb[i]);
	}
	return color;
}

export function hsl2rgb(hsl:Color3):Color3{
	const h = hsl[0];
	const s = hsl[1];
	const l = hsl[2];
	const rgb = [l,l,l];
	if(s!==0){
		const q = l<0.5? l*(1+s):l+s-l*s;
		const p = 2*l-q;
		for(let i=0; i<3; i++){
			const d = (i-1)/3;
			const t = fix0Cycle(h+d,1);
			rgb[i] = t<1/6? p+(q-p)*6*t:t<1/2? q:t<2/3? p+(q-p)*(2/3-t)*6:p;
		}
	}
	return rgb;
}

export function rgb2hsl(rgb:Color3):Color3{
	const r = rgb[0];
	const g = rgb[1];
	const b = rgb[2];
	const light = max(...rgb)||0;
	const dark = min(...rgb)||0;
	const l = (light+dark)/2;
	if(light!==dark){
		const d = light-dark;
		const s = d/fix0Symmetric(l,1/2)/2;
		const h = fix0Cycle(light===r? (g-b)/d/6:light===g? (b-r)/d/6+1/3:(r-g)/d/6+2/3,1);
		return [h,s,l];
	}
	else{
		return [0,0,l];
	}
}

export function hsl2color(hsl:Color3):Color3{
	return rgb2color(hsl2rgb(hsl));
}

export function color2hsl(color:Color3):Color3{
	return rgb2hsl(color2rgb(color));
}

export function string2color(str:string):Color3{
	const color = [0,0,0];
	if(str.charAt(0)==="#"){
		const value = str.substring(1);
		if(value.length===3){
			for(let i=0; i<3; i++){
				const cs = value.charAt(i);
				color[i] = parseInt(cs+cs,16);
			}
		}
		else if(value.length===3*2){
			for(let i=0; i<3; i++){
				const bi = i*2;
				color[i] = parseInt(value.substring(bi,bi+2),16);
			}
		}
	}
	return color;
}

export function color2string(color:Color3):string{
	let str = "#";
	for(const c of color){
		str += pad0(c,2,16);
	}
	return str;
}
