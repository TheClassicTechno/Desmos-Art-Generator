const express = require('express');
const fs = require("fs");//for testing purposes
const v = require("./image_processing/vectorize.js")
const bp = require("body-parser")

//image processing
var data = fs.readFileSync(__dirname+"/testArr.txt")
var testArr = JSON.parse(data);



const app = express();
app.use(bp.json({limit: '50mb', extended: true}))
app.use(bp.urlencoded({limit: '50mb', extended: true }))
app.use(express.static(__dirname + "/public"));

//connect to frontend
app.get('/getreq', async(req, res) => {
  var testImg = await v.vectorize(testArr)
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT',
         testImg: testImg.svg,
         curveList: testImg.curves,
         equations: testImg.equations
         })

});
app.post("/postimage", async(req, res) => {
  console.log("Connected to Frontend");
  var vectorImage = await v.vectorize(req.body.data)
  //console.log(vectorImage.equations)
  res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT',
         testImg: vectorImage.svg,
         curveList: vectorImage.curves,
         equations: vectorImage.equations
         })
  //res.redirect("/express_backend");
});


app.listen(3000, () => {
  console.log('server started');
});
