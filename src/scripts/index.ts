import Phaser from "phaser";
import { gameConfig, CalculateScaleFactor } from "./appconfig";
import { Globals } from "./Globals";
import { SocketManager } from "../socket";
import { SceneHandler } from "./SceneHandler";
// import "../../public/style.css"

window.parent.postMessage( "authToken","*");

if(!IS_DEV){
  window.addEventListener("message", function(event: MessageEvent) {
    // Check the message type and handle accordingly
    if (event.data.type === "authToken") {
      // console.log("event check", event.data);
      const data = { 
        socketUrl : event.data.socketURL,
        authToken :  event.data.cookie
      }
      // Call the provided callback function
      Globals.Socket = new SocketManager();
      Globals.Socket.onToken(data);
      window.parent.postMessage("OnEnter", "*")
    }
  });
}
else{
  const data  = {
    socketUrl : "https://game-crm-rtp-backend.onrender.com/",
    authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZDgyOWZhODZkMjg2OGQ4YWIxOTZmYSIsInVzZXJuYW1lIjoicml0aWsiLCJyb2xlIjoicGxheWVyIiwiaWF0IjoxNzMxNDA2MjQyLCJleHAiOjE3MzIwMTEwNDJ9.ToDpwLap0Zz2ZSuBX2qcJo_Hos6jQ9aTQ_t0Dyb46z8"
    // authToken : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZDg1MjhmYTI3YmY5MDI0NDNlYmExZiIsInVzZXJuYW1lIjoiYXJwaXQiLCJyb2xlIjoicGxheWVyIiwiaWF0IjoxNzMxMzg3OTM2LCJleHAiOjE3MzE5OTI3MzZ9.WuNXeW1dxTl12cAn-z7AdUHvsE0PQ168lz7lJvS7_BQ",
  }
  Globals.Socket = new SocketManager();
  Globals.Socket.onToken(data);
}

function loadGame() {
  const game = new Phaser.Game(gameConfig);
  const sceneHandler = new SceneHandler(game);
  Globals.SceneHandler = sceneHandler;  
  // console.log(Globals.SceneHandler, "Globals.SceneHandler in index file");
}

if (typeof console !== 'undefined') {
  console.warn = () => {};
  console.info = () => {};
  // console.debug = () => {};
}


loadGame();