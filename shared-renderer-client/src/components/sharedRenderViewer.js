import {React, Component} from "react"
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:2181";

class SharedRendererViewer extends Component {

  state = { image_data:"", queued: true, connected: false };
  socket = socketIOClient(ENDPOINT);
  
  bindListeners() {
    this.socket.on("image-data", img => {
      this.setState({
        image_data: img
      });
    });

    this.socket.on("viewer_queued", ()=> {
      console.log("viewer queued!");
      this.setState({
        queued: true, image_data: ""
      })
    });

    this.socket.on("viewer_dequeued", ()=> {
      console.log("viewer dequeued!");
      this.setState({
        queued: false
      })
    });

  }

  disconnect(event){
    event.preventDefault();
    this.socket.disconnect();
    this.setState({connected : false, image_data: ""});
  }

  connect(event){
    event.preventDefault();
    this.socket = socketIOClient(ENDPOINT);
    this.bindListeners();
    this.socket.on("connect",()=>{
      this.socket.emit("available_viewer");
      this.setState({connected : true});
    });
  }

  render() { 
      return <div style={{backgroundColor: "DarkGray", width: this.props.width, height: this.props.height, float: "right"}}>
        {this.state.connected? <button onClick={this.disconnect.bind(this)}>Disconnect</button> : <button onClick={this.connect.bind(this)}>Connect</button>}
        <p>{this.socket.id}</p>
        <img src={this.state.image_data} style={{width: this.props.width, height: this.props.height, clip: "auto", "object-fit":"cover"}}></img>
      </div>;
  }
}
 
export default SharedRendererViewer;