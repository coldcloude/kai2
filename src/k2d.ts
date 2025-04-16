/**
 *  _         _
 * |  0  2  4  |
 * |_ 1  3  5 _|
 */
export type Matrix2D = number[];

/**
 *  _   _
 * |  0  |
 * |  1  |
 * |_ 2 _|
 */
export type Vector2D = number[];

export function add(v1:Vector2D,v2:Vector2D):Vector2D{
	return [v1[0]+v2[0],v1[1]+v2[1]];
}

export function sub(v1:Vector2D,v2:Vector2D):Vector2D{
	return [v1[0]-v2[0],v1[1]-v2[1]];
}

export function mul(v:Vector2D,d:number):Vector2D{
	return [v[0]*d,v[1]*d];
}

export function div(v:Vector2D,d:number):Vector2D{
	return [v[0]/d,v[1]/d];
}

export function dot(v1:Vector2D,v2:Vector2D):number{
	return v1[0]*v2[0]+v1[1]*v2[1];
}

export function cross(v1:Vector2D,v2:Vector2D):number{
	return v1[0]*v2[1]-v2[0]*v1[1];
}

export function inverse(m:Matrix2D):Matrix2D{
	const det1 = 1/(m[0]*m[3]-m[1]*m[2]);
	return [m[3]*det1,-m[1]*det1,-m[2]*det1,m[0]*det1,(m[2]*m[5]-m[3]*m[4])*det1,(m[1]*m[4]-m[0]*m[5])*det1];
}

/**
 * point: p[2] = 1;
 * vector: v[2] = 0;
 */
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

function _cpt(r:Vector2D,v:Vector2D){
	if(v.length>2){
		r.push(v[2]);
	}
	return r;
}

export function uniform(v:Vector2D):Vector2D{
	const rr = 1/Math.sqrt(v[0]*v[0]+v[1]*v[1]);
	return _cpt([v[0]*rr,v[1]*rr],v);
}

export function project(v:Vector2D,line:Vector2D):Vector2D{
	const a = line[0];
	const b = line[1];
	const c = line[2];
	const d = a*v[1]-b*v[0];
	const ab2 = 1/(a*a+b*b);
	return _cpt([-(a*c+b*d)*ab2,(b*c-a*d)*ab2],v);
}

export function doTranslate(v:Vector2D,x:number,y:number):Vector2D{
	return _cpt([v[0]+x,v[1]+y],v);
}

export function doScale(v:Vector2D,sx:number,sy:number):Vector2D{
	return _cpt([v[0]*sx,v[1]*sy],v);
}

export function doRotate(v:Vector2D,a:number):Vector2D{
	const sa = Math.sin(a);
	const ca = Math.cos(a);
	return _cpt([v[0]*ca-v[1]*sa,v[0]*sa+v[1]*ca],v);
}
