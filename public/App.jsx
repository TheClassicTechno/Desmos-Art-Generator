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
      equations: [] //for desmos graph
    };
  }
  
  render() {
    return (
    <div className="text">
      <Upload onFile={(img)=>{this.setInputImage(img)}} />
      <button onClick={()=>{
        // get request
        console.log("button clicked")
        fetch('/getreq')
          .then((res)=>res.json())
          .then((express)=>{
            // express response
            
            //console.log(express.equations);
            //this.setState({ svgData: express.testImg, equations: express.equations }) 
            this.setEquations(express.equations);
          })
      }}>Try a Sample Image!</button>
      <br />
      <ImageCanvas data={this.state.rawImage} onFetch={(eq)=>{this.setEquations(eq)}} />
      <textarea id="output" className="fade" value={this.state.equations.join("\n")}></textarea>
      <DesmosGraph className="fade" data={this.state.equations} />
      
    </div>  
  )
  }
  //callbacks from children
  setInputImage(img) {
    if (!img) return;//don't reset the raw image if there's no image
    this.setState({ rawImage: img });
    //console.log(this.state.rawImage)
  }
  setEquations(eq) {
    this.setState({ equations: eq });
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
    
    var calculator = Desmos.GraphingCalculator(elt, {expressionsCollapsed: true});
    for (var i = 0; i < Math.min(eqDisplayLimit,this.props.data.length); i++) {
      calculator.setExpression({
        id: "curve"+i,
        latex: this.props.data[i],
        color: "#397bc0"
      });
    }
    calculator.setMathBounds({
      left: 0,
      right: 400,
      bottom: -400,
      top: 0
    });
    //alert user
    if (this.props.data.length > eqDisplayLimit) alert("Loading all equations with the widget is too slow, please copy and paste your equations into a new Desmos window.")
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
      <div>
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
    var onFetch = (eq) => {this.props.onFetch(eq)};
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
          onFetch(express.equations);
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