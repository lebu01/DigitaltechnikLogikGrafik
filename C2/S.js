function convertToLatex(expr){
  return expr.replaceAll("a","{a}").replaceAll("b","{b}").replaceAll("c","{c}").
  replaceAll("!","\\overline").replaceAll("|","+").replaceAll("*","\\cdot").replaceAll("[","{").replaceAll("]","}")
}

let seq=ran.generateSequenz(0,1,2)
let synthese=["NAND","NOR"][seq[0]]

let symbolMap=["a","b","c"]

expr=ran.getMinimumExpression(4,7,symbolMap,synthese=="NAND")

if(synthese!="NAND"){var find="|";var replace="*";}
else {var find="*";var replace="|";}

matches=[];
[...expr.matchAll(/\([^\(]*\)/g)].forEach(ele =>{
  let resStr
  let eleN=ele[0].replaceAll("(","").replaceAll(")","")
  eleN=eleN.split(replace)
  resStr="![!["+eleN.join(replace)+"]]"
  matches.push(resStr)
})

matches=matches.map(ele =>{
  return "!["+ele.replace("![![","").slice(0,-2)+"]"
})
resStr="!["+matches.join(replace)+"]"

rawExpr=resStr
rawExpr=rawExpr.replaceAll('|', '+')
rawExpr=rawExpr.replaceAll('[', '(')
rawExpr=rawExpr.replaceAll(']', ')')

expr=convertToLatex(expr)
resStr=convertToLatex(resStr)

dom.querySelector("[id='6CN']").textContent=synthese
dom.querySelector("[id='6CA']").appendChild((new DOMParser()).parseFromString("\\(y="+expr+"\\)", "text/html").getElementsByTagName('body')[0])
dom.querySelector("[id='6CY']").appendChild((new DOMParser()).parseFromString("\\(y="+resStr+"\\)", "text/html").getElementsByTagName('body')[0])
dom.querySelector("[id='6CY']").appendChild((new DOMParser()).parseFromString("<canvas class='Logic2Canvas' logic='"+rawExpr+"' solution='y' style='width:500px;height:255px;background-color:grey;'></canvas>", "text/html").getElementsByTagName('body')[0])
