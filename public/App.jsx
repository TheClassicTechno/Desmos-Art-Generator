'use strict';

const e = React.createElement;
//Desmos Widget display limit
var eqDisplayLimit = 3000;

//App
class App extends React.Component {
  //const [imgData, setImgData] = React.useState(0);
  constructor(props) {
    super(props);
    this.state = {
      rawImage: 0, //input image
      svgData: 0, //for svg
      equations: [], //for desmos graph
      imgWidth: 400, //width of the image (for desmos graph)
      loadStatus: 0 //loading status 0 = idle, 1 = client-side image processing, 2 = server-side calculation, 3 = drawing graph, 4 = complete
    };
  }
  
  render() {
    return (
    <div className="generator-app">
      <Upload onFile={(img)=>{this.setInputImage(img)}} />
      <div>
        <button id="uploadBtn" onClick={()=>{
          // get request
          console.log("button clicked")
          this.setLoadStatus(2);
          fetch('/getreq')
            .then((res)=>res.json())
            .then((express)=>{
              // express response
              
              //console.log(express.equations);
              //this.setState({ svgData: express.testImg, equations: express.equations }) 
              this.setEquations(express.equations, 700);//hardcode 700 width
            })
        }}>Try a Sample Image!</button>
      </div>
      <div className="output-wrapper">
        <h3>Copy the equations into a new <a href="https://www.desmos.com/calculator">Desmos window</a>!</h3>
        <textarea id="output" className="fade" value={this.state.equations.join("\n")}></textarea>
        <p className="fade">{this.state.loadStatus==1 ? "Image processing..." : 
            this.state.loadStatus==2 ? "Calculating Equations... (Note: large images will take longer to load)" :
            this.state.loadStatus==3 ? "Drawing" :
            this.state.loadStatus==4 ? (<a href="#calculator">Complete! Click to view Desmos graph</a>) :"Upload a file to start!"}</p>
      </div>
      
      <div className="output-wrapper">
        <ImageCanvas data={this.state.rawImage} onFetch={(eq, width)=>{this.setEquations(eq, width)}} setLoadStatus={(n)=>{this.setLoadStatus(n)}} />
      </div>
      
      <DesmosGraph data={this.state.equations} imgWidth={this.state.imgWidth} setLoadStatus={(n)=>{this.setLoadStatus(n)}} />
      
    </div>  
  )
  }
  //callbacks from children
  setInputImage(img) {
    if (!img) return;//don't reset the raw image if there's no image
    this.setState({ rawImage: img });
    this.setLoadStatus(1);
    //console.log(this.state.rawImage)
  }
  setEquations(eq, width) {
    this.setState({ equations: eq, imgWidth: width });
  }
  setLoadStatus(n) {
    this.setState({ loadStatus: n});
  }
}
/*//Old post request button
<button onClick={()=>{
        // post request
        console.log("button clicked")
        fetch('/postreq', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({test: "wooo"}) // put data to send here, not working
        })
          .then((res)=>res.text())
          .then((express)=>{
            // express response
            console.log(express) // whatever response
          })
      }}>Send post request</button>

*/

//Preview Image
class Preview extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.img) {
      return (<img src={`data:image/svg+xml;utf8,${this.props.img}`} />);
    }
  }
}//use with <Preview img={this.state.imgData}/>

//Desmos widget
class DesmosGraph extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.data == this.props.data) return;//only update graph if new data
    var elt = document.getElementById('calculator');
    //empty out elt
    while (elt.firstChild) {
        elt.removeChild(elt.firstChild);
    }
    //add new calculator
    console.log(`Rendering ${this.props.data.length} Desmos expressions...`)
    this.props.setLoadStatus(3);
    var calculator = Desmos.GraphingCalculator(elt, {expressionsCollapsed: true});
    for (var i = 0; i < Math.min(eqDisplayLimit,this.props.data.length); i++) {
      calculator.setExpression({
        id: "curve"+i,
        latex: this.props.data[i],
        color: "#397bc0"
      });
    }
    calculator.setMathBounds({
      left: -10,
      right: this.props.imgWidth + 50,
      bottom: -this.props.imgWidth - 50,
      top: 10
    });
    //alert user
    if (this.props.data.length > eqDisplayLimit) alert("Loading all equations with the widget is too slow, please copy and paste your equations into a new Desmos window.")
    this.props.setLoadStatus(4);
  }
  
  render() {
    return (<div id="calculator"></div>);
  }
}

//Upload button
class Upload extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="upload-btn-wrapper">
        <button id="upload-btn">Upload a File</button>
        <input type="file" name="img" accept="image/*" onChange={(event)=>{this.props.onFile(event.target.files[0])}}/>
      </div>
           );
  }
}

//Canvas (for extracting pixel data)
class ImageCanvas extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.data == this.props.data) return;//only update canvas if new data
    var onFetch = (eq, width) => {this.props.onFetch(eq, width)};
    var setLoadStatus = (n) => {this.props.setLoadStatus(n)};
    //draw the image
    var canvas = document.getElementById("imageCanvas");
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.onload = processImage;
    img.src = URL.createObjectURL(this.props.data);
    function processImage() {
      canvas.width = this.width;
      canvas.height = this.height;
      ctx.drawImage(this, 0,0);
      //get pixel data
      var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      var arr = [];
      for (var i = 0; i < data.length-3; i+=4) {
        var magnitude = Math.sqrt(data[i]**2 + data[i+1]**2 + data[i+2]**2);
        arr.push(magnitude/256);//scale 0 to 1
      }
      var finArr = unflatten(arr,canvas.width);
      console.log(finArr)
      //send to server
      console.log("BEAMING UP THE DATA")
      setLoadStatus(2);
      fetch('/postimage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({data: finArr}) // put data to send here, not working
      })
        .then((res)=>res.json())
        .then((express)=>{
          //send the data up!
          console.log("WE HAVE THE DATA YAYYA")
          console.log(express.equations)
          onFetch(express.equations, finArr.length);
        })
    }
  }
  
  render() {
    return (
      <canvas id="imageCanvas"></canvas>
           );
  }
}

//unflatten array
function unflatten(array, width) {
  var newArr = [];
  while (array.length > 0) {
    newArr.push(array.slice(0,width));
    array = array.slice(width);
  }
  return newArr;
}

//render
const domContainer = document.querySelector('#app');
const root = ReactDOM.createRoot(domContainer);
root.render(e(App));

//ReactDOM.render(App(), document.getElementById('app'))