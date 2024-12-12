let symbolMap=["a","b","c"]
let fullLogic

let count=0
while(count<2 | count>6){
  fullLogic=""
  for(let i=0;i<2;i++){
    let logic=""
    let variables=ran.generateSequenz(0,2,i+2).map(ele=>{
      if(ran.generateBool()) return "!("+symbolMap[ele]+")"
      else return symbolMap[ele]
    })

    let operation=ran.oneOf(["*","|"])
    variables.forEach(ele =>{logic+=ele+operation})
    logic=logic.slice(0,-1)
    if(ran.generateBool()) logic="!("+logic+")"
    else if(operation!="*") logic="(["+logic+"])"
    if(operation=="*") operation="|"; else operation="*"
    fullLogic=fullLogic+operation+logic
  }
  fullLogic=fullLogic.substring(1)
  var stateInvert=ran.generateBool()
  if(stateInvert) {
    fullLogic="!("+fullLogic+")"
  }
  count=0
  for (let i = 0; i < 8; i++) {
    let val=i.toString(2).padStart(3,"0")
    let current=fullLogic.replaceAll(symbolMap[0],val[0]).replaceAll(symbolMap[1],val[1]).replaceAll(symbolMap[2],val[2])
    count=count+eval(current)
  }
}

let fullLogic2=fullLogic.replaceAll("(","{").replaceAll(")","}").replaceAll("*","\\cdot ").replaceAll("^","\\text{ xor }").
  replaceAll("|","+").replaceAll("!","\\overline").replaceAll("!","\\overline").replaceAll("[","(").replaceAll("]",")")


var table= Object.assign(document.createElement('table'),{style:"font-size:19px"})
if (sol) table.className ="coverTable2 inSolution"; 
else table.className ="coverTable2 NotInSolution";
var tblBody = document.createElement("tbody");

var row = document.createElement("tr");
("a,b,c,y").split(",").forEach( ele =>{
    let sty=""
    if(ele=="y") sty="border-left: 3px solid blue;"
    row.appendChild(Object.assign(document.createElement('th'),{style:sty}).appendChild(document.createTextNode(ele)).parentElement )
}
)
tblBody.appendChild(row);

let ones=[]
let zeros=[]
for (let i = 0; i < 8; i++) {
  let val=i.toString(2).padStart(3,"0")
  let current=fullLogic.replaceAll(symbolMap[0],val[0]).replaceAll(symbolMap[1],val[1]).replaceAll(symbolMap[2],val[2])
  let y=eval(current)
  if(y==1) ones.push(i); else zeros.push(i)

  var row = document.createElement("tr");
  for(let j=0;j<val.length;j++){
    let sty=""
    if(j==val.length-1) sty="border-right: 3px solid blue;"    
    row.appendChild(Object.assign(document.createElement('td'),{style:sty}).appendChild(document.createTextNode(val[j])).parentElement )
  }
  if(sol) 
    row.appendChild(Object.assign(document.createElement('td'),{style:"font-weight: bold;"}).appendChild(document.createTextNode(+y)).parentElement );
  else
    row.appendChild(Object.assign(document.createElement('td'),{}).appendChild(document.createTextNode("")).parentElement );
  tblBody.appendChild(row);
}    
table.appendChild(tblBody);




if(sol){
  var f = new QuineMcCluskey(symbolMap.join(""),ones,[],stateInvert);
  let res=f.getFunction().replaceAll("a","{a}").replaceAll("b","{b}").replaceAll("c","{c}").
      replaceAll(" ","").replaceAll("NOT","\\overline").replaceAll("OR","+").replaceAll("AND","\\cdot")
  if(stateInvert) {
    res="\\overline{y}="+res
    var text="Wegen Invertierung 0er eintragen bei: "
  } else {
    res="y="+res
    var text=""
  }
  console.log("s")

  var div= Object.assign(document.createElement('div'),{className:"inSolution"})
  div.appendChild(table)
  div.appendChild(Object.assign(document.createElement('p'),{textContent:text+"\\("+res+"\\)"}))
  dom.querySelector("[id='6CT']").appendChild(div)
} 
else dom.querySelector("[id='6CT']").appendChild(table);

dom.querySelector("[id='6C']").appendChild((new DOMParser()).parseFromString("\\(y="+fullLogic2+"\\)", "text/html").getElementsByTagName('body')[0])