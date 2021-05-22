import {React, Component} from "react"
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:2181";

class SharedRendererViewer extends Component {

  state = { image_data:"", queued: true };
  socket = socketIOClient(ENDPOINT);
  
  componentDidMount() {
    this.socket = socketIOClient(ENDPOINT);
    this.socket.on("connect",()=>{
      this.socket.emit("available_viewer");
    });

    this.socket.on("image-data", img => this.setState({
      image_data: img
    }));

    this.socket.on("viewer_queued", ()=> this.setState({
      queued: true
    }));

    this.socket.on("viewer_dequeued", ()=> this.setState({
      queued: false
    }));

  }

  disconnect(){
    this.socket.disconnect();
  }

  render() { 
      return <div style={{backgroundColor: "DarkGray", width: this.props.width, height: this.props.height, float: "right"}}>
        <h3>{this.state.queued? "Waiting for available renderer": "Rendered on another machine!"}</h3>
        <button onClick={this.disconnect()}>Disconnect</button>
        <img src={this.state.image_data}></img>
      </div>;
  }
}
 
export default SharedRendererViewer;