import Phaser, {Scene} from "phaser";
import SoundManager from "../SoundManager";
import { TextLabel } from "../TextLabel";
import { Globals } from "../Globals";
import { gameConfig } from "../appconfig";
import { getMaxListeners } from "process";

export class LogoutPopup extends Phaser.GameObjects.Container{
    yesBtn: Phaser.GameObjects.Sprite
    noBtn!: Phaser.GameObjects.Sprite
    constructor(scene: Scene, data: any){
        super(scene);
        
                // Popup background image
                const popupBg = this.scene.add.image(gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.5, 'messagePopup').setDepth(10);
                popupBg.setOrigin(0.5);
                popupBg.setDisplaySize(900, 559); // Set the size for your popup background
                popupBg.setAlpha(1); // Set background transparency
             
                // Add text to the popup
                const popupText = new TextLabel(this.scene, gameConfig.scale.width * 0.5, (gameConfig.scale.height * 0.5) - 45, "Do you really want \n to exit?", 50, "#ffffff");
                
                this.yesBtn = this.scene.add.sprite(gameConfig.scale.width * 0.5 - 130, gameConfig.scale.height * 0.5 + 80, "yesButton").setInteractive().setOrigin(0.5).setScale(0.5)
                this.yesBtn.on("pointerdown", ()=>{
                    window.parent.postMessage("onExit", "*");   
                    Globals.Socket?.socket.emit("EXIT", {});
                })

                this.noBtn = this.scene.add.sprite(gameConfig.scale.width * 0.5 + 130, gameConfig.scale.height * 0.5 + 80, "noButton").setInteractive().setScale(0.5).setOrigin(0.5)
                this.noBtn.on("pointerdown", ()=>{
                    this.scene.events.emit("closePopup")
                })
                // Add all elements to popupContainer
                this.add([popupBg, popupText, this.yesBtn, this.noBtn]);
  
    }
}