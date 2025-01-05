import { KList } from "./k-list.js";
import { KPair } from "./k.js";

export type KXMLHeader = {
    version: string
    encoding: string
};

export type KXMLDTD = {
    rootTagName: string,
    contents: string[]
};

export type KXMLNode = KXMLTag|string;

export type KXMLTag = {
    name: string,
    attributes: [string,string][],
    type: "2-side"|"1-side"|"single",
    children: (KXMLTag|string)[]
};

export type KXMLDocument = {
    header: KXMLHeader|undefined,
    dtd: KXMLDTD|undefined,
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
        for(const content of doc.dtd.contents){
            rst += " "+content;
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
            for(const [key,value] of tag.attributes){
                rst += " "+key+"=\""+value+"\"";
            }
            if(tag.type==="single"){
                rst += "/>";
            }
            else{
                rst += ">";
            }
        }
        else if(index<tag.children.length){
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
