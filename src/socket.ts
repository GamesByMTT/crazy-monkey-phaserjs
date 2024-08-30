import { io } from "socket.io-client";
import { Globals, ResultData, initData } from "./scripts/Globals";
import MainLoader from "./view/MainLoader";
let counter = 0


// const socketUrl = process.env.SOCKET_URL || ""
export class SocketManager {
  public socket : any;
  public authToken : string = "";
  public SocketUrl : string= "";
  public socketLoaded : boolean = false;

  constructor() { 
   
  }
  onToken(data : {socketUrl : string, authToken : string})
  {
    try { 
      this.SocketUrl = data.socketUrl;
      this.authToken = data.authToken;
      this.socketLoaded = true;
      this.setupSocket();
    }
    catch(error){
      console.error("Got Error In Auth Token : ",error);
    }
  }
  
  setupSocket()
  {
   this.socket = io(this.SocketUrl, {
      auth: {
        token: this.authToken,
        gameId: "SL-CM",
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000, // Initial delay between reconnection attempts (in ms)
      reconnectionDelayMax: 5000,
    });
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on("connect_error", (error: Error) => {
      console.error("Connection Error:", error.message);
    });

    this.socket.on("connect", () => {
      console.log("Connected to the server");


      this.socket.on("message", (message : any) => {
        const data = JSON.parse(message);
        // console.log(`Message ID : ${data.id} |||||| Message Data : ${JSON.stringify(data.message)}`);
        if(data.id == "InitData" ) {
          console.log(counter, "Socket");
          if(initData.gameData.Bets.length != 0){

            
          }
          else{
            initData.gameData = data.message.GameData;
            initData.playerData = data.message.PlayerData;
            initData.UIData.symbols = data.message.UIData.paylines.symbols
            initData.gameData.BonusData = data.message.BonusData;
            console.log(data, "initData on Socket File");
            Globals.SceneHandler?.addScene("MainLoader", MainLoader, true)
          }
            // Globals.MainLoader?.onInitDataReceived();
            // this.onInitDataReceived()
            
        }
        if(data.id == "ResultData"){
              ResultData.gameData = data.message.GameData;
              ResultData.playerData = data.message.PlayerData;
              Globals.emitter?.Call("ResultData");
              console.log(ResultData);
        }
      });
    });

    this.socket.on("internalError", (errorMessage: string) => {
      console.log(errorMessage);
    });
  }
  sendMessage(id : string, message: any) {
    console.log(message, "sending message");
    this.socket.emit(
      "message",
      JSON.stringify({ id: id, data: message })
    );
  }
}

