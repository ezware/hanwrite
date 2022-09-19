var cvsbg = undefined;
var cvspt = undefined;
var ctxbg = undefined;
var ctxpt = undefined;

var headerContainer = undefined;

var btnSmaller = undefined;
var btnBigger = undefined;
var btnClear = undefined;
var btnThiner = undefined;
var btnThicker = undefined;
var btnColor1 = undefined;
var btnColor2 = undefined;
var btnColor3 = undefined;
var txtText = undefined;
var lblPenWidth = undefined;

var fpstimer = undefined;

var drawing = false;
var rows = 5;
var cols = 5;
var block_pixels = 80;
var block_space = 8;
var half_block_pixels = Math.floor(block_pixels / 2);
var margin = 20;

var penWidth = 2

var color1 = "blue"
var color2 = "red"
var color3 = "black"

var textColor = "black"
var ghostColor = "silver"
var fontSize = 64
var fontFamily = "楷体"

var lastSelectedColor = undefined


var bgdata = {
    cntr: 0,
    color: 0,
    updated: false
};
var ptdata = {
    cntr: 0,
    color: 0,
    updated: false
};

function getDomObjects() {
    cvsbg = document.getElementById("cvsbg");
    cvspt = document.getElementById("cvspt");
    ctxbg = cvsbg.getContext('2d')
    ctxpt = cvspt.getContext('2d')

    headerContainer = document.getElementById("header");

    btnSmaller = document.getElementById("smaller");
    btnBigger = document.getElementById("bigger");
    btnClear = document.getElementById("clear");

    btnColor1 = document.getElementById("color1");
    btnColor2 = document.getElementById("color2");
    btnColor3 = document.getElementById("color3");

    btnThiner = document.getElementById("thiner");
    btnThicker = document.getElementById("thicker");

    lblPenWidth = document.getElementById("penwidth");

    lastSelectedColor = btnColor1
    btnColor1.style.borderWidth = "2px"
    btnColor2.style.borderWidth = 0
    btnColor3.style.borderWidth = 0

    txtText = document.getElementById("text");
}

function attachEvents() {
    cvspt.addEventListener('mousedown', ptMouseDown)
    cvspt.addEventListener('mousemove', ptMouseMove)
    cvspt.addEventListener('mouseup', ptMouseUp)
    
    cvspt.addEventListener('touchstart', ptTouchStart)
    cvspt.addEventListener('touchmove', ptTouchMove)
    cvspt.addEventListener('touchend', ptTouchEnd)

    btnSmaller.addEventListener("click", smallerClicked)
    btnBigger.addEventListener("click", biggerClicked)
    btnClear.addEventListener("click", clearClicked)

    //txtText.addEventListener("onchange", txtKeyUp);
    btnThiner.addEventListener("click", thinerClicked)
    btnThicker.addEventListener("click", thickerClicked)
}

function colorChanged() {
    btnColor1.style.backgroundColor = color1
    btnColor2.style.backgroundColor = color2
    btnColor3.style.backgroundColor = color3

    btnColor1.style.color = color1
    btnColor2.style.color = color2
    btnColor3.style.color = color3

    ptColor = lastSelectedColor.style.backgroundColor
}

function colorClicked(who, e) {
    if (lastSelectedColor != undefined) {
        lastSelectedColor.style.borderWidth = 0
    }

    lastSelectedColor = who
    who.style.borderColor = "gray"
    who.style.borderColorDark = "gray"
    who.style.borderWidth = "2px"

    ptColor = lastSelectedColor.style.backgroundColor
}

function init() {
    getDomObjects()
    resize()
    bgdataInit()
    ptdataInit()
    attachEvents()
    colorChanged()
    //fpstimer = window.setInterval(fps, 30);
}

function calcRowAndCol() {
    cols = Math.floor(cvsbg.width/ (block_pixels + block_space));
    rows = Math.floor(cvsbg.height / (block_pixels + block_space));

    bgdata.updated = true;
    ptdata.updated = true;

    drawBg()
}

function beforePrint() {
    headerContainer.style.display = "none"
}

function afterPrint() {
    headerContainer.style.display = "block"
}

function resize() {
    let newWidth = window.innerWidth - margin
    let newHeight = window.innerHeight - margin - 30
    let sizeChanged = false

    //newHeight = (Math.floor(newHeight / 2) + 1) * 2

    if (cvsbg.width != newWidth)
    {
        cvsbg.width = newWidth
        cvspt.width = newWidth
        sizeChanged = true
    }

    if (cvsbg.height != newHeight)
    {
        cvsbg.height = newHeight
        cvspt.height = newHeight
        sizeChanged = true
    }

    if (sizeChanged)
    {
        calcRowAndCol()        
    }
}

function smallerClicked(e) {
    let old = block_pixels
    block_pixels -= 10
    if (block_pixels < 20) {
        block_pixels = 20
    }

    if (block_pixels != old) {
        fontSize -= 10
        if (fontSize < 10) {
            fontSize = 10
        }
        half_block_pixels = Math.floor(block_pixels / 2);
        calcRowAndCol()
    }
}

function biggerClicked(e) {
    let old = block_pixels
    block_pixels += 10
    if (block_pixels > 600) {
        block_pixels = 600
    }

    if (block_pixels != old) {
        fontSize += 10
        half_block_pixels = Math.floor(block_pixels / 2);
        calcRowAndCol()
    }
}

function clearClicked(e) {
    cvspt.width = cvspt.width
    cvspt.height = cvspt.height
}

function thinerClicked() {
    penWidth--
    if (penWidth < 1) {
        penWidth = 1
    }

    lblPenWidth.innerText = penWidth
}

function thickerClicked() {
    penWidth++
    if (penWidth > 50) {
        penWidth = 50
    }

    lblPenWidth.innerText = penWidth
}

function txtKeyUp(e) {
    console.log("KeyUp")
    bgdata.updated = true
    window.setTimeout(drawBg, 500)
}

function drawBlock(x, y)
{
    //draw outer rect
    ctxbg.lineWidth = 2;
    ctxbg.setLineDash([]);
    ctxbg.strokeStyle = "green"
    ctxbg.strokeRect(x, y, block_pixels, block_pixels)

    //draw assist line
    ctxbg.lineWidth = 1;    
    ctxbg.setLineDash([8, 8]);
    ctxbg.strokeStyle = "silver"
    //draw *
    ctxbg.moveTo(x, y)
    ctxbg.lineTo(x + block_pixels, y + block_pixels)
    ctxbg.moveTo(x, y + block_pixels)
    ctxbg.lineTo(x + block_pixels, y)

    //draw +
    ctxbg.moveTo(x + half_block_pixels, y)
    ctxbg.lineTo(x + half_block_pixels, y + block_pixels)
    ctxbg.moveTo(x, y + half_block_pixels)
    ctxbg.lineTo(x + block_pixels, y + half_block_pixels)
    ctxbg.stroke()
}

function drawText(x, y, word, color) {
    ctxbg.font = fontSize + "px " + fontFamily
    //txtMeasure = ctxpt.measureText(word)
    ctxbg.fillStyle = color
    ctxbg.fillText(word, x, y)
    //ctxbg.strokeStyle = color
    //ctxbg.strokeText(word, x, y)
}

//bg layer draw
function drawBg() {
    if ((!ctxbg) || (!bgdata.updated))
    {
        return
    }

    cvsbg.width = cvsbg.width
    cvsbg.height = cvsbg.height

    let words = txtText.value.trim()
    let word = ''
    let r = 0;
    let c = 0;
    let color = "red"
    ctxbg.strokeStyle = "green";
    ctxbg.textBaseline = "middle"
    ctxbg.textAlign = "center"
    for (r = 0; r < rows; r++)
    {
        if (r < words.length) {
            word = words.substr(r, 1)
        } else {
            word = ''
        }

        y = r * (block_pixels + block_space)
        for (c = 0; c < cols; c++)
        {
            x = c * (block_pixels + block_space)
            drawBlock(x, y);
            if (word != '') {
                if (c == 0) {
                    color = textColor
                } else {
                    color = ghostColor
                }
                drawText(x + half_block_pixels, y + half_block_pixels, word, color);
            }            
        }
    }

    bgdata.updated = false;
}

//paint layer draw
function drawPt() {
    if ((!ctxpt) || (!ptdata.updated)){
        return;
    }
    /*
    ctxpt.clearRect(200, 25, 80, 80);
    ctxpt.fillStyle = "rgb(255," + ptdata.color + ",0)";
    ctxpt.fillRect(200, 25, 80, 80);
    ctxpt.strokeStyle = "green"
    */


    ptdata.updated = false;
}
function bgdataInit() {
    bgdata.cntr = 0;
    bgdata.color = 0;
    bgdata.updated = false;
}

function ptdataInit() {
    ptdata.cntr = 0;
    ptdata.color = 100;
    ptdata.updated = false;
}

function bgdataUpdate()
{
    if (bgdata.cntr > 4)
    {
        bgdata.color += 5;
        if (bgdata.color > 255)
        {
            bgdata.color = 0;
        }
        bgdata.updated = true;
        bgdata.cntr = 0;
    } else {
        bgdata.cntr++;
    }
}

function ptdataUpdate()
{
    if (ptdata.cntr > 4)
    {
        ptdata.color += 10;
        if (ptdata.color > 255)
        {
            ptdata.color = 0;
        }
        ptdata.updated = true;
        ptdata.cntr = 0;
    } else {
        ptdata.cntr++;
    }
}

function ptBegin(x, y) {
    ctxpt.moveTo(x, y)
    ctxpt.strokeStyle = ptColor
    ctxpt.lineWidth = penWidth
    //console.log("moveTo: " + e.offsetX + "," + e.offsetY)
    drawing = true
}

function ptEnd(x, y) {
    drawing = false;
}

function ptMove(x, y) {
    if (!drawing) return

    //ctxpt.strokeStyle = ptColor
    ctxpt.lineTo(x, y)
    ctxpt.stroke()
    //console.log("lineTo: " + e.offsetX + "," + e.offsetY)
    ctxpt.stroke()
}

function ptMouseDown(e) {
    ptBegin(e.offsetX, e.offsetY)
}

function ptMouseUp(e) {
    ptEnd(e.offsetX, e.offsetY)
}

function ptMouseMove(e) {
   ptMove(e.offsetX, e.offsetY);   
}

function getTouchPos(x, y) {
    return {
        x: Math.floor(x - cvspt.offsetLeft), 
        y: Math.floor(y - cvspt.offsetTop)
    }
}

function ptTouchStart(e) {
    let tp = e.touches[0]
    let pos = getTouchPos(tp.clientX, tp.clientY)
    ptBegin(pos.x, pos.y)
}

function ptTouchEnd(e) {
    let tp = e.changedTouches[0]
    let pos = getTouchPos(tp.clientX, tp.clientY)
    ptEnd(pos.x, pos.y)
}

function ptTouchMove(e) {   
   if (!drawing) return

   let tp = e.touches[0]
   let pos = getTouchPos(tp.clientX, tp.clientY)
   ptMove(pos.x, pos.y);
}

//fps
function fps() {
    bgdataUpdate()
    ptdataUpdate()
    drawBg()
    drawPt()
}
