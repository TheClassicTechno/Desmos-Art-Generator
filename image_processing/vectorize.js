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
          var curves = [];
          //loop every curve
          for (var i = 0; i < p._pathlist.length; i++) {
            var curve = p._pathlist[i].curve;
            //loop every vertex
            var v = [{x:curve.x0, y:curve.y0}].concat(curve.c);
            //remove all empty curves
            for (var j = 0; j < v.length; j++) {
              if (!v[j]) v = v.slice(0,j).concat(v.slice(j+1));
            }

            //add to array
            for (var j = 0; j < curve.tag.length; j++) {
              if (curve.tag[j] == "CURVE") {
                curves.push(new Bezier(v[0], v[1], v[2], v[3]));
                v = v.slice(3);//remove first 3 elements
              }
              else {//tag = CORNER
                curves.push(new Line(v[0], v[1]));
                curves.push(new Line(v[1], v[2]));
                v = v.slice(2);//remove first 1 element
              }
            }
          }
          //also get start point
          console.log(Object.keys(p._pathlist[0]))//pls i need these stupid curves
          //fs.writeFileSync('./output.svg', svg);
          resolve({svg:svg,curves:curves});//return
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

module.exports = {vectorize};