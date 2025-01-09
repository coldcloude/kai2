import { KList } from "./k-list.js";

export type KXMLHeader = {
    version: string
    encoding: string
};

export type KXMLDTD = {
    rootTagName: string,
    dtdType?: "SYSTEM"|"PUBLIC",
    dtdName?: string,
    dtdUrl?: string
};

export type KXMLNode = KXMLTag|string;

export type KXMLTag = {
    name: string,
    type: "2-side"|"1-side"|"single",
    attributes?: [string,string][],
    children?: (KXMLTag|string)[]
};

export type KXMLDocument = {
    header?: KXMLHeader,
    dtd?: KXMLDTD,
    rootTag: KXMLTag
};

export function formatXml(doc:KXMLDocument, indent?:string):string{
    indent = indent||"";
    let rst = "";
    if(doc.header!==undefined){
        rst += "<?xml version=\""+doc.header.version+"\" encoding=\""+doc.header.encoding+"\"?>\n";
    }
    if(doc.dtd!==undefined){
        rst += "<!DOCTYPE "+doc.dtd.rootTagName;
        if(doc.dtd.dtdType!==undefined){
            rst += " "+doc.dtd.dtdType;
        }
        if(doc.dtd.dtdName!==undefined){
            rst += " \""+doc.dtd.dtdName+"\"";
        }
        if(doc.dtd.dtdUrl!==undefined){
            rst += " \""+doc.dtd.dtdUrl+"\"";
        }
        rst += ">\n";
    }
    const stack = new KList<[KXMLTag,number,string]>();
    stack.push([doc.rootTag,-1,""]);
    let curr:[KXMLTag,number,string]|undefined;
    while((curr=stack.pop())!==undefined){
        const [tag,index,indents] = curr;
        if(index<0){
            stack.push([tag,0,indents]);
            if(!rst.endsWith("\n")){
                rst += "\n";
            }
            rst += indents+"<"+tag.name;
            if(tag.attributes!==undefined){
                for(const [key,value] of tag.attributes){
                    rst += " "+key+"=\""+value+"\"";
                }
            }
            if(tag.type==="single"){
                rst += "/>";
            }
            else{
                rst += ">";
            }
        }
        else if(tag.children!==undefined&&index<tag.children.length){
            stack.push([tag,index+1,indents]);
            const child = tag.children[index];
            if(typeof child==="string"){
                //text node
                rst += child as string;
            }
            else {
                //tag node
                stack.push([child as KXMLTag,-1,indents+indent]);
            }
        }
        else {
            if(tag.type==="2-side"){
                if(rst.endsWith("\n")){
                    rst += indents;
                }
                rst += "</"+tag.name+">\n";
            }
            else{
                rst += "\n";
            }
        }
    }
    return rst;
}
