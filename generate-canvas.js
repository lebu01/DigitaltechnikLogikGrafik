
function generateLogic(inputVar, canvasVar, outputVar){

    // Global Variables

    var canvas /*= document.getElementById('canvas')*/;
    var ctx/* = canvas.getContext("2d")*/;

    var array = [];

    var operands = ['+', '*'];
    var clamps = ["(", ")"];
    var inputVars = [];
    var inputVarsAmount = []; // [ [ A, 2, 2 ], [ B, 1, 1 ] ] -> Anzahl der Input Variablen, mit: Input, Count, Max Anzahl

    /*canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;*/

    var FRAMEHEIGHT/* = canvas.height*/;
    var FRAMEWIDTH/* = canvas.width*/;

    const stages = {
        x: [],
        y: []
    }

    var size = {
        height: 0,
        width: 30
    }

    var sizeOutput = 10;

    var sizeInputBox = {
        height: 20,
        width: 20
    }

    const lineNodeSize = 2;

    const padding = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    }

    //var outputVar = 'Y';
    var outputVar = outputVar+'';

    // Globale Variablen zur Berechnung / Generierung

    const connections = [];
    const inputConnections = []

    var usedConnectionPaths = [];
    var usedConnectionPathsX = []; // Für vertikale Ausrichtung der Linien

    var highestBoxY/* = FRAMEHEIGHT*/;
    var highest;
    var farestX;

    var yScaling = 0;
    var xScaling = 0;

    var maxDepth = 0;

    var distBetweenX;
    var distBetweenY;

    var maxChildrenArr = [];

    var inputVerticalLines = []; // [[A, min, max], [B, min, max]]

    var boxPositions = []; // [pos]

    var cornersAtLines = []; // Zum Speichern der ersten Eckpunkte der Cornered Lines für Punkte [[A, x, y], ...]

    // Functions

    main(inputVar, canvasVar);

    function main(inp, can){

        canvas = can;

        ctx = canvas.getContext('2d');

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        FRAMEHEIGHT = canvas.height;
        FRAMEWIDTH = canvas.width;

        if(inp.includes('=')){
            var tempInput = inp.split('=');
            outputVar = tempInput[0];
            inp = tempInput[1];
        }

        // Reset
        resetGlobals(true);

        size.height = calculateOtherSide(size.width, true); // Berechne Boxmaße im Verhältnis 3:4
        console.log('Height: '+size.height);


        
        getInputVariables(inp);

        if(inp == '') {
            alert('Bitte String eingeben.');
            return;
        }

        var stage = 0;
        if(stage > 0) alert('Fehlerhafte Syntax: '+stage+' ) fehlend');
        if(stage < 0) alert('Fehlerhafte Syntax: '+(stage*(-1))+' ( fehlend');
        if(inputVars.length == 0) alert('Keine Eingabeparameter erkannt!');
        if(inputVars.length == 0) return;
        
        

        console.log('*** START NEW OPERATION ***');

        inp = inp.replaceAll(' ', ''); // Remove Spaces
        array = convertInput(inp.split(""));

        maxChildrenArr = getMaxChildrenInStage(array);
        console.log('Max: '+JSON.stringify(maxChildrenArr));
        console.log('Max length: '+maxChildrenArr.length);
        var maxChildren = 0;
        var ind = 0;
        for(var i = 0; i < maxChildrenArr.length; i++){
            if(maxChildrenArr[i] > maxChildren){
                ind = i;
                maxChildren = Math.max(maxChildrenArr[i], maxChildren);
            }
        }

        // Skalierung
        calcScaling();

        // Male Boxen um Scaling zu errechnen
        console.log(' ');
        console.log('**** FIRST CALCULATION ****');
        var initialPos = {
            x: FRAMEWIDTH - 2*sizeOutput/* - distBetweenX*/ - padding.right, // ************************************************************************************ HINZUFÜGEN DASS passend zu S
            y: FRAMEHEIGHT-size.height/* - distBetweenY - sizeOutput/2*/ + padding.bottom
        }

        highestBoxY = initialPos.y;
        highest = FRAMEHEIGHT;

        console.log('Initial Position: '+JSON.stringify(initialPos));
        drawArrayData(0, array, false, initialPos);

        drawInputs(inp);

        drawConnectionLines();


        console.log('---- INFOS: ----');
        console.log('FRAME: '+FRAMEWIDTH+'x'+FRAMEHEIGHT);
        console.log('Highest: '+highestBoxY + ' | total height: '+(FRAMEHEIGHT-highestBoxY));
        console.log('Amount Stages: '+stages.x.length);
        console.log('Total Box-size: '+JSON.stringify(size));
        console.log('Scaling: '+yScaling);
        console.log('*** OPERATION DONE! ***');

        // Redo
        var tempHighest = FRAMEHEIGHT - highest + padding.top + padding.bottom;
        var tempFarest = FRAMEWIDTH - farestX + padding.left + padding.right;

        console.clear();

        console.error('Farest: '+tempFarest);

        calcScaling(tempFarest, tempHighest);

        resetGlobals();

        initialPos = {
            x: FRAMEWIDTH - 2*sizeOutput- padding.right, // ************************************************************************************ HINZUFÜGEN DASS passend zu S
            y: FRAMEHEIGHT-size.height - padding.bottom
        }

        highestBoxY = initialPos.y;

        drawArrayData(0, array, false, initialPos);

        drawInputs(inp);
        
        drawConnectionLines();

    }

    function calcScaling(x=0, y=0){
        var maxBlocksStage = getBlocksAmountInStage(array);
        console.log('Max-Blockstage: '+JSON.stringify(maxBlocksStage));

        if(x == 0 && y == 0){
            // Scaling ---> WICHTIG auch noch beachten, dass in x-Richtung breiter sein kann als in y-Richtung!! ***************************************************************
            var maxTreeWidth = getMaxTreeWidth(array);
            console.log('Max Tree width: '+maxTreeWidth);
            console.log('Calc height: '+((maxTreeWidth * size.height) + ((maxTreeWidth+1) * distBetweenY) + sizeInputBox.height)+'; FRAMEHEIGHT: '+FRAMEHEIGHT);
            console.log('Calc width: '+((remainingDepth(array) * size.width + sizeInputBox.width + sizeOutput))+'; FRAMEWIDTH: '+FRAMEWIDTH);
            //yScaling = FRAMEHEIGHT / (maxTreeWidth * (size.height + 2*distBetweenY)/* + 2*distBetweenY*/); // maximale Tree Width ist die maximale Breite inkl. Platzhalterboxen
            //xScaling = FRAMEWIDTH / (remainingDepth(array) + (2*distBetweenX+size.width) + 100); // 100 für Inputs & Output
            
            yScaling = (FRAMEHEIGHT - padding.top - padding.bottom) / ((maxTreeWidth * size.height) + ((maxTreeWidth+1) * distBetweenY) + sizeInputBox.height); // +1 für Abstand oben und unten
            xScaling = (FRAMEWIDTH - padding.left - padding.right) / (remainingDepth(array) * size.width + sizeInputBox.width + sizeOutput*2); // noch Abstände dazwischen dynamisch einfügen; sizeOutput * 2, da in Radius angegeben wird    
        }else {
            yScaling = (FRAMEHEIGHT - padding.top - padding.bottom) / y;
            xScaling = (FRAMEWIDTH - padding.left - padding.right) / x;
        }

        console.log('x-Scaling: '+xScaling+"; y-Scaling: "+yScaling);
        if(xScaling < yScaling){
            size.width = size.width * xScaling;
            size.height = calculateOtherSide(size.width, true);

            //distBetweenX = distBetweenX * xScaling;
            distBetweenY = distBetweenY * xScaling;

            // Inputs
            sizeInputBox.width = sizeInputBox.width * xScaling;
            sizeInputBox.height = sizeInputBox.height * xScaling;

            // Output
            sizeOutput = sizeOutput * xScaling;
        }else {
            size.height = size.height * yScaling;
            size.width = calculateOtherSide(size.height, false);

            //distBetweenX = distBetweenX * yScaling;
            distBetweenY = distBetweenY * yScaling;

            // Inputs
            sizeInputBox.width = sizeInputBox.width * yScaling;
            sizeInputBox.height = sizeInputBox.height * yScaling;

            // Output
            sizeOutput = sizeOutput * yScaling;
        }

        maxDepth = remainingDepth(array);
        console.log('Converted: '+JSON.stringify(array));
        console.log('Found Operands: '+inputVars.toString());
        console.log('Remaining depth: '+maxDepth);
    }

    function resetGlobals(all = false){
        if(all){
            console.clear();
            size.height = 40;
            size.width = 30;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            connections.length = 0;
            inputConnections.length = 0;
            array.length = 0;
            stages.y.length = 0;
            stages.x.length = 0;
            usedConnectionPaths.length = 0;
            usedConnectionPathsX.length = 0;
            inputVarsAmount.length = 0;
            inputVars.length = 0;
            maxDepth = 0;
            farestX = FRAMEWIDTH;
            sizeInputBox.height = 20;
            sizeInputBox.width = 20;
            sizeOutput = 10;
            distBetweenX = 15;
            distBetweenY = 10;
            inputVerticalLines.length = 0;
            boxPositions.length = 0;
            cornersAtLines.length = 0;
        }else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            connections.length = 0;
            inputConnections.length = 0;
            stages.y.length = 0;
            stages.x.length = 0;
            usedConnectionPaths.length = 0;
            usedConnectionPathsX.length = 0;
            maxDepth = 0;
            inputVerticalLines.length = 0;
            boxPositions.length = 0;
            cornersAtLines.length = 0;
        }
    }

    function getInputVariables(inp){
        var arr = inp.split("");
        for(var i = 0; i < inp.length; i++){
            if(arr[i] == ' ') continue;

            if(!inputVars.includes(arr[i]) && !operands.includes(arr[i]) && !clamps.includes(arr[i]) && arr[i] != '!') inputVars.push(arr[i]);

            var hasVar = false;
            for(var j = 0; j < inputVarsAmount.length; j++){
                if(inputVarsAmount[j][0] == arr[i]){
                    inputVarsAmount[j][1] += 1;
                    inputVarsAmount[j][2] = inputVarsAmount[j][1];
                    hasVar = true;
                }
            }
            if(!hasVar && !operands.includes(arr[i]) && !clamps.includes(arr[i]) && arr[i] != '!') inputVarsAmount.push([arr[i], 1, 1]);
        }
    }

    function convertInput(inp) {
        var newExp = [];
        var op = null;
        var negation = false;

        while (inp.length > 0) {
            var currentExp = inp.shift();

            if (currentExp == '!') {
                // Setzt die Negation für den nächsten Ausdruck
                negation = true;
                continue;
            }

            if (currentExp == '(') {
                var innerExp = convertInput(inp);
                if (negation) {
                    innerExp = ['!', innerExp];
                    negation = false;
                }
                newExp.push(innerExp);
            } else if (currentExp == ')') {
                break;
            } else if (operands.includes(currentExp)) {
                if (op === currentExp && newExp.length > 0 && Array.isArray(newExp[newExp.length - 1]) && newExp[newExp.length - 1][0] === op) {
                    continue;
                }
                op = currentExp;
            } else {
                // Fügt die negierte Variable hinzu, falls ! vor einer Variablen steht
                if (negation) {
                    currentExp = ['!', currentExp];
                    negation = false;
                }
                newExp.push(currentExp);
            }

            // Behandlung für Operator und Erstellung eines Arrays
            if (newExp.length >= 2 && op !== null) {
                var opTwo = newExp.pop();
                var opOne = newExp.pop();

                // Überprüfen, ob die Operation dieselbe ist und wir die Kette fortsetzen können
                if (Array.isArray(opOne) && opOne[0] === op) {
                    // Falls es sich um eine Kette handelt (z.B. A + B + C oder A * B * C), erweitere das Array
                    if (Array.isArray(opOne[1])) {
                        opOne[1].push(opTwo);  // Bei Kettenoperation innerhalb der Liste
                    } else {
                        opOne[1] = [opOne[1], opTwo];  // Starte die Liste bei 2 Operanden
                    }
                    newExp.push(opOne);
                } else {
                    newExp.push([op, [opOne, opTwo]]);
                }

                op = null;
            }
        }

        // Falls es nur eine Kette gibt, wandle sie in das gewünschte Format um
        if (newExp.length > 1 && op !== null) {
            return [op, newExp];
        }

        return newExp[0];
    }

    function drawArrayData(stage, arr, neg, parentPosition = {x: FRAMEWIDTH, y: FRAMEWIDTH}, parentInputs = [], amountParentInputs = 0){

        console.log('Working with: '+JSON.stringify(arr));

        //if(arr.length == 1) drawArrayData(stage, arr[0]);

        var negAfter = false;
        var negBefore = false;

        var i = 0;

        while(i < arr.length){

            if(arr[i] == '!'){ // Abfrage ob gesamter Block negiert

                console.log('Found !');
                if(Array.isArray(arr[i+1]) && operands.includes(arr[i+1][0])){
                    negAfter = true;
                    console.log('! Case 1 -> Negation after');
                }else if(!Array.isArray(arr[i+1]) && arr.length == 2){
                    negBefore = true;
                    console.log('! Case 2 -> Negation before');
                }
                i += 1;
            }else {
                //if(!operands.includes(arr[0])){ // Überprüfen auf Verschachtelung wenn z.B [["+",["A","B"]],["+",["C","D"]]]
                if(Array.isArray(arr[i])){
                    console.log('Found Nesting');
                    if(arr[i].length == 2 && arr[i][0] == '!' && !Array.isArray(arr[i][1])){ // [[!,A],B]
                        
                        if(remainingDepth(arr[i]) == 0 && stage < maxChildrenArr.length) highestBoxY = highestBoxY - size.height - distBetweenY;
                        
                        i+=1;
                        continue;
                    }else {
                        //for(var c = i; c < arr.length; c++){
                            console.log('Aufruf');
                            if(Array.isArray(arr[i])) drawArrayData(stage, arr[i], negAfter, parentPosition, parentInputs, amountParentInputs);
                        //}
                    }

                    //i+=2;
                    i+=1;

                }else {

                    if(!Array.isArray(arr[i]) && Array.isArray(arr[i+1]) && !operands.includes(arr[i])){
                        if(remainingDepth(arr[i]) == 0 && /*arr[i+1][0] != '!' &&*/ Array.isArray(arr[i+1][1])) highestBoxY = highestBoxY - size.height - distBetweenY; // ************************************************************ Abfrage ob =! '!' überprüfen ob immer richtig & ob Arrayüberprüfung richtig
                        i++;
                        console.log('added virtual block');
                        continue;
                    }

                    if(!Array.isArray(arr[i+1]) || arr[i+1] == null){
                        return;
                    }

                    if(stages.x[stage] == null){
                        stages.x[stage] = 0;
                    }else {
                        stages.x[stage] += 1;
                    }
                    if(stages.y[stage] == null){
                        stages.y[stage] = 0;
                    }else {
                        stages.y[stage] += 1;
                    }

                    var maxChil = 1;

                    if(stage > 0) maxChil = maxChildrenArr[stage-1];

                    /*var boxFrom = {
                        x: parentPosition.x - (amountParentInputs+1)*distBetweenX - size.width - 5, // -5 für Negation
                        y: (parentPosition.y) - (parentPosition.y-highestBoxY) 
                    }*/

                    var amountInputsOnStage = 0;
                    if(stage > 0) amountInputsOnStage = getAmountOfBlockInputsOnStage(stage-1, array);

                    var boxFrom = {
                        x: parentPosition.x - (amountInputsOnStage+1)*distBetweenX - size.width - 5, // -5 für Negation
                        y: (parentPosition.y) - (parentPosition.y-highestBoxY) 
                    }

                    boxPositions.push(boxFrom);

                    if(highest > boxFrom.y) highest = boxFrom.y - distBetweenY;

                    if(farestX > boxFrom.x) farestX = boxFrom.x;

                    var op = '';
                    if(arr[i] == '+') op = '≥1';
                    if(arr[i] == '*') op = '&';
                    console.log('Found operand: '+arr[i]+' -> '+op);

                    if(neg){
                        drawBox(boxFrom, size, true, op);
                        negAfter = false;
                        console.log('Drawn negated Box.');
                    }else {
                        drawBox(boxFrom, size, false, op);
                    }

                    if(remainingDepth(arr) == 1)  highestBoxY = highestBoxY - size.height - distBetweenY;

                    var inputs = [];
                    var actualAmountInputs = 0;

                    var yAmount = size.height / (arr[i+1].length+1); // Wenn zu viele Eingänge an Box, dass Abstand zwischen Eingängen kleiner als Negations Punkt, muss die Box größer werden. Dann auch highestBoxY usw neu berechnen bzw Reihenfolge der Berechnung ändern! *************************************
                    for(var j = arr[i+1].length-1; j >= 0; j--){
                        const boxLineFrom = {
                            x: boxFrom.x-10,
                            y: boxFrom.y+((arr[i+1].length-1-j)+1)*yAmount
                        }
                        const boxLineTo = {
                            x: boxFrom.x,
                            y: boxFrom.y+((arr[i+1].length-1-j)+1)*yAmount
                        }
                        drawLine(boxLineFrom, boxLineTo);

                        inputs.push(boxLineFrom);
                        actualAmountInputs++;

                        if(Array.isArray(arr[i+1][j]) && arr[i+1][j].length == 2 && arr[i+1][j][0] == '!' && !Array.isArray(arr[i+1][j][1])){
                            console.log('Working on Negation before');
                            var negDot = {
                                x: boxLineTo.x-4, // Abzug des Radius des Kreises
                                y: boxLineTo.y
                            }
                            drawCircle(negDot, 4, true);
                        }

                        
                        if(stage >= 0 && ((!Array.isArray(arr[i+1][j]) && !operands.includes(arr[i+1][j])) || (Array.isArray(arr[i+1][j]) && arr[i+1][j].length == 2 && arr[i+1][j][0] == '!'))){
                            if(!Array.isArray(arr[i+1][j]) && !operands.includes(arr[i+1][j])){
                                if(j == (arr[i+1].length-1)){
                                    inputConnections.push([arr[i+1][j], null, boxLineFrom, true]);
                                }else {
                                    inputConnections.push([arr[i+1][j], null, boxLineFrom, false]);
                                }
                                
                                inputs.pop(); // Aus Inputs entfernen wenn Eingangsvar diese verbindung hat
                                console.log('Added input connection for '+arr[i+1][j]);
                                usedConnectionPathsX.push(boxLineFrom.y);
                            }else if(Array.isArray(arr[i+1][j]) && arr[i+1][j].length == 2 && arr[i+1][j][0] == '!' && !Array.isArray(arr[i+1][j][1])){
                                if(j == (arr[i+1].length-1)){
                                    inputConnections.push([arr[i+1][j][1], null, boxLineFrom, true]);
                                }else {
                                    inputConnections.push([arr[i+1][j][1], null, boxLineFrom, false]);
                                }
                                
                                inputs.pop(); // Aus Inputs entfernen wenn Eingangsvar diese verbindung hat

                                usedConnectionPathsX.push(boxLineFrom.y);
                            }
                        }
                    }

                    const boxLineFromOut = {
                        x: boxFrom.x+size.width,
                        y: boxFrom.y+size.height-(size.height/2)
                    }

                    const boxLineToOut = {
                        x: boxFrom.x+size.width+distBetweenX+5, // +5 für Negation
                        y: boxFrom.y+size.height-(size.height/2)
                    }

                    drawLine(boxLineFromOut, boxLineToOut);

                    if(stage > 0){ // Verbindungslinien zeichnen
                        
                        var inpOfPar = parentInputs[parentInputs.length-1];

                        var x = boxLineToOut.x;
                        while(usedConnectionPaths.includes(x)){
                            x += distBetweenX;
                        }

                        usedConnectionPaths.push(x);
                        drawConnectionLine(boxLineToOut, x, inpOfPar);

                        parentInputs.pop();

                    }

                    if(stage == 0 && stages.y[stage] == 0){ // Draw Output
                        const outFrom = {
                            x: boxLineToOut.x+sizeOutput,
                            y: boxLineToOut.y
                        }
                        drawOutput(outFrom, sizeOutput, outputVar);
                    }
                    console.log('Draw box on stage '+stage+' with '+(inputs.length)+ ' inputs; Coordinates: '+JSON.stringify(boxFrom)+ ' and stage-multiplier '+stages.y[stage]);

                    console.log('Next: '+JSON.stringify(arr[i+1]));
                    if(Array.isArray(arr[i+1]) && (arr[i+1].length > 2 || arr[i+1][0] != '!'))drawArrayData(stage+1, arr[i+1], false, boxFrom, inputs, /*inputs.length*/actualAmountInputs);

                    i += 2;

                }

            }
    
        }

        while(i <= maxChildrenArr[stage] && remainingDepth(arr) == 1){ // Befüllen mit leeren Boxen
            i++;
        }

        return;
    }

    function drawConnectionLines(){

        for(var i = 0; i < inputVarsAmount.length; i++){ // [ [ A, From, To ], [ B, From, To ] ]


            if(getAmountOfInput(inputVarsAmount[i][0]) > 1){ // Überprüfen ob mind ein Knotenpunkt existieren muss

                var fromX = farestX - distBetweenX*(i+1);

                var min = getMinPosOfInput(inputVarsAmount[i][0], fromX);
                var max = getMaxPosOfInput(inputVarsAmount[i][0], fromX);

                var from = {
                    x: fromX,
                    y: min.y
                }

                var to = {
                    x: from.x,
                    y: max.y
                }

                // Skizze:
                /*
                    from
                    |
                    |
                    |
                    to
                */

                usedConnectionPaths.push(from.x);

                inputVerticalLines.push([inputVarsAmount[i][0], from, to]);

                drawLine(from, to);

                for(var j = 0; j < getInputConnectionsOfInput(inputVarsAmount[i][0]).length; j++){
                    var posDot = {
                        x: from.x,
                        y: getInputConnectionsOfInput(inputVarsAmount[i][0])[j][2].y
                    }
                    
                    //if(farestX < getInputConnectionsOfInput(inputVarsAmount[i][0])[j][2].x && getInputConnectionsOfInput(inputVarsAmount[i][0])[j][3] == true){ // Überprüfen ob Input von Block in oberster Stage liegt -> hier nicht in oberster Stage
                    if(farestX < getInputConnectionsOfInput(inputVarsAmount[i][0])[j][2].x && checkStraightLineBoxCollision(posDot, getInputConnectionsOfInput(inputVarsAmount[i][0])[j][2]) == true){ // Überprüfen ob Input von Block in oberster Stage liegt -> hier nicht in oberster Stage
                        var hY = highest;
                        while(usedConnectionPathsX.includes(hY)){
                            hY -= distBetweenY;
                        }
                        var dest = getInputConnectionsOfInput(inputVarsAmount[i][0])[j][2];
                        const realDest = Object.assign({}, dest); // Object assign wegen referenzierungsfehler
                        
                        while(usedConnectionPaths.includes(dest.x)){
                            dest.x = dest.x - distBetweenX;
                        }
                        
                        drawCorneredConnectionLine(from, hY, dest);
                        
                        drawLine(dest, realDest); // Letztes Verbindungsstück zeichnen

                        usedConnectionPaths.push(dest.x);
                        usedConnectionPathsX.push(hY);
                        cornersAtLines.push([inputVarsAmount[i][0], from.x, hY]);
                        drawCircle(from, lineNodeSize, true);
                    }else { // Oberste Stage
                        if(getInputConnectionsOfInput(inputVarsAmount[i][0])[j][2].y != from.y && getInputConnectionsOfInput(inputVarsAmount[i][0])[j][2].y != to.y){
                            drawCircle(posDot, lineNodeSize, true);
                        }
                        drawLine(posDot, getInputConnectionsOfInput(inputVarsAmount[i][0])[j][2]);
                    }
                    
                }

                // Linie von Input zu Line
                if(getInputConnectionsOfInput(inputVarsAmount[i][0])[0][1].y > to.y){ // Überürfen ob Eingang über Linie
                    drawCircle(to, lineNodeSize, true);
                    drawConnectionLine(getInputConnectionsOfInput(inputVarsAmount[i][0])[0][1], to.x, to);
                }else if(getInputConnectionsOfInput(inputVarsAmount[i][0])[0][1].y < from.y){ // Überürfen ob Eingang unter Linie
                    drawCircle(from, lineNodeSize, true);
                    drawConnectionLine(getInputConnectionsOfInput(inputVarsAmount[i][0])[0][1], from.x, from);
                }else {
                    var point = {
                        x: to.x,
                        y: getInputConnectionsOfInput(inputVarsAmount[i][0])[0][1].y
                    }
                    drawCircle(point, lineNodeSize, true);
                    drawLine(getInputConnectionsOfInput(inputVarsAmount[i][0])[0][1], point);
                }

            }else { // Wenn Input nur einmal existiert und ohne Node ist
                var x = farestX - distBetweenX*(i+1);
                while(usedConnectionPaths.includes(x)){
                    x -= distBetweenX;
                }
                usedConnectionPaths.push(x);

                drawConnectionLine(getInputConnectionsOfInput(inputVarsAmount[i][0])[0][1], x, getInputConnectionsOfInput(inputVarsAmount[i][0])[0][2]);
            }

        }

        setCornerPoints();
    }

    function drawInputs(){
        var arr = inputVars;

        const sizeBox = sizeInputBox;

        var amountInputConns = inputVarsAmount.length;

        console.log('Highest-y: '+highest);

        if(highest < highestBoxY) highest = highestBoxY;

        for(var i = 0; i < arr.length; i++){
            console.log('Stages X size: '+stages.x.length);
            var yCord = FRAMEHEIGHT - distBetweenY - sizeBox.height - (i*(FRAMEHEIGHT-highest+0.5*sizeBox.height)/arr.length); // *0.5 für Abstand oben
            while(usedConnectionPathsX.includes(yCord+sizeBox.height/2)){
                yCord -= 5;
            }
            const from = {
                x: farestX - distBetweenX*(amountInputConns+1) - sizeInputBox.width, // +1 für Abstand an Box
                y: yCord
            }

            drawInput(from, sizeBox, arr[i]);

            if(from.y < highest) highest = from.y;

            console.log('Input '+arr[i]+' drawn to: '+JSON.stringify(from));

            const lineFrom = {
                x: from.x + sizeBox.width,
                y: from.y + sizeBox.height/2
            }
            const lineTo = {
                x: from.x + sizeBox.width + 10,
                y: from.y + sizeBox.height/2
            }
            drawLine(lineFrom, lineTo);

            for(var j = 0; j < inputConnections.length; j++){
                if(inputConnections[j][0] == arr[i]){
                    inputConnections[j][1] = lineTo;
                }
            }
        }
    }

    function drawConnectionLine(from, x, to) {
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(x, from.y);
        ctx.lineTo(x, to.y);
        ctx.lineTo(to.x, to.y);
        
        ctx.stroke();
    }

    function drawCorneredConnectionLine(from, y, to) { // Eckige Verbindungslinie mit 2 Ecken (c1, c2)
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(from.x, y);
        ctx.lineTo(to.x, y);
        ctx.lineTo(to.x, to.y);
        
        ctx.stroke();
    }


    function drawLine(from, to){
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    }

    function drawRectangle(from, size){
        ctx.beginPath();
        ctx.rect(from.x, from.y, size.width, size.height);
        ctx.stroke();
    }

    function drawCircle(from, radius, filled){
        ctx.beginPath();
        ctx.arc(from.x, from.y, radius, 0, 2 * Math.PI);
        if(filled){
            ctx.fillStyle = "black";
            ctx.fill();
        }else {
            ctx.stroke();
        }
    }

    function drawText(from, text, size, d=false){
        // https://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas

        const fontSize = 12;
        var mult = (size.height/2)/fontSize;
        if(d) mult = size.height/fontSize;

        ctx.font = (fontSize*mult)+"px serif";

        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        
        // Approximation der Text-Höhe
        let fontHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent || (fontSize*mult);
        
        // Horizontale Zentrierung
        const centerX = from.x + (size.width / 2) - (textWidth / 2);

        // Vertikale Zentrierung
        const centerY = from.y + (size.height / 2) + (fontHeight / 4);

        // Zeichne den Text zentriert
        ctx.fillText(text, centerX, centerY);

        console.log('Draw Text: ' + text + ' at ' + centerX + ', ' + centerY);
    }

    function drawBox(from, size, negated, type){
        const radius = 4;
        drawRectangle(from, size);
        /*const dotFrom = {
            x: from.x+size.width+2,
            y: from.y+size.height/2
        }*/
        const dotFrom = {
            x: from.x+size.width+radius,
            y: from.y+size.height-(size.height/2)
        }
        if(negated) drawCircle(dotFrom, radius, true);
        drawText(from, type, size);
    }

    function drawInput(from, size, text){
        drawRectangle(from, size);
        drawText(from, text, size);
    }

    function drawOutput(from, radius, text){
        drawCircle(from, radius, false);
        const textFrom = {
            x: from.x-radius/2,
            y: from.y-radius/2
        }
        const size = {
            height: radius,
            width: radius
        }
        drawText(textFrom, text, size, true);
    }

    function getDistance(from, to){
        var x = Math.max(to.x, from.x) - Math.min(from.x, to.x);
        var y = Math.max(to.y, from.y) - Math.min(from.y, to.y);
        var dist = Math.sqrt(Math.pow(x, 2)+Math.pow(y, 2));
        return dist;
    }

    function remainingDepth(arr){

        if(!Array.isArray(arr)) return 0;

        var maxDepth = 0;

        var op = false;
        for(var i = 0; i < arr.length; i++){
            if(operands.includes(arr[i]) || arr[i] == '!') op = true;
            var t = remainingDepth(arr[i]);
            if(t > maxDepth) maxDepth = t;
        }

        if(op){
            return maxDepth;
        }else {
            return maxDepth + 1;
        }
    }

    function getBlocksAmountInStage(a){

        var amountPerStage = [];

        function traverse(arr, stage){
            if(!Array.isArray(arr)) return;

            if(amountPerStage[stage] === undefined) amountPerStage[stage] = 0;

            var beginn = 0;

            if(!Array.isArray(arr[0])) beginn = 1;

            for(var i = beginn; i < arr.length; i++){
                if(operands.includes(arr[0])){
                    traverse(arr[i], stage);
                    amountPerStage[stage] += 1;
                }else if(arr[i][0] == '!'){
                    traverse(arr[i], stage);
                }else {
                    //amountPerStage[stage] += 1;
                    traverse(arr[i], stage+1);
                }
            }
        }

        traverse(a, 0)

        return amountPerStage;

    }

    function getMaxChildrenInStage(arr) {

        let maxChildrenPerStage = [];

        function traverse(node, stage) {

            if(!Array.isArray(node) || (node.length == 2 && node[0] == '!' && !Array.isArray(node[1]))) return;

            if (maxChildrenPerStage[stage] === undefined) maxChildrenPerStage[stage] = 0;

            if(node[0] != '!') maxChildrenPerStage[stage] = Math.max(maxChildrenPerStage[stage], node.length);

            for (let child of node) {
                if(Array.isArray(child) && !operands.includes(child[0])){
                    traverse(child, stage);
                }else if(Array.isArray(child) && operands.includes(child[0])){
                    traverse(child, stage + 1);
                }else if(child[0] == '!'){
                    traverse(child[1], stage+1);
                }else {
                    traverse(child[0], stage+1);
                }
            }
        }

        for (let root of arr) {
            traverse(root, 0);
        }

        return maxChildrenPerStage;
    }

    function getMaxTreeWidth(arr) {
        const maxChildrenPerStage = getMaxChildrenInStage(arr); // Maxmimale Anzahl der Children eines Nodes pro Stage
        //const amountNodes = getBlocksAmountInStage(arr); // Anzahl Nodes in Stage
        var amountNodes = [];

        amountNodes[0] = maxChildrenPerStage[0];

        var maxWidth = amountNodes[0];

        for (var i = 1; i < maxChildrenPerStage.length-1; i++) { // i entspricht stage
            if(amountNodes[i] === undefined) amountNodes[i] = maxChildrenPerStage[i];
            
            maxWidth = Math.max(maxChildrenPerStage[i] * amountNodes[i-1], maxWidth);
        }

        return maxWidth;
    }

    function getAmountOfBlockInputsOnStage(stageVar, a){

        let totalInputsPerStage = [];

        function traverse(node, stage) {

            if (!Array.isArray(node) || (node.length === 2 && node[0] === '!' && !Array.isArray(node[1]))) return;
    
            if (totalInputsPerStage[stage] === undefined) totalInputsPerStage[stage] = 0;
            
            if (node[0] !== '!' && !Array.isArray(node[0]) && operands.includes(node[0])) totalInputsPerStage[stage] += node[1].length;
    
            for (let child of node) {
                if(Array.isArray(child) && !operands.includes(child[0])){
                    traverse(child, stage);
                }else if(Array.isArray(child) && operands.includes(child[0])){
                    traverse(child, stage + 1);
                }else if(child[0] == '!'){
                    traverse(child[1], stage+1);
                }else {
                    traverse(child[0], stage+1);
                }
            }
        }

        //for (let root of a) {
            traverse(a, 0);
        //}

        return totalInputsPerStage[stageVar];
        //return getMaxChildrenInStage(a)[stageVar]*getBlocksAmountInStage(a)[stageVar];
    }


    function calculateOtherSide(knownSide, isWidth) {
        if (isWidth) {
            // Bekannte Seite ist Breite -> Höhe berechnen
            return knownSide * (4 / 3);
        } else {
            // Bekannte Seite ist Höhe -> Breite berechnen
            return knownSide * (3 / 4);
        }
    }

    function getAmountOfInput(inp) {
        for(var i = 0; i < inputVarsAmount.length; i++){
            if(inputVarsAmount[i][0] == inp) return inputVarsAmount[i][2];
        }
        return 0;
    }

    function getInputConnectionsOfInput(inp){
        var a = [];
        for(var i = 0; i < inputConnections.length; i++){
            if(inputConnections[i][0] == inp){
                a.push(inputConnections[i]);
            }
        }
        return a;
    }

    function getMinPosOfInput(inp, lineX){
        var pos = {
            x: 0,
            y: FRAMEHEIGHT
        }
        var startPos = {
            x: lineX,
            y: 0
        }
        for(var i = 0; i < inputConnections.length; i++){
            startPos.y = inputConnections[i][2].y;
            if(inputConnections[i][0] == inp && inputConnections[i][2].y < pos.y
                && checkStraightLineBoxCollision(startPos, inputConnections[i][2]) == false
            ){
                pos.y = inputConnections[i][2].y;
                pos.x = inputConnections[i][2].x
            }
        }
        return pos;
    }

    function getMaxPosOfInput(inp, lineX){
        var pos = {
            x: 0,
            y: 0
        }
        var startPos = {
            x: lineX,
            y: 0
        }
        for(var i = 0; i < inputConnections.length; i++){
            startPos.y = inputConnections[i][2].y;
            if(inputConnections[i][0] == inp && inputConnections[i][2].y > pos.y
                && checkStraightLineBoxCollision(startPos, inputConnections[i][2]) == false
            ){
                pos.y = inputConnections[i][2].y;
                pos.x = inputConnections[i][2].x
            }
        }
        return pos;
    }

    function checkStraightLineBoxCollision(from, to){
        var hasCol = false;

        if(from.y != to.y) {
            console.error('ERROR at Collision Detection!');
            exit;
        }

        for(var i = 0; i < boxPositions.length; i++){
            if(((from.x <= boxPositions[i].x && to.x >= boxPositions[i].x)
                    || (from.x <= (boxPositions[i].x+size.width) && to.x >= (boxPositions[i].x+size.width)))
                &&
                (from.y >= boxPositions[i].y && from.y <= (boxPositions[i].y+size.height))){
                hasCol = true;
            }
        }

        return hasCol;
    }

    function setCornerPoints(){

        for(var j = 0; j < inputVarsAmount.length; j++){
            var ar = getFromInps(inputVarsAmount[j][0]);

            for(var k = 0; k < ar.length-1; k++){
                var pos = {
                    x: ar[k][0],
                    y: ar[k][1]
                }
                drawCircle(pos, lineNodeSize, true);
            }
        }

        function getFromInps(inp){
            var a = [];
            for(var i = 0; i < cornersAtLines.length; i++){
                if(cornersAtLines[i][0] == inp){
                    a.push([cornersAtLines[i][1], cornersAtLines[i][2]]);
                }
            }
            return a;
        }
    }

}

