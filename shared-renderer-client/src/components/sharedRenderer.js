import {React, Component} from "react"
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:2181";

class SharedRenderer extends Component {

    state = {  }
    oldScreen = null;

    componentDidMount() {
        var strMime = "image/jpeg";

        var socket = socketIOClient(ENDPOINT);
        socket.on("connect", ()=>{
            console.log("connected");
            socket.emit("available_renderer");
        });
        var scene = new THREE.Scene();
        this.scene = scene

        //camera setup
        var camera = new THREE.PerspectiveCamera( 75, this.props.width/this.props.height, 0.1, 1000 );
        camera.position.z = 5;
        this.camera = camera;

        // renderer setup
        var renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
        this.renderer = renderer;

        renderer.setSize( this.props.width, this.props.height );
        this.mount.appendChild( renderer.domElement );
        
        // controls setup
        var controls = new OrbitControls(camera, renderer.domElement);

        // add cube to scene
        
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        var cube = new THREE.Mesh( geometry, material );
        scene.add( cube );

        var width = this.props.width, height= this.props.height, oldScreen = this.oldScreen;
        //main loop
        var animate = function () {

            var compareImages = function(oldScreen, renderer, scene, camera, width, height, limit){
                var read = new Uint8Array( width * height * 4 );
                var renderTarget = new THREE.WebGLRenderTarget(width,height);
                renderer.setRenderTarget(renderTarget);
                renderer.render( scene, camera );
                renderer.setRenderTarget(null);
                renderer.readRenderTargetPixels(renderTarget,0,0,width,height, read)
                if(oldScreen){
                    var diff = 0;
                    for(var pixel = 0; pixel <= this.oldScreen.length; pixel++){
                        diff += Math.abs(oldScreen[pixel] - read[pixel])/255;
                    }
                    console.log(diff/4/width/height);
                    if(diff/4/width/height >= limit){
                        this.oldScreen = read;
                        return true;
                    }else{
                        return false;
                    }
                }
                oldScreen = read;
            };
            

            requestAnimationFrame( animate );
            controls.update();
            renderer.render( scene, camera );
            if(socket.connected){
                if(compareImages(oldScreen, renderer,scene,camera,width,height, 0.10)){
                    console.log("differs");
                    socket.emit("image-data",renderer.domElement.toDataURL(strMime));
                }
            }
        };
        animate();
    }

    render() { 
        return <div width={this.props.width} height={this.props.height} ref={ref => (this.mount = ref)}/>;
    }
}
 
export default SharedRenderer;