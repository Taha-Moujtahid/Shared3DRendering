import {React, Component} from "react"
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:2181";

class SharedRenderer extends Component {

    state = {  }

    componentDidMount() {
        var strMime = "image/jpeg";

        var socket = socketIOClient(ENDPOINT);
        socket.on("connect", ()=>{
            console.log("connected");
            socket.emit("available_renderer");
        });

        var scene = new THREE.Scene();

        //camera setup
        var camera = new THREE.PerspectiveCamera( 75, this.props.width/this.props.height, 0.1, 1000 );
        camera.position.z = 5;

        // renderer setup
        var renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
        renderer.setSize( this.props.width, this.props.height );
        this.mount.appendChild( renderer.domElement );

        // controls setup
        var controls = new OrbitControls(camera, renderer.domElement);

        // add cube to scene
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        var cube = new THREE.Mesh( geometry, material );
        scene.add( cube );

        //main loop
        var animate = function () {
            requestAnimationFrame( animate );
            controls.update();
            renderer.render( scene, camera );
          
            socket.emit("image-data",renderer.domElement.toDataURL(strMime));
        };
        animate();
      }

    render() { 
        return <div width={this.props.width} height={this.props.height} ref={ref => (this.mount = ref)}/>;
    }
}
 
export default SharedRenderer;