const c = require('./convolution.js')
const potrace = require('potrace')
const bmp = require('bmp-js')
const fs = require('fs') //for testing

var detectionThreshold = 25;//threshold for including a line

function convertToArrayBuffer (arr) {
  var arrayBuffer = new ArrayBuffer(arr.length*arr[0].length*4);
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[0].length; j++) {
      for (var x = 0; x < 4; x++) {//each pixel is 4 bits (RGBA)
        if (arr[i][j]>detectionThreshold)
          arrayBuffer[4*(i*arr[0].length + j) + x] = 0;//black lines
        else
          arrayBuffer[4*(i*arr[0].length + j) + x] = 255;//white everything else
      }
    }
  }
  return arrayBuffer;
}

async function vectorize (inputArr) {
  var arr = c.applySobel(inputArr);
  var arrayBuffer = convertToArrayBuffer(arr);
  
  var bmpData = {
    data:arrayBuffer, //Buffer
    width:arr[0].length, //Number
    height:arr.length //Number
  };
  var bmpFile = bmp.encode(bmpData);
  return new Promise(resolve => {
        potrace.trace(bmpFile.data, (e, svg, p) => {
          if (e) console.log(e)
          var curves = [];//curves (data for start/end points)
          var eqs = [];//equations
          //loop every curve
          for (var i = 0; i < p._pathlist.length; i++) {
            var curve = p._pathlist[i].curve;
            //loop every vertex
            var v = [{x:p._pathlist[i].x0, y:p._pathlist[i].y0}].concat(curve.c);
            //remove all empty curves
            for (var j = 0; j < v.length; j++) {
              if (!v[j]) v = v.slice(0,j).concat(v.slice(j+1));
            }

            //add to array
            for (var j = 0; j < curve.tag.length; j++) {
              if (curve.tag[j] == "CURVE") {
                var C = new Bezier(v[0], v[1], v[2], v[3]);
                curves.push(C);
                v = v.slice(3);//remove first 3 elements
                //get latex
                eqs.push(C.getEq());
              }
              else {//tag = CORNER
                var L1 = new Line(v[0], v[1]);
                var L2 = new Line(v[1], v[2]);
                curves.push(L1);
                curves.push(L2);
                v = v.slice(2);//remove first 1 element
                //get latex
                eqs.push(L1.getEq());
                eqs.push(L2.getEq());
              }
            }
          }
          //console.log(Object.keys(p._pathlist[0]))//pls i need these stupid curves
          //fs.writeFileSync('./output.svg', svg);
          resolve({svg:svg,curves:curves,equations:eqs});
          //return svg format file, data for all start and end points, equations
      });
  });
}

//Geometry Storage
function Line (end1, end2) {
  this.type = "L";//L for line
  this.x1 = end1 ? end1.x : 0;
  this.y1 = end1 ? end1.y : 0;
  this.x2 = end2 ? end2.x : 0;
  this.y2 = end2 ? end2.y : 0;
}
Line.prototype.getEq = function() {
  //invert all y values
  return `\\left(\\left(1-t\\right)*${this.x1}+t*${this.x2},\\left(1-t\\right)*${-this.y1}+t*${-this.y2}\\right)`;
}

function Bezier(end1, ctrl1, ctrl2, end2) {
  this.type = "C";//C for curve
  this.x1 = end1 ? end1.x : 0;
  this.y1 = end1 ? end1.y : 0;
  this.cx1 = ctrl1 ? ctrl1.x : 0;
  this.cy1 = ctrl1 ? ctrl1.y : 0;
  this.cx2 = ctrl2 ? ctrl2.x : 0;
  this.cy2 = ctrl2 ? ctrl2.y : 0;
  this.x2 = end2 ? end2.x : 0;
  this.y2 = end2 ? end2.y : 0;
}
Bezier.prototype.getEq = function() {
  //invert all y values
  return `\\left(\\left(1-t\\right)^{3}*${this.x1}+3t\\left(1-t\\right)^{2}*${this.cx1}+3t^{2}\\left(1-t\\right)*${this.cx2}+t^{3}*${this.x2}\ ,\\left(1-t\\right)^{3}*${-this.y1}+3t\\left(1-t\\right)^{2}*${-this.cy1}+3t^{2}\\left(1-t\\right)*${-this.cy2}+t^{3}*${-this.y2}\\right)`;
}

module.exports = {vectorize};