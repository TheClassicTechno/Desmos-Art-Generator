'use strict';

const e = React.createElement;

//App
class App extends React.Component {
  //const [imgData, setImgData] = React.useState(0);
  constructor(props) {
    super(props);
    this.state = { imgData: 0 };
  }

  render() {
    return (
    <div className="text">
      <br></br>
       <br></br>
      Desmos Art Generator.<br></br>
      Beautiful, Free, Art.
     
      
      <br />
      <button onClick={()=>{
        // get request
        console.log("button clicked")
        fetch('/getreq')
          .then((res)=>res.json())
          .then((express)=>{
            // express response
            console.log(express.express) // 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT'
            console.log(express.curveList);
            this.setState({ imgData: express.testImg }) 
          })
      }}>Send get request (get the image!)</button>
  
      <button onClick={()=>{
        // post request
        console.log("button clicked")
        fetch('/postreq', {
          method: 'POST',
          body: JSON.stringify({test: "wooo"}) // put data to send here, not working
        })
          .then((res)=>res.text())
          .then((express)=>{
            // express response
            console.log(express) // whatever response
          })
      }}>Send post request</button>
      <br />
      <Preview img={this.state.imgData}/>
    </div>  
  )
  }
}

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
}

//render
const domContainer = document.querySelector('#app');
const root = ReactDOM.createRoot(domContainer);
root.render(e(App));

//ReactDOM.render(App(), document.getElementById('app'))