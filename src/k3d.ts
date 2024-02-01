export type Matrix3D = number[]

export type Vector3D = number[]

export function columnsMatrix(vs:Vector3D[]):Matrix3D{
	return [
		vs[0][0], vs[0][1], vs[0][2], vs[0][3],
		vs[1][0], vs[1][1], vs[1][2], vs[1][3],
		vs[2][0], vs[2][1], vs[2][2], vs[2][3],
		vs[3][0], vs[3][1], vs[3][2], vs[3][3]
	];
}

export function rowsMatrix(vs:Vector3D[]):Matrix3D{
	return [
		vs[0][0], vs[1][0], vs[2][0], vs[3][0],
		vs[0][1], vs[1][1], vs[2][1], vs[3][1],
		vs[0][2], vs[1][2], vs[2][2], vs[3][2],
		vs[0][3], vs[1][3], vs[2][3], vs[3][3]
	];
}

export function columnVector(m:Matrix3D,i:number):Vector3D{
	const base = i*4;
	return [
		m[base  ],
		m[base+1],
		m[base+2],
		m[base+3]
	];
}

export function rowVector(m:Matrix3D,i:number):Vector3D{
	return [
		m[i   ],
		m[i+4 ],
		m[i+8 ],
		m[i+12]
	];
}

export function dot(vl:Vector3D,vr:Vector3D):number{
	return vl[0]*vr[0]+vl[1]*vr[1]+vl[2]*vr[2]+vl[3]*vr[3];
}

export function cross(vl:Vector3D,vr:Vector3D):Vector3D{
	return [
		vl[1]*vr[2]-vl[2]*vr[1],
		vl[2]*vr[0]-vl[0]*vr[2],
		vl[0]*vr[1]-vl[1]*vr[0],
		0.0
	];
}

export function uniform(v:Vector3D):Vector3D{
	const length = 1/Math.sqrt(dot(v,v));
	return [
		v[0]*length,
		v[1]*length,
		v[2]*length,
		v[3]*length
	];
}

export function transform(m:Matrix3D,v:Vector3D):Vector3D{
	return [
		dot(rowVector(m,0),v),
		dot(rowVector(m,1),v),
		dot(rowVector(m,2),v),
		dot(rowVector(m,3),v)
	];
}

export function combine(m:Matrix3D,n:Matrix3D):Matrix3D{
	return columnsMatrix([
		transform(m,columnVector(n,0)),
		transform(m,columnVector(n,1)),
		transform(m,columnVector(n,2)),
		transform(m,columnVector(n,3))
	]);
}

export function transpose(m:Matrix3D):Matrix3D{
	return [
		m[0], m[4], m[8],  m[12],
		m[1], m[5], m[9],  m[13],
		m[2], m[6], m[10], m[14],
		m[3], m[7], m[11], m[15]
	];
}

export function inverse(m:Matrix3D):Matrix3D{
	const rc = [
		rowVector(m,0),
		rowVector(m,1),
		rowVector(m,2),
		rowVector(m,3)
	];
	const D_12_12 = rc[1][1]*rc[2][2]-rc[1][2]*rc[2][1];
	const D_12_02 = rc[1][0]*rc[2][2]-rc[1][2]*rc[2][0];
	const D_12_01 = rc[1][0]*rc[2][1]-rc[1][1]*rc[2][0];
	const D_02_12 = rc[0][1]*rc[2][2]-rc[0][2]*rc[2][1];
	const D_02_02 = rc[0][0]*rc[2][2]-rc[0][2]*rc[2][0];
	const D_02_01 = rc[0][0]*rc[2][1]-rc[0][1]*rc[2][0];
	const D_01_12 = rc[0][1]*rc[1][2]-rc[0][2]*rc[1][1];
	const D_01_02 = rc[0][0]*rc[1][2]-rc[0][2]*rc[1][0];
	const D_01_01 = rc[0][0]*rc[1][1]-rc[0][1]*rc[1][0];
	const D_12_23 = rc[1][2]*rc[2][3]-rc[1][3]*rc[2][2];
	const D_12_13 = rc[1][1]*rc[2][3]-rc[1][3]*rc[2][1];
	const D_12_03 = rc[1][0]*rc[2][3]-rc[1][3]*rc[2][0];
	const DI = 1/(rc[0][0]*D_12_12-rc[0][1]*D_12_02+rc[0][2]*D_12_01);
	const D_3_0 = -rc[0][1]*D_12_23+rc[0][2]*D_12_13-rc[0][3]*D_12_12;
	const D_3_1 = rc[0][0]*D_12_23-rc[0][2]*D_12_03+rc[0][3]*D_12_02;
	const D_3_2 = -rc[0][0]*D_12_13+rc[0][1]*D_12_03-rc[0][3]*D_12_01;
	return rowsMatrix([
		[ D_12_12*DI, -D_02_12*DI,  D_01_12*DI, D_3_0*DI],
		[-D_12_02*DI,  D_02_02*DI, -D_01_02*DI, D_3_1*DI],
		[ D_12_01*DI, -D_02_01*DI,  D_01_01*DI, D_3_2*DI],
		[ 0,           0,           0,          1       ]
	]);
}

export function unit():Matrix3D{
	return rowsMatrix([
		[1, 0, 0, 0],
		[0, 1, 0, 0],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
	]);
}

export function translate(x:number,y:number,z:number):Matrix3D{
	return rowsMatrix([
		[1, 0, 0, x],
		[0, 1, 0, y],
		[0, 0, 1, z],
		[0, 0, 0, 1]
	]);
}

export function scale(x:number,y:number,z:number):Matrix3D{
	return rowsMatrix([
		[x, 0, 0, 0],
		[0, y, 0, 0],
		[0, 0, z, 0],
		[0, 0, 0, 1]
	]);
}

export function rotateX(a:number):Matrix3D{
	const sa = Math.sin(a);
	const ca = Math.cos(a);
	return rowsMatrix([
		[1, 0,  0,   0],
		[0, ca, -sa, 0],
		[0, sa, ca,  0],
		[0, 0,  0,   1]
	]);
}

export function rotateY(a:number):Matrix3D{
	const sa = Math.sin(a);
	const ca = Math.cos(a);
	return rowsMatrix([
		[ca,  0, sa, 0],
		[0,   1, 0,  0],
		[-sa, 0, ca, 0],
		[0,   0, 0,  1]
	]);
}

export function rotateZ(a:number):Matrix3D{
	const sa = Math.sin(a);
	const ca = Math.cos(a);
	return rowsMatrix([
		[ca, -sa, 0, 0],
		[sa, ca,  0, 0],
		[0,  0,   1, 0],
		[0,  0,   0, 1]
	]);
}

export function rotateBase(ex:Vector3D,ey:Vector3D,ez:Vector3D):Matrix3D{
	return rowsMatrix([
		ex,
		ey,
		ez,
		[0, 0, 0, 1]
	]);
}

export function lookAt(eye:Vector3D,center:Vector3D,top:Vector3D):Matrix3D{
	const ez = uniform([eye[0]-center[0],eye[1]-center[1],eye[2]-center[2],0.0]);
	const ex = uniform(cross(top,ez));
	const ey = uniform(cross(ez,ex));
	return combine(rotateBase(ex,ey,ez),translate(-eye[0],-eye[1],-eye[2]));
}

export function perspectiveProject(w:number, h:number, n:number, f:number):Matrix3D {
	return rowsMatrix([
		[2.0*n/w, 0,       0,            0             ],
		[0,       2.0*n/h, 0,            0             ],
		[0,       0,       -(f+n)/(f-n), -2.0*f*n/(f-n)],
		[0,       0,       -1,           0             ]
	]);
}

export type Geometry = {
	vertex:number[],
	index:number[],
	uv:number[],
}

//	      z
//	      ^
//	      |
//	    .-|-.---0
//	   /  |/   /|
//	  .---3---. .
//	 /   /   /|/|
//	.---.---. 1------>x
//	|   |   |/|/
//	.---6---. .
//	|   |   |/
//	4---.---.
export function crystal():Geometry{
	return {
		vertex:[
			//0523
			+1.0, 1.0, 1.0,
			-1.0, 0.0, 0.0,
			+0.0, 1.0, 0.0,
			+0.0, 0.0, 1.0,
			//0631
			1.0,  1.0, 1.0,
			0.0, -1.0, 0.0,
			0.0,  0.0, 1.0,
			1.0,  0.0, 0.0,
			//0712
			1.0, 1.0,  1.0,
			0.0, 0.0, -1.0,
			1.0, 0.0,  0.0,
			0.0, 1.0,  0.0,
			//1467
			+1.0,  0.0,  0.0,
			-1.0, -1.0, -1.0,
			+0.0, -1.0,  0.0,
			+0.0,  0.0, -1.0,
			//2475
			+0.0,  1.0,  0.0,
			-1.0, -1.0, -1.0,
			+0.0,  0.0, -1.0,
			-1.0,  0.0,  0.0,
			//3456
			+0.0,  0.0,  1.0
			-1.0, -1.0, -1.0,
			-1.0,  0.0,  0.0,
			+0.0, -1.0,  0.0
		],
		index:[
			//023,532(+0)
			0, 2, 3,
			1, 3, 2,
			//031,613(+4)
			4, 6, 7,
			5, 7, 6,
			//012,721(+8)
			8, 10, 11,
			9, 11, 10,
			//167,476(+12)
			12, 14, 15,
			13, 15, 14,
			//275,457(+16)
			16, 18, 19,
			17, 19, 18,
			//356,465(+20)
			20, 22, 23,
			21, 23, 22
		],
		uv:[
			//0523
			0.5, 0.0,
			0.5, 1.0,
			0.0, 0.5,
			1.0, 0.5,
			//0631
			0.5, 0.0,
			0.5, 1.0,
			0.0, 0.5,
			1.0, 0.5,
			//0712
			0.5, 0.0,
			0.5, 1.0,
			0.0, 0.5,
			1.0, 0.5,
			//1467
			0.5, 0.0,
			0.5, 1.0,
			0.0, 0.5,
			1.0, 0.5,
			//2475
			0.5, 0.0,
			0.5, 1.0,
			0.0, 0.5,
			1.0, 0.5,
			//3456
			0.5, 0.0,
			0.5, 1.0,
			0.0, 0.5,
			1.0, 0.5
		]
	};
}

//	  y
//	  ^
//	  |
//	  2
//	 / \
//	0   1---->x
//	 \ /
//	  3
export function diamond():Geometry{
	return {
		vertex:[
			-1.0,  0.0,  0.0,
			+1.0,  0.0,  0.0,
			+0.0,  1.73, 0.0,
			+0.0, -1.73, 0.0
		],
		index:[
			2, 0, 1,
			1, 0, 3
		],
		uv:[
			0.0, 0.5,
			1.0, 0.5,
			0.5, 0.0,
			0.5, 1.0
		]
	};
}

//	    y
//	    ^
//	    |
//	0---.---1
//	|   |   |
//	.---.---.---->x
//	|   |   |
//	2---.---3
export function square():Geometry{
	return {
		vertex:[
			-1.0,  1.0, 0.0,
			+1.0,  1.0, 0.0,
			-1.0, -1.0, 0.0,
			+1.0, -1.0, 0.0
		],
		index:[
			0, 2, 1,
			1, 2, 3
		],
		uv:[
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			1.0, 1.0
		]
	};
}
