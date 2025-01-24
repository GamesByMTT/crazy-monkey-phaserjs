import { io } from "socket.io-client";
import { Globals, ResultData, initData, gambleData, gambleResult } from "./scripts/Globals";
import MainLoader from "./view/MainLoader";
import { Popupmanager } from "./scripts/PopupManager";
import { Scene } from "phaser";

let counter = 0


// const socketUrl = process.env.SOCKET_URL || ""
export class SocketManager {
  popupManager!: Popupmanager
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
        gameId: "",
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
          if(initData.gameData.Bets.length != 0){
            initData.UIData.symbols = data.message.UIData.payLines.symbol
          }
          else{
            initData.gameData = data.message.GameData;
            initData.playerData = data.message.PlayerData;
            initData.UIData.symbols = data.message.UIData.paylines.symbols
            initData.gameData.BonusData = data.message.BonusData;
            ResultData.playerData.Balance = data.message.PlayerData.Balance;
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
              console.log(ResultData.gameData.isBonus, "Bonus");
        }
        if(data.id == "gambleInitData"){
          gambleData.gambleCards = data.message
        }
        if(data.id == "gambleResultData"){
          gambleResult.gamleResultData = data.message
        
        }
        if(data.id == "GambleResult"){
          gambleResult.gamleResultData = data.message
          ResultData.playerData = data.message
          Globals.emitter?.Call("GambleResult");
        }
      });
    });

    this.socket.on("internalError", (errorMessage: string) => {
      console.log(errorMessage);
    });

    this.socket.on("disconnect", (reason: string) => {
      console.log("Disconnected from the server. Reason:", reason);
      setTimeout(() => {
        // this.popupManager.showDisconnectionPopup()
        // Globals.SceneHandler?.addScene("Disconnection", Disconnection, true)
      }, 2000)
    });
    this.socket.on("reconnect_attempt", (attemptNumber: number) => {
      console.log(`Reconnection attempt #${attemptNumber}`);
    });
  
    this.socket.on("reconnect", (attemptNumber: number) => {
      console.log(`Reconnected to the server on attempt #${attemptNumber}`);
    });
  
    this.socket.on("reconnect_failed", () => {
      console.error("Reconnection failed.");
    });
  }
  sendMessage(id : string, message: any) {
    // console.log(message, "sending message");
    this.socket.emit(
      "message",
      JSON.stringify({ id: id, data: message })
    );
  }
}

