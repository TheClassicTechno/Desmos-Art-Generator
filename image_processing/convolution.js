//This file has all the functions needed for convolutions
//Gaussian Filter
function gaussianFilter(len, sigma, scale) {
  var arr = [];
  for (var y = -(len-1)/2; y <= (len-1)/2; y++) {
    var row = [];
    for (var x = -(len-1)/2; x <= (len-1)/2; x++) {
      //calculate Gaussian Distribution
      var G = scale * 1/(2*Math.PI*sigma*sigma) * Math.pow(Math.E, -(x*x+y*y)/(2*sigma*sigma))
      row.push(G);
    }
    arr.push(row);
  }
  return arr;
}

//convolution
//NOTE: kernels is an array of all kernels used in the layer, each kernel should be square :D
function convolve(arr, kernels) {
  var output = [];
  kernels.forEach((k) => {
    var out = [];
    //apparently loops are much faster than .forEach()
    for (var y = 0; y < arr.length-k.length+1; y++) {
      var row = [];
      for (var x = 0; x < arr[0].length-k[0].length+1; x++) {
        var section = getSection(arr, x, y, k[0].length, k.length);
        row.push(applyKernel(section, k))
      }
      out.push(row);
    }
    output.push(out);
  });
  return output;
}

//get the piece of array to apply kernel too (indexed by top left)
function getSection(arr, x, y, w, h) {
  var out = [];
  for (var i = y; i < y + h; i++) {
    var row = [];
    for (var j = x; j < x + w; j++) {
      row.push(arr[i][j]);
    }
  out.push(row);
  }
  return out;
}
//apply kernel onto a section of array
function applyKernel(arr, kernel) {
  var sum = 0;
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[0].length; j++) {
      sum += arr[i][j] * kernel[i][j];
    }
  }
  return sum;
}

//find the gradient of sobel output
//NOTE: input an array of exactly 2 images as opposed to 1 image, calculates the magnitude of gradient in 2 dimensions
function calcGrad(filteredArr) {
  return filteredArr[0].map((r, ri) => {
    var row = [];
    for (var i = 0; i < r.length; i++) {
      row.push(parseInt(Math.sqrt(r[i]**2 + filteredArr[1][ri][i]**2)));//pythag thm distance
    }
    return row;
  })
}

//make filters
var blurFilter = gaussianFilter(3, 1, 100);

//sobel edge detection kernels
var sobelX = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1]
];

var sobelY = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1]
];

//Sobel pathfinding algorithm
function applySobel(arr) {
  var blurArr = convolve(arr, [blurFilter])[0];//get first and only layer of convolution
  var newArr = convolve(blurArr, [sobelX, sobelY]);//get the whole convolution
  return calcGrad(newArr);//find the 2D gradient for the entire convolution
}
module.exports =  {applySobel};