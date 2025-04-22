// @ts-check

import { fix0Cycle,fix0Symmetric } from "./k-math.js";
import { Vector2D,transform,inverse,scale,project } from "./k2d.js";

export const TOLERANCE = 0.000001;

export function approx(a:number,b:number){
	return a>b-TOLERANCE&&a<b+TOLERANCE;
}

export function Bezier0(p1:number,p2:number):(t:number)=>number{
	return function(t){
		return 3*p1*t*(1-t)*(1-t)+3*p2*t*t*(1-t)+t*t*t;
	};
}

export function Bezier0Differential(p1:number,p2:number):(t:number)=>number{
	return function(t){
		return (9*p1-9*p2+3)*t*t+(6*p2-12*p1)*t+3*p1;
	};
}

export function Bezier0Inverse(p1:number,p2:number,b?:(t:number) => number,d?:(t:number) => number):(x:number)=>number{
	const fb = b||Bezier0(p1,p2);
	const fd = d||Bezier0Differential(p1,p2);
	return function(x){
		let t = 0.5;
		while(!approx(x,fb(t))) {
			t = t+(x-fb(t))/fd(t);
		}
		return t;
	};
}

export function deg2rad(deg:number):number{
	return deg*Math.PI/180;
}

export function rad2deg(rad:number):number{
	return rad*180/Math.PI;
}

export function fixAngle(a:number):number{
	return fix0Symmetric(a,Math.PI);
}

export function fixDirection(a:number):number{
	return fix0Cycle(a,Math.PI*2);
}

export function fixOriginDirection(ba:number,ea:number,overhead:number):number{
	const ta = fixAngle(ea-ba);
	const da = (overhead? Math.PI*2-ta:ta)/2;
	const b1oa = fixDirection(ba+da);
	const b2oa = fixDirection(ba-da);
	const e1oa = fixDirection(ea+da);
	const e2oa = fixDirection(ea-da);
	return fixAngle(b1oa-e2oa)<fixAngle(b2oa-e1oa)? b1oa:b2oa;
}

export function buildLine(x1:number,y1:number,x2:number,y2:number):Vector2D{
	return approx(x1*y2,x2*y1)? [y1,-x1,0]:transform(inverse([x1,x2,y1,y2,0,0]),[-1,-1,1]);
}

export function withinRange(x:number,a:number,b:number):boolean{
	return a<b?x>a-TOLERANCE&&x<b+TOLERANCE:x>b-TOLERANCE&&x<a+TOLERANCE;
}

export function withinRange2(x:number,y:number,x1:number,y1:number,x2:number,y2:number):boolean{
	return withinRange(x,x1,x2)&&withinRange(y,y1,y2);
}

export function withinAngle(a:number,oa:number,da:number):boolean{
	const ra = fixDirection(a);
	const roa = fixDirection(oa);
	const rda = fixAngle(da);
	let r = false;
	for(let i=0; i<3; i++){
		const dda = (i-1)*Math.PI*2.0;
		if(ra+dda>=roa-rda&&ra+dda<roa+rda){
			r = true;
			break;
		}
	}
	return r;
}

export function withinRect(x:number,y:number,width:number,height:number):boolean{
	return withinRange(x,0,width)&&withinRange(y,0,height);
}

export function withinCircle(x:number,y:number,r:number):boolean{
	return x*x+y*y<r*r;
}

export function withinLoop(x:number,y:number,r1:number,r2:number):boolean{
	return withinRange(x*x+y*y,r1*r1,r2*r2);
}

export function withinCone(x:number,y:number,r:number,a:number,da:number):boolean{
	return withinCircle(x,y,r)&&withinAngle(Math.atan2(y,x),a,da);
}

export function withinSector(x:number,y:number,r1:number,r2:number,a:number,da:number):boolean{
	return withinLoop(x,y,r1,r2)&&withinAngle(Math.atan2(y,x),a,da);
}

export function withinEllipse(x:number,y:number,rx:number,ry:number):boolean{
	const r = Math.max(rx,ry);
	const v = transform(scale(r/rx,r/ry),[x,y,0]);
	return withinCircle(v[0],v[1],r);
}

export function overlapRange(a1:number,b1:number,a2:number,b2:number):boolean{
	return withinRange(a1,a2,b2)||withinRange(b1,a2,b2)||withinAngle(a2,a1,b1)||withinRange(b2,a1,b1);
}

export function overlapRange2(x11:number,y11:number,x12:number,y12:number,x21:number,y21:number,x22:number,y22:number):boolean{
	return withinRange2(x11,y11,x21,y21,x22,y22)||withinRange2(x12,y12,x21,y21,x22,y22)||withinRange2(x21,y21,x11,y11,x12,y12)||withinRange2(x22,y22,x11,y11,x12,y12);
}

export function overlapAngle(a1:number,da1:number,a2:number,da2:number):boolean{
	return withinAngle(a2+da2,a1,da1)||withinAngle(a2-da2,a1,da1)||withinAngle(a1+da1,a2,da2)||withinAngle(a1-da1,a2,da2);
}

export function crossLine(l1:Vector2D,l2:Vector2D):Vector2D|undefined{
	return approx(l1[0]*l2[1],l1[1]*l2[0])? undefined:transform(inverse([l1[0],l2[0],l1[1],l2[1],0,0]),[-l1[2],-l2[2],1]);
}

export function crossPPLine(x11:number,y11:number,x12:number,y12:number,x21:number,y21:number,x22:number,y22:number,l1?:Vector2D,l2?:Vector2D):Vector2D|undefined{
	l1 = l1||buildLine(x11,y11,x12,y12);
	l2 = l2||buildLine(x21,y21,x22,y22);
	return crossLine(l1,l2);
}

export function crossSegment(x11:number,y11:number,x12:number,y12:number,x21:number,y21:number,x22:number,y22:number,l1?:Vector2D,l2?:Vector2D):Vector2D|undefined{
	const rst = crossPPLine(x11,y11,x12,y12,x21,y21,x22,y22,l1,l2);
	return rst&&withinRange2(rst[0],rst[1],x11,y11,x12,y12)&&withinRange2(rst[0],rst[1],x21,y21,x22,y22)? rst:undefined;
}

export function crossLineCircle(l:Vector2D,cx:number,cy:number,cr:number):Vector2D[]{
	const rst:Vector2D[] = [];
	const a = l[0];
	const b = l[1];
	const c = l[2];
	const A = a*a+b*b;
	const B = 2*a*c;
	const C = c*c-b*b*cr*cr;
	const D = B*B-4*A*C;
	if(D>=0){
		const D2 = Math.sqrt(D);
		const A2 = 1/(2*A);
		const b2 = 1/b;
		const px1 = (-B+D2)*A2;
		const py1 = -(a*px1+c)*b2;
		rst.push([px1,py1,1]);
		if(D>0){
			const px2 = (-B-D2)*A2;
			const py2 = -(a*px2+c)*b2;
			rst.push([px2,py2,1]);
		}
	}
	for(const p of rst){
		p[0] += cx;
		p[1] += cy;
	}
	return rst;
}

export function crossPPLineCircle(x1:number,y1:number,x2:number,y2:number,cx:number,cy:number,cr:number,l?:Vector2D){
	l = l||buildLine(x1-cx,y1-cy,x2-cx,y2-cy);
	return crossLineCircle(l,cx,cy,cr);
}

export function crossSegmentArc(x1:number,y1:number,x2:number,y2:number,cx:number,cy:number,cr:number,ca:number,cda:number,l?:Vector2D):Vector2D[]{
	const rst = crossPPLineCircle(x1,y1,x2,y2,cx,cy,cr,l);
	const rst2:Vector2D[] = [];
	for(const p of rst){
		if(withinRange2(p[0],p[1],x1,y1,x2,y2)&&withinAngle(Math.atan2(p[1]-cy,p[0]-cx),ca,cda)){
			rst2.push(p);
		}
	}
	return rst2;
}

export function crossArc(x1:number,y1:number,r1:number,a1:number,da1:number,x2:number,y2:number,r2:number,a2:number,da2:number):Vector2D[]{
	const rst:Vector2D[] = [];
	const dx = x2-x1;
	const dy = y2-y1;
	const dr2 = dx*dx+dy*dy;
	const r12 = r1*r1;
	const r22 = r2*r2;
	if(dr2<r12+r22+2*r1*r2){
		const dr = Math.sqrt(dr2);
		const pa1 = Math.atan2(dy,dx);
		const pda1 = Math.acos((dr2+r12-r22)/(2*dr*r1));
		const pa2 = Math.atan2(-dy,-dx);
		const pda2 = Math.acos((dr2+r22-r12)/(2*dr*r2));
		if(withinAngle(pa1+pda1,a1,da1)&&withinAngle(pa2-pda2,a2,da2)){
			rst.push([x1+r1*Math.cos(pa1+pda1),x1+r1*Math.sin(pa1+pda1),1]);
		}
		if(withinAngle(pa1-pda1,a1,da1)&&withinAngle(pa2+pda2,a2,da2)){
			rst.push([x1+r1*Math.cos(pa1-pda1),x1+r1*Math.sin(pa1-pda1),1]);
		}
	}
	return rst;
}

export function crossCircle(x1:number,y1:number,r1:number,x2:number,y2:number,r2:number){
	return crossArc(x1,y1,r1,0,Math.PI*2,x2,y2,r2,0,Math.PI*2);
}

export function overlapCircle(x1:number,y1:number,r1:number,x2:number,y2:number,r2:number):boolean{
	return withinCircle(x1-x2,y1-y2,r1+r2);
}

export function overlapCircleCone(x:number,y:number,r:number,cx:number,cy:number,cr:number,ca:number,cda:number):boolean{
	const px1 = cx+cr*Math.cos(ca+cda);
	const py1 = cy+cr*Math.sin(ca+cda);
	const px2 = cx+cr*Math.cos(ca-cda);
	const py2 = cy+cr*Math.sin(ca-cda);
	return overlapCircle(x,y,r,cx,cy,cr)&&(
		withinCone(x-cx,y-cy,cr,ca,cda)||
		withinCircle(cx-x,cy-y,r)||
		withinCircle(px1-x,py1-y,r)||
		withinCircle(px2-x,py2-y,r)||
		crossSegmentArc(cx,cy,px1,py1,x,y,r,0,Math.PI).length>0||
		crossSegmentArc(cx,cy,px2,py2,x,y,r,0,Math.PI).length>0||
		crossArc(cx,cy,cr,ca,cda,x,y,r,0,Math.PI).length>0
	);
}

export function overlapCone(x1:number,y1:number,r1:number,a1:number,da1:number,x2:number,y2:number,r2:number,a2:number,da2:number):boolean{
	const p1x1 = x1+r1*Math.cos(a1+da1);
	const p1y1 = y1+r1*Math.sin(a1+da1);
	const p1x2 = x1+r1*Math.cos(a1-da1);
	const p1y2 = y1+r1*Math.sin(a1-da1);
	const p2x1 = x2+r2*Math.cos(a2+da2);
	const p2y1 = y2+r2*Math.sin(a2+da2);
	const p2x2 = x2+r2*Math.cos(a2-da2);
	const p2y2 = y2+r2*Math.sin(a2-da2);
	const l11 = buildLine(p1x1,p1y1,x1,y1);
	const l12 = buildLine(p1x2,p1y2,x1,y1);
	const l21 = buildLine(p2x1,p2y1,x2,y2);
	const l22 = buildLine(p2x2,p2y2,x2,y2);
	return overlapCircle(x1,y1,r1,x2,y2,r2)&&(
			withinCone(x2-x1,y2-y1,r1,a1,da1)||
			withinCone(p2x1-x1,p2y1-y1,r1,a1,da1)||
			withinCone(p2x2-x1,p2y2-y1,r1,a1,da1)||
			withinCone(x1-x2,y1-y2,r2,a2,da2)||
			withinCone(p1x1-x2,p1y1-y2,r2,a2,da2)||
			withinCone(p1x2-x2,p1y2-y2,r2,a2,da2)||
			!!crossSegment(p2x1,p2y1,x2,y2,p1x1,p1y1,x1,y1,l21,l11)||
			!!crossSegment(p2x1,p2y1,x2,y2,p1x2,p1y2,x1,y1,l21,l12)||
			!!crossSegment(p2x2,p2y2,x2,y2,p1x1,p1y1,x1,y1,l22,l11)||
			!!crossSegment(p2x2,p2y2,x2,y2,p1x2,p1y2,x1,y1,l22,l12)||
			crossSegmentArc(p2x1,p2y1,x2,y2,x1,y1,r1,a1,da1,l21).length>0||
			crossSegmentArc(p2x2,p2y2,x2,y2,x1,y1,r1,a1,da1,l22).length>0||
			crossSegmentArc(p1x1,p1y1,x1,y1,x2,y2,r2,a2,da2,l11).length>0||
			crossSegmentArc(p1x2,p1y2,x1,y1,x2,y2,r2,a2,da2,l12).length>0||
			crossArc(x2,y2,r2,a2,da2,x1,y1,r1,a1,da1).length>0
		);
}

export function edge(c:Vector2D[]):Vector2D[]{
	const es:Vector2D[] = [];
	for(let i=0; i<c.length; i++){
		const p = c[i];
		const pi = i===0? c.length-1:i-1;
		const pp = c[pi];
		es.push(buildLine(p[0],p[1],pp[0],pp[1]));
	}
	return es;
}

export function overlapConvex(c1:Vector2D[],c2:Vector2D[]):boolean{
	let r = true;
	for(const a of edge(c1).concat(edge(c2))){
		const l = [a[1],-a[0],0];
		const c1px:number[] = [];
		for(const p of c1){
			c1px.push(project(p,l)[0]);
		}
		const p2cx:number[] = [];
		for(const p of c2){
			p2cx.push(project(p,l)[0]);
		}
		if(!overlapRange(Math.min(...c1px)||0,Math.max(...c1px)||0,Math.min(...p2cx)||0,Math.max(...p2cx)||0)){
			r = false;
			break;
		}
	}
	return r;
}

export function overlapConvexCircle(c:Vector2D[],x:number,y:number,r:number):boolean{
	let rr = true;
	for(const a of edge(c)){
		const l = [a[1],-a[0],0];
		const xi = !approx(l[1],0)? 0:1;
		const cpx:number[] = [];
		for(const p of c){
			cpx.push(project(p,l)[xi]);
		}
		const cx = project([x,y,1],l)[xi];
		if(!overlapRange(Math.min(...cpx)||0,Math.max(...cpx)||0,cx-r,cx+r)){
			rr = false;
			break;
		}
	}
	return rr;
}
