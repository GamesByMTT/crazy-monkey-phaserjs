import { Scene, GameObjects } from "phaser";
import { gameConfig } from "../appconfig";
import { Globals } from "../Globals";

export class DisconnectionPopup extends Phaser.GameObjects.Container{
    popupBackground!: Phaser.GameObjects.Sprite
    quit!: Phaser.GameObjects.Sprite
    SceneBg!: Phaser.GameObjects.Sprite
    constructor(scene: Scene){
        super(scene)
        this.SceneBg = new Phaser.GameObjects.Sprite(this.scene, gameConfig.scale.width / 2, gameConfig.scale.height / 2, 'Background').setDisplaySize(gameConfig.scale.width, gameConfig.scale.height).setDepth(11).setInteractive();
                this.SceneBg.on('pointerdown', (pointer:Phaser.Input.Pointer)=>{
                    pointer.event.stopPropagation();
                })
                this.popupBackground = new Phaser.GameObjects.Sprite(this.scene, gameConfig.scale.width/2, gameConfig.scale.height/2, "messagePopup").setScale(0.8);
                const disconnectionText = this.scene.add.text( this.popupBackground.x, this.popupBackground.y - 70, "Unable to connect to server", {color: "#ffffff", fontFamily:"Poplar", fontSize: '50px', stroke: "#4f3130",
                    strokeThickness: 1.5, align:"center", wordWrap: { width: 800, useAdvancedWrap: true }})
                disconnectionText.setOrigin(0.5);
                this.quit = new Phaser.GameObjects.Sprite(this.scene, gameConfig.scale.width/2, gameConfig.scale.height/2 + 100, "disconnectClose").setInteractive().setScale(0.8)
                this.quit.on('pointerdown', () => {
                    window.parent.postMessage("onExit", "*");   
                    Globals.Socket?.socket.emit("EXIT", {});
                })
                this.add([this.popupBackground, this.quit, disconnectionText])
    }
}