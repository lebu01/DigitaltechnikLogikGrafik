let symbolMap=["a","b","c"]
let fullLogic=""

let xorPos=ran.generateDecimal(2)
for(let i=0;i<3;i++){
  let logic=""
  let variables=ran.generateSequenz(0,2,(xorPos==i) ? 2 : ran.generateDecimal(2,3)).map(ele=>{
    if(ran.generateBool()) return "!("+symbolMap[ele]+")"
    else return symbolMap[ele]
  })

  let operation
  if(xorPos==i) operation="^"
  else operation=ran.oneOf(["*","|"])
  variables.forEach(ele =>{
    logic+=ele+operation
  })
  logic=logic.slice(0,-1)
  if(ran.generateBool()) logic="!("+logic+")"
  else if(operation!="*") logic="(["+logic+"])"
  if(operation=="*") operation="|"; else operation="*"
  fullLogic=fullLogic+operation+logic
}
fullLogic=fullLogic.substring(1)
fullLogic2=fullLogic.replaceAll("(","{").replaceAll(")","}").replaceAll("*","\\cdot ").replaceAll("^","\\text{ xor }").
  replaceAll("|","+").replaceAll("!","\\overline").replaceAll("!","\\overline").replaceAll("[","(").replaceAll("]",")")

let ones=[]
for(let i=0;i<8;i++){
  let val=i.toString(2).padStart(3,"0")
  let current=fullLogic.replaceAll(symbolMap[0],val[0]).replaceAll(symbolMap[1],val[1]).replaceAll(symbolMap[2],val[2])
  if(eval(current)==1) ones.push(i)
}

let f = new QuineMcCluskey(symbolMap.join(""),ones);
let res=f.getFunction().replaceAll("a","{a}").replaceAll("b","{b}").replaceAll("c","{c}").
    replaceAll(" ","").replaceAll("NOT","\\overline").replaceAll("OR","+").replaceAll("AND","\\cdot")

dom.querySelector("[id='6A']").appendChild((new DOMParser()).parseFromString("\\(y="+fullLogic2+"\\)", "text/html").getElementsByTagName('body')[0])
dom.querySelector("[id='6AS']").appendChild((new DOMParser()).parseFromString("\\(y="+res+"\\)", "text/html").getElementsByTagName('body')[0])