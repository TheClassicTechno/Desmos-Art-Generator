const express = require('express');
const fs = require("fs");//for testing purposes
const v = require("./image_processing/vectorize.js")

//image processing
var data = fs.readFileSync(__dirname+"/testArr.txt")
var testArr = JSON.parse(data);



const app = express();

app.use(express.static(__dirname + "/public"));

//connect to frontend
app.get('/getreq', async(req, res) => {
  var testImg = await v.vectorize(testArr)
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT',
         testImg: testImg.svg,
         curveList: testImg.curves
         })

});
app.post("/postreq", (req, res) => {
  console.log("Connected to React");
  console.log(req.body)
  res.send("Connected bro")
  //res.redirect("/express_backend");
});


app.listen(3000, () => {
  console.log('server started');
});
