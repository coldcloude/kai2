// @ts-check

import { fix0Cycle,fix0Symmetric } from "./k-math.js";
import { KNumTree, numcmp } from "./k-tree.js";
import { Vector2D,transform,inverse,scale,project, cross, dot } from "./k2d.js";

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

export function distance(x1:number,y1:number,x2:number,y2:number):number{
	const dx = x2-x1;
	const dy = y2-y1;
	return Math.sqrt(dx*dx+dy*dy);
}

export function angle(x1:number,y1:number,x2:number,y2:number):number{
	return Math.atan2(y2-y1,x2-x1);
}

/**
 * from (x1,y1),(x2,y2) to [A,B,C] in Ax+By+C=0
 */
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
	let min1,max1,min2,max2;
	if(a1<b1){
		min1 = a1-TOLERANCE;
		max1 = b1+TOLERANCE;
	}
	else{
		min1 = b1-TOLERANCE;
		max1 = a1+TOLERANCE;
	}
	if(a2<b2){
		min2 = a2-TOLERANCE;
		max2 = b2+TOLERANCE;
	}
	else{
		min2 = b2-TOLERANCE;
		max2 = a2+TOLERANCE;
	}
	return min1<max2&&min2<max1;
}

export function overlapRange2(x11:number,y11:number,x12:number,y12:number,x21:number,y21:number,x22:number,y22:number):boolean{
	return overlapRange(x11,x12,x21,x22)&&overlapRange(y11,y12,y21,y22);
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
		if(withinRange2(p[0],p[1],x1,y1,x2,y2)&&withinAngle(angle(cx,cy,p[0],p[1]),ca,cda)){
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

export function sideOf(x:number,y:number,x1:number,y1:number,x2:number,y2:number){
	return cross([x2-x1,y2-y1],[x-x1,y-y1]);
}

export function onSegment(x:number,y:number,x1:number,y1:number,x2:number,y2:number,side?:number){
	if(withinRange2(x,y,x1,y1,x2,y2)){
		side = side===undefined?sideOf(x,y,x1,y1,x2,y2):side;
		return approx(side,0);
	}
	else{
		return false;
	}
}

export function isCrossSegment(x11:number,y11:number,x12:number,y12:number,x21:number,y21:number,x22:number,y22:number,side11?:number,side12?:number,side21?:number,side22?:number):boolean{

	// 排斥试验
	if(Math.min(x11,x12)>Math.max(x21,x22)||Math.min(x21,x22)>Math.max(x11,x12)||Math.min(y11,y12)>Math.max(y21,y22)||Math.min(y21,y22)>Math.max(y11,y12)){
		return false;
	}

	// 跨立试验
    side11 = side11===undefined?sideOf(x21,y21,x11,y11,x12,y12):side11;
    side12 = side12===undefined?sideOf(x22,y22,x11,y11,x12,y12):side12;
    side21 = side21===undefined?sideOf(x11,y11,x21,y21,x22,y22):side21;
    side22 = side22===undefined?sideOf(x12,y12,x21,y21,x22,y22):side22;
    if((side11<0&&side12>0||side11>0&&side12<0)&&(side21<0&&side22>0||side12>0&&side22<0)){
        return true;
    }

    // 检查端点是否在另一条线段上
    return onSegment(x21,y21,x11,y11,x12,y12,side11)||onSegment(x22,y22,x11,y11,x12,y12,side12)||onSegment(x11,y11,x21,y21,x22,y22,side21)||onSegment(x12,y12,x21,y21,x22,y22,side22);
}

export function buildConvex(points:Vector2D[]):Vector2D[]{

	//少于三个点无论怎样排列都是凸多边形
	if(points.length<3){
		return [...points];
	}

    // 找到最下且最左的点作为基准点
	const pMap = new KNumTree<KNumTree<boolean>>();
    for(const p of points){
		pMap.computeIfAbsent(p[0],()=>new KNumTree<boolean>())!.set(p[1],true);
    }
	const pivot:Vector2D = [];
	const sorted:Vector2D[] = [];
	pMap.foreach((x,yMap)=>{
		yMap.foreach((y)=>{
			if(pivot.length<2){
				pivot.push(x);
				pivot.push(y);
			}
			else{
				sorted.push([x,y]);
			}
		});
	});

    // 按极角排序，极角相同按距离排序
    sorted.sort((a,b)=>{
		const va = [a[0]-pivot[0],a[1]-pivot[1]];
		const vb = [b[0]-pivot[0],b[1]-pivot[1]];
        const angleA = Math.atan2(va[1],va[0]);
        const angleB = Math.atan2(vb[1],vb[0]);
		const sa = numcmp(angleA,angleB);
        if(sa===0){
			const distA = dot(va,va);
			const distB = dot(vb,vb);
			return numcmp(distA,distB);
		}
		else{
			return sa;
		}
    });

	//基准点既可以放在最前，又可以放在最后
	sorted.push(pivot);

    // Graham扫描：移除导致非左转的点
    const stack = [];
    for(const p of sorted){
        while(stack.length>=2){
            const top = stack[stack.length-1];
            const nextTop = stack[stack.length-2];
            const side = sideOf(nextTop[0],nextTop[1],top[0],top[1],p[0],p[1]);
            if(side<=0){
                stack.pop();
            } else {
                break;
            }
        }
        stack.push(p);
    }

    return stack;
}

export function checkConvex(polygon:Vector2D[]):boolean{
	let first:number|undefined = undefined;
	for(let i=0; i<polygon.length; i++){
		const p0 = polygon[i];
		const p1 = polygon[(i+1)%polygon.length];
		const p2 = polygon[(i+2)%polygon.length];
		const side = sideOf(p2[0],p2[1],p0[0],p0[1],p1[0],p1[1]);
		if(first===undefined){
			first = side;
		}
		else if(first<0&&side>0||first>0&&side<0){
			return false;
		}
	}
	return true;
}

export function withinConvex(x:number,y:number,polygon:Vector2D[],side0?:number):boolean{
	switch(polygon.length){
		case 0:
			return false;
		case 1:
			return x===polygon[0][0]&&y===polygon[0][1];
		case 2:
			return onSegment(x,y,polygon[0][0],polygon[0][1],polygon[1][0],polygon[1][1]);
		default:
			side0 = side0===undefined?sideOf(polygon[2][0],polygon[2][1],polygon[0][0],polygon[0][1],polygon[1][0],polygon[1][1]):side0;
			for(let i=0; i<polygon.length; i++){
				const p0 = polygon[i];
				const p1 = polygon[(i+1)%polygon.length];
				const side = sideOf(x,y,p0[0],p0[1],p1[0],p1[1]);
				if(side0<0&&side>0||side0>0&&side<0){
					return false;
				}
			}
			return true;
	}
}

export function overlapSegmentConvex(x1:number,y1:number,x2:number,y2:number,polygon:Vector2D[]){
	switch(polygon.length){
		case 0:
			return false;
		case 1:
			return onSegment(polygon[0][0],polygon[0][1],x1,y1,x2,y2);
		case 2:
			return isCrossSegment(polygon[0][0],polygon[0][1],polygon[1][0],polygon[1][1],x1,y1,x2,y2);
		default:
			// 检查是否有端点在多边形内部
			if(withinConvex(x1,y1,polygon)||withinConvex(x2,y2,polygon)){
				return true;
			}
			else{
				//线段两个端点都在多边形外部，计算多边形每个点分别在线段的哪边
				const sides:number[] = [];
				// 检查线段与多边形的每一条边是否相交
				for(const p of polygon){
					sides.push(sideOf(p[0],p[1],x1,y1,x2,y2));
				}
				for(let i=0; i<sides.length; i++){
					const i1 = (i+1)%sides.length;
					const s0 = sides[i];
					const s1 = sides[i1];
					if(!(s0>0&&s1>0||s0<0&&s1<0)){
						//找到跨立的两点，判断是否线段相交
						if(isCrossSegment(x1,y1,x2,y2,polygon[i][0],polygon[i][1],polygon[i1][0],polygon[i1][1],s0,s1)){
							return true;
						}
					}
				}
				return false;
			}
	}
}

export function overlapConvexConvex(c1:Vector2D[],c2:Vector2D[]):boolean{
	switch(c1.length){
		case 0:
			return false;
		case 1:
			return withinConvex(c1[0][0],c1[0][1],c2);
		case 2:
			return overlapSegmentConvex(c1[0][0],c1[0][1],c1[1][0],c1[1][1],c2);
		default:
			//两种情况：（1）一个完全在另一个内；（2）相交
			if(withinConvex(c1[0][0],c1[0][1],c2)){
				//1中找到一个点在2内，返回相交
				return true;
			}
			else{
				//1不可能完全在2内，因此两种情况：（1）2完全在1内；（2）相交
				//两种情况均转化为，2的顶点中是否能找到一个在1内
				const side0 = sideOf(c1[2][0],c1[2][1],c1[0][0],c1[0][1],c1[1][0],c1[1][1]);
				for(const p of c2){
					if(withinConvex(p[0],p[1],c1,side0)){
						return true;
					}
				}
				return false;
			}
	}
}

export function buildMovingPolygon(x1:number,y1:number,x2:number,y2:number,dx:number,dy:number):Vector2D[]{
	let minX = Math.min(x1,x2);
	let maxX = Math.max(x1,x2);
	let minY = Math.min(y1,y2);
	let maxY = Math.max(y1,y2);
	const reverseX = dx<0;
	const reverseY = dy<0;
	if(reverseX){
		minX = -maxX;
		maxX = -minX;
		dx = -dx;
	}
	if(reverseY){
		minY = -maxY;
		maxY = -minY;
		dy = -dy;
	}
	const r:Vector2D[] = [];
	if(dx===0&&dy===0){
		r.push([minX,minY,1]);
		r.push([maxX,minY,1]);
		r.push([maxX,maxY,1]);
		r.push([minX,maxY,1]);
	}
	else if(dx===0){
		r.push([minX,minY,1]);
		r.push([maxX,minY,1]);
		r.push([maxX,maxY+dy,1]);
		r.push([minX,maxY+dy,1]);
	}
	else if(dy===0){
		r.push([minX,minY,1]);
		r.push([maxX+dx,minY,1]);
		r.push([maxX+dx,maxY,1]);
		r.push([minX,maxY,1]);
	}
	else{
		r.push([minX,maxY,1]);
		r.push([minX,minY,1]);
		r.push([maxX,minY,1]);
		r.push([maxX+dx,minY+dy,1]);
		r.push([maxX+dx,maxY+dy,1]);
		r.push([minX+dx,maxY+dy,1]);
	}
	if(reverseX){
		for(const v of r){
			v[0] = -v[0];
		}
	}
	if(reverseY){
		for(const v of r){
			v[1] = -v[1];
		}
	}
	return r;
}

export function calculateMovingOverlapRatio(x1:number,x2:number,dx:number,x01:number,x02:number):number[]|undefined{
	let minX = Math.min(x1,x2);
	let maxX = Math.max(x1,x2);
	let minX0 = Math.min(x01,x02);
	let maxX0 = Math.max(x01,x02);
	if(dx<0){
		minX = -maxX;
		maxX = -minX;
		minX0 = -maxX0;
		maxX0 = -minX0;
		dx = -dx;
	}
    if (dx === 0) {
        if(overlapRange(minX,maxX,minX0,maxX0)){
			return [0,1];
		}
    } else {
		if(overlapRange(minX,maxX+dx,minX0,maxX0)){
			const din = minX0-maxX;
			const dout = minX+dx-maxX0;
			const tin = din<=0?0:din/dx;
			const tout = dout<=0?1:1-dout/dx;
			return [tin,tout];
		}
    }
}

/**
 * 采用时间参数化的方式，找到每个轴方向上可能的碰撞时间，然后取最大的进入时间和最小的退出时间
 */
export function calculateMovingOverlapRatio2(x1:number,y1:number,x2:number,y2:number,dx:number,dy:number,x01:number,y01:number,x02:number,y02:number):number[]|undefined{
	const tx = calculateMovingOverlapRatio(x1,x2,dx,x01,x02);
	const ty = calculateMovingOverlapRatio(y1,y2,dy,y01,y02);
	if(tx===undefined){
		return ty;
	}
	else if(ty===undefined){
		return tx;
	}
	else{
		return [Math.max(tx[0],ty[0]),Math.min(tx[1],ty[1])];
	}
}
