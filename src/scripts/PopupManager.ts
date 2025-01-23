import Phaser, { GameObjects, Scene } from "phaser";
import { GamblePopup } from "./Popups/GamblePopup";
import { LogoutPopup } from "./Popups/LogoutPopup";
import { SettingPopup } from "./Popups/SettingPopup";
import { InfoPopup } from "./Popups/InfoPopup";

export class Popupmanager{
    private scene: Scene
    private popupContainer: Phaser.GameObjects.Container
    private overLay: Phaser.GameObjects.Rectangle
    private currentPopup: InfoPopup | SettingPopup | LogoutPopup | GamblePopup | null = null

    constructor(scene: Scene){
        this.scene = scene
        this.popupContainer = scene.add.container(0, 0);
        this.popupContainer.setDepth(1000);

        // Create dark overlay
        this.overLay = scene.add.rectangle(0, 0, scene.scale.width,  scene.scale.height, 0x000000, 0.7).setOrigin(0).setDepth(0).setInteractive();
        // this.overLay.setOrigin(0);
        // this.overLay.setInteractive();
        // this.overLay.setDepth(0)

        //close all popup if click anywhere on the screen
        this.overLay.on("pointerdown",()=>{
            scene.events.emit("closePopup")
        })
        this.popupContainer.add(this.overLay);
        // Initially hide the container
        this.popupContainer.setVisible(false);
        this.scene.events.on('closePopup', this.closeCurrentPopup, this);
    }

    showInfoPoup(){
        this.closeCurrentPopup();
        this.currentPopup = new InfoPopup(this.scene, this)
        this.popupContainer.add(this.currentPopup);
        this.popupContainer.setVisible(true)

    }

    showSettingPopup(){
        this.closeCurrentPopup();
        this.currentPopup = new SettingPopup(this.scene, this)
        this.popupContainer.add(this.currentPopup)
        this.popupContainer.setVisible(true)
    }

    showLogoutPopup(){
        this.closeCurrentPopup();
        this.currentPopup = new LogoutPopup(this.scene, this)
        this.popupContainer.add(this.currentPopup)
        this.popupContainer.setVisible(true)
    }

    showGamblePopup(){
        this.closeCurrentPopup();
        this.currentPopup = new GamblePopup(this.scene, this)
        this.popupContainer.add(this.currentPopup)
        this.popupContainer.setVisible(true)
    }

    closeCurrentPopup() {
        if (this.currentPopup) {
            this.currentPopup.destroy();
            this.currentPopup = null;
        }
        this.popupContainer.setVisible(false);
    }
    // Add cleanup method
    destroy() {
        this.scene.events.off('closePopup', this.closeCurrentPopup, this);
        this.popupContainer.destroy();
    }

}