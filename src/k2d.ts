export type Matrix2D = number[];

export type Vector2D = number[];

export function inverse(m:Matrix2D):Matrix2D{
	const det1 = 1/(m[0]*m[3]-m[1]*m[2]);
	return [m[3]*det1,-m[1]*det1,-m[2]*det1,m[0]*det1,(m[2]*m[5]-m[3]*m[4])*det1,(m[1]*m[4]-m[0]*m[5])*det1];
}

export function transform(m:Matrix2D,p:Vector2D):Vector2D{
	return [m[0]*p[0]+m[2]*p[1]+m[4]*p[2],m[1]*p[0]+m[3]*p[1]+m[5]*p[2],p[2]];
}

export function combine(m:Matrix2D,n:Matrix2D):Matrix2D{
	return [m[0]*n[0]+m[2]*n[1],m[1]*n[0]+m[3]*n[1],m[0]*n[2]+m[2]*n[3],m[1]*n[2]+m[3]*n[3],m[0]*n[4]+m[2]*n[5]+m[4],m[1]*n[4]+m[3]*n[5]+m[5]];
}

export function unit():Matrix2D{
	return [1,0,0,1,0,0];
}

export function translate(x:number,y:number):Matrix2D{
	return [1,0,0,1,x,y];
}

export function scale(sx:number,sy:number):Matrix2D{
	return [sx,0,0,sy,0,0];
}

export function rotate(a:number):Matrix2D{
	const sa = Math.sin(a);
	const ca = Math.cos(a);
	return [ca,sa,-sa,ca,0,0];
}

export function project(point:Vector2D,line:Vector2D):Vector2D{
	const a = line[0];
	const b = line[1];
	const c = line[2];
	const d = a*point[1]-b*point[0];
	const ab2 = 1/(a*a+b*b);
	return [-(a*c+b*d)*ab2,(b*c-a*d)*ab2,1];
}
