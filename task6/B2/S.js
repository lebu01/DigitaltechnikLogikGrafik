function convertToLatex(expr){
  return expr.replaceAll("a","{a}").replaceAll("b","{b}").replaceAll("c","{c}").
  replaceAll("!","\\overline").replaceAll("|","+").replaceAll("*","\\cdot").replaceAll("[","{").replaceAll("]","}")
}

let seq=ran.generateSequenz(0,1,2)
let synthese=["NAND","NOR"][seq[0]]
let synthese2=["NAND","NOR"][seq[1]]

let symbolMap=["a","b","c"]

expr=ran.getMinimumExpression(4,7,symbolMap,synthese=="NAND")

if(synthese!="NAND"){var find="|";var replace="*";}
else {var find="*";var replace="|";}

let matches=[];
[...expr.matchAll(/\([^\(]*\)/g)].forEach(ele =>{
  let resStr
  let eleN=ele[0].replaceAll("(","").replaceAll(")","")
  eleN=eleN.split(replace)
  if(eleN.length==3) resStr="![![![!["+eleN[0]+replace+eleN[1]+"]]"+replace+eleN[2]+"]]";
  else resStr="![!["+eleN.join(replace)+"]]"
  matches.push(resStr)
})

let resStr=""
matches=matches.map(ele =>{
  return "!["+ele.replace("![![","").slice(0,-2)+"]"
})

if(matches.length==3){
  resStr="![![!["+matches[0]+replace+matches[1]+"]]"+replace+matches[2]+"]";
} else if(matches.length==2){
  resStr="![!["+matches[0]+replace+matches[1]+"]]";
} else resStr="!["+matches.join(replace)+"]"


expr=convertToLatex(expr)
resStr=convertToLatex(resStr)

dom.querySelector("[id='6BN']").textContent=synthese
dom.querySelector("[id='6BA']").appendChild((new DOMParser()).parseFromString("\\(y="+expr+"\\)", "text/html").getElementsByTagName('body')[0])
dom.querySelector("[id='6BY']").appendChild((new DOMParser()).parseFromString("\\(y="+resStr+"\\)", "text/html").getElementsByTagName('body')[0])