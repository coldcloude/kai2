import {uint8,uint32} from './k-math.js';

export function num2ip(num:number):string{
	const num0 = num|0;
	return uint8(num0>>24)+"."+uint8(num0>>16)+"."+uint8(num0>>8)+"."+uint8(num0);
}

export function ip2num(ip:string):number{
	const ips = ip.split(".");
	return uint32((parseInt(ips[0])<<24)|(parseInt(ips[1])<<16)|(parseInt(ips[2])<<8)|parseInt(ips[3]));
}

export function cidr2num(cidr:string):number[]{
	const slash = cidr.lastIndexOf("/");
	const addr = ip2num(cidr.substring(0,slash));
	const len = parseInt(cidr.substring(slash+1));
	return [addr,len];
}

export function cidrLen2netMask(len:number):number{
	return ~(0xFFFFFFFF>>>(len|0));
}

export function parseIpNet(addr:number,len:number):number{
	const mask = cidrLen2netMask(len);
	return uint32(addr&mask);
}

export function parseIpHost(addr:number,len:number):number{
	const mask = cidrLen2netMask(len);
	return uint32(addr&(~mask));
}

export function parseCidrNetMask(cidr:string):number{
	const [_,len] = cidr2num(cidr);
	return cidrLen2netMask(len);
}

export function parseCidrNet(cidr:string):number{
	const [addr,len] = cidr2num(cidr);
	return parseIpNet(addr,len);
}

export function parseCidrHost(cidr:string):number{
	const [addr,len] = cidr2num(cidr);
	return parseIpHost(addr,len);
}
