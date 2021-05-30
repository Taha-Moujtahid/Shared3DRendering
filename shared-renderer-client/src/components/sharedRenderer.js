import {React, Component} from "react"
import * as THREE from "three"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";

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
        scene.background = new THREE.Color(0xcecece)
        this.scene = scene

        //camera setup
        var camera = new THREE.PerspectiveCamera( 75, this.props.width/this.props.height, 0.1, 1000 );
        camera.position.z = 10;
        this.camera = camera;

        // renderer setup
        var renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
        this.renderer = renderer;

        renderer.setSize( this.props.width, this.props.height );
        this.mount.appendChild( renderer.domElement );
        
        // controls setup
        var controls = new OrbitControls(camera, renderer.domElement);

        // add plant model to scene
        var loader = new GLTFLoader();
        loader.load(
            'models/plant.glb', 
            (model)=>{
                model.scene.castShadow = false
                model.scene.receiveShadow = false
                model.scene.scale.set(0.5,0.5,0.5)
                scene.add(model.scene);
            },
            ( xhr )=>{},
            (err)=>console.log(err)
        );

        scene.add(new THREE.AmbientLight(0xffffff,1))
        for(var i = 0; i != 10; i++){
            const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.25 );
            i % 2 ? directionalLight.position.set( -i*10, 10, i*10 ) :directionalLight.position.set( i*10, 10, -i*10 ) ;
            scene.add( directionalLight );
        } 

        

        let width = this.props.width, height= this.props.height ;
        //main loop
        var animate = ()=>{
            var renderTarget = new THREE.WebGLRenderTarget(width,height);
            var read = new Uint8Array( width * height * 4 );
            renderer.setRenderTarget(renderTarget);
            renderer.render( scene, camera );
            renderer.setRenderTarget(null);
            renderer.readRenderTargetPixels(renderTarget,0,0,width,height, read)
            var oldScreen = this.oldScreen
            var compareImages = (limit)=>{
                if(oldScreen){
                    var diff = 0;
                    for(var pixel = 0; pixel <= oldScreen.length; pixel++){
                        diff += Math.abs(oldScreen[pixel] - read[pixel])/255;
                    }
                    if(diff/4/width/height >= limit){
                        oldScreen = read;
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
                if(compareImages(0.10)){
                    console.log("differs");
                }
                socket.emit("image-data",renderer.domElement.toDataURL(strMime));
            }
        };
        animate();
    }

    render() { 
        return <div width={this.props.width} height={this.props.height} ref={ref => (this.mount = ref)}/>;
    }
}
 
export default SharedRenderer;