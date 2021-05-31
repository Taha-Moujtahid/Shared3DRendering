const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,{
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

var renderPairs = [];
var waitingViewers = [];

app.get('/', (req, res) => {
  res.send(`RenderPairsCount: ${renderPairs.length} , WaitingViewers: ${waitingViewers.length}`);
  console.log(renderPairs);
});

class RenderPair {
  constructor (renderer, viewer){
    if(renderer){
      this.renderer = renderer; 
      this.renderer.on('disconnect', ()=>{
        console.log("Renderer disconnected!")
        renderPairs = renderPairs.filter((it) => it.renderer !== this.renderer);
        waitingViewers.push(this.viewer);
        this.unbindViewer();
      });
    }
    if(viewer){
      this.viewer = viewer;
    }else{
      this.viewer = null;
    }
  }

  bindViewer(viewer){
    if(viewer){
      this.viewer = viewer;
      this.renderer.on("image-data", (img) =>{
        if(this.viewer){
          this.viewer.emit("image-data",img);
        }
      });
      this.viewer.emit("viewer_dequeued");
      console.log(`viewer ${this.viewer.id} connected to renderer ${this.renderer.id}`)
      this.viewer.on("trigger_event",(obj)=>{
        this.renderer.emit("trigger_event",obj);
        console.log(obj)
      })
    }
  }

  unbindViewer(){
    if(this.viewer){
      console.log(`viewer ${this.viewer.id} disconnected from renderer ${this.renderer.id}`)
      this.viewer.emit("viewer_queued");
      this.viewer = null;
    }
  }
  
}

var addRenderer = (renderer) => {
  var renderPair = new RenderPair(renderer, null);
  if(waitingViewers.length > 0){
    renderPair.bindViewer(waitingViewers.shift());
  }
  renderPairs.push(renderPair);
}

var addViewer = (viewer) => {
  viewer.on("disconnect", ()=>{
    console.log("viewer disconnected!");
    waitingViewers = waitingViewers.filter((it) => it != viewer);
    var renderPair = renderPairs.find((it) => it.viewer == viewer);
    if(renderPair){
      renderPair.unbindViewer();
      if(waitingViewers.length > 0){
        renderPair.bindViewer(waitingViewers.shift());
      }
    }
  });

  for(var renderPair of renderPairs){
    if(!renderPair.viewer){
      renderPair.bindViewer(viewer);
      return;
    }
  }
  
  waitingViewers.push(viewer);
  viewer.emit("viewer_queued");
}

io.on('connection', (socket) => {
  socket.on("available_renderer",() => {
    console.log("renderer available!");
    addRenderer(socket);
  })

  socket.on("available_viewer", () => {
    console.log("viewer available!");
    addViewer(socket);
  });
});

server.listen(2181, () => {
  console.log('listening on *:2181');
});