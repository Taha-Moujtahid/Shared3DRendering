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

  redirectEvent(event){
    console.log(event)
    event.preventDefault()
    this.socket.emit(
      "trigger_event",
      {
        "eventType": event.type, 
        "clientX": event.clientX, 
        "clientY": event.clientY,
        "delta": event.delta,
        "deltaX": event.deltaX,
        "deltaY": event.deltaY,
        "button": event.button,
        "buttons": event.buttons
      }
    );
    return false;
  }

  render() { 
      return (
      <div 
        style={{
          backgroundColor: "DarkGray", 
          width: this.props.width, 
          height: this.props.height, 
          float: "right", 
          backgroundImage: "url("+this.state.image_data+")",
          backgroundRepeat: "no-repeat"
        }} 
        onContextMenu={this.redirectEvent.bind(this)}
        onPointerDown={this.redirectEvent.bind(this)}
        onWheel={this.redirectEvent.bind(this)}
        onTouchStart={this.redirectEvent.bind(this)}
        onTouchEnd={this.redirectEvent.bind(this)}
        onTouchMove={this.redirectEvent.bind(this)}
        onDragStart={this.redirectEvent.bind(this)}
        onDrag={this.redirectEvent.bind(this)}
        onDragEnd={this.redirectEvent.bind(this)}
      >
        <div style={{position: "absolute", width:this.props.width}}>
          {this.state.connected? <button onClick={this.disconnect.bind(this)}>Disconnect</button> : <button onClick={this.connect.bind(this)}>Connect</button>}
          <p>{this.socket.id}</p>
        </div>
        {/*<img 
          src={this.state.image_data} 
          style={{width: this.props.width, height: this.props.height, clip: "auto", "objectFit":"cover"}} 
          onContextMenu={this.redirectEvent.bind(this)}
          onPointerDown={this.redirectEvent.bind(this)}
          onWheel={this.redirectEvent.bind(this)}
          onTouchStart={this.redirectEvent.bind(this)}
          onTouchEnd={this.redirectEvent.bind(this)}
          onTouchMove={this.redirectEvent.bind(this)}
          //onDragStart={this.redirectEvent.bind(this)}
          //onDrag={this.redirectEvent.bind(this)}
          //onDragEnd={this.redirectEvent.bind(this)}
        />*/}
      </div>);
  }
}
 
export default SharedRendererViewer;