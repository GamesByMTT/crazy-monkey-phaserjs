import Phaser from "phaser";
import { Globals, initData, TextStyle } from "./Globals";
import { gameConfig } from "./appconfig";
import { TextLabel } from "./TextLabel";
import { UiContainer } from "./UiContainer";
import MainLoader from "../view/MainLoader";
import SoundManager from "./SoundManager";
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

const Random = Phaser.Math.Between;

export class UiPopups extends Phaser.GameObjects.Container {
    SoundManager: SoundManager;
    UiContainer: UiContainer
    menuBtn!: InteractiveBtn;
    settingBtn!: InteractiveBtn;
    rulesBtn!: InteractiveBtn;
    infoBtn!: InteractiveBtn;
    exitBtn!: InteractiveBtn
    yesBtn!: InteractiveBtn;
    noBtn!: InteractiveBtn
    isOpen: boolean = false;
    isExitOpen: boolean = false;
    settingClose!: InteractiveBtn;
    onButton!: InteractiveBtn;
    offButton!:InteractiveBtn;
    toggleBar!: InteractiveBtn;
    soundEnabled: boolean = true; // Track sound state
    musicEnabled: boolean = true; // Track sound state
    normalButtonSound!: Phaser.Sound.BaseSound
    constructor(scene: Phaser.Scene, uiContainer: UiContainer, soundManager: SoundManager) {
        super(scene);
        this.setPosition(0, 0);
        // this.ruleBtnInit();
        this.settingBtnInit();
        this.menuBtnInit();
        this.exitButton();
        this.UiContainer = uiContainer
        this.SoundManager = soundManager
        scene.add.existing(this);
    }

    menuBtnInit() {
        const menuBtnTextures = [
            this.scene.textures.get('MenuBtn'),
            this.scene.textures.get('MenuBtn')
        ];
        this.menuBtn = new InteractiveBtn(this.scene, menuBtnTextures, () => {
            this.buttonMusic("buttonpressed")
            this.openPopUp();
        }, 0, true);
        this.menuBtn.setPosition( gameConfig.scale.width - this.menuBtn.width * 2,  this.menuBtn.height)
        this.add(this.menuBtn);
    }
    exitButton(){
        const exitButtonSprites = [
            this.scene.textures.get('exitButton'),
            this.scene.textures.get('exitButton')
        ];
        this.exitBtn = new InteractiveBtn(this.scene, exitButtonSprites, ()=>{
                this.buttonMusic("buttonpressed")
                this.openLogoutPopup();
        }, 0, true, );
        this.exitBtn.setPosition(this.exitBtn.width , this.exitBtn.height)
        this.add(this.exitBtn)
    }
    
    settingBtnInit() {
        const settingBtnSprites = [
            this.scene.textures.get('settingBtn'),
            this.scene.textures.get('settingBtnH')
        ];
        this.settingBtn = new InteractiveBtn(this.scene, settingBtnSprites, () => {
            this.buttonMusic("buttonpressed")
            this.openPopUp();
            // setting Button
            this.openSettingPopup();
        }, 1, false); // Adjusted the position index
        this.settingBtn.setPosition(gameConfig.scale.width/ 2 - this.settingBtn.width * 6, this.settingBtn.height * 0.7);
        this.settingBtn.setScale(0.9)
        this.add(this.settingBtn);
    }


    openPopUp() {
        // Toggle the isOpen boolean
        this.isOpen = !this.isOpen;
        this.menuBtn.setInteractive(false);
        if (this.isOpen) {
            // this.tweenToPosition(this.rulesBtn, 3);
            this.tweenToPosition(this.settingBtn, 1);
        } else {
            // this.tweenBack(this.rulesBtn);
            this.tweenBack(this.settingBtn);
        }
    }

    tweenToPosition(button: InteractiveBtn, index: number) {
        const targetX =  this.menuBtn.x + ((index * 1.2) * (this.menuBtn.width))
       // Calculate the Y position with spacing
       button.setPosition(this.menuBtn.x, this.menuBtn.y)
        button.setVisible(true);
        this.scene.tweens.add({
            targets: button,
            x: targetX,
            duration: 300,
            ease: 'Elastic',
            easeParams: [1, 0.9],
            onComplete: () => {
                button.setInteractive(true);
                this.menuBtn.setInteractive(true);
            }
        });
    }
    tweenBack(button: InteractiveBtn) {
        button.setInteractive(false);
        this.scene.tweens.add({
            targets: button,
            x: button,
            duration: 100,
            ease: 'Elastic',
            easeParams: [1, 0.9],
            onComplete: () => {
                button.setVisible(false);
                this.menuBtn.setInteractive(true);
            }
        });
    }
    /**
     * 
     */
    openSettingPopup() {
        const settingblurGraphic = this.scene.add.graphics().setDepth(1); // Set depth lower than popup elements
        settingblurGraphic.fillStyle(0x000000, 0.5); // Black with 50% opacity
        settingblurGraphic.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height); // Cover entire screen

        const infopopupContainer = this.scene.add.container(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        ).setDepth(1);
        
        const popupBg = this.scene.add.image(0, 0, 'messagePopup').setDepth(9);
        const settingText = this.scene.add.image(0, -330, 'settingText').setScale(0.6)
        const soundsImage = this.scene.add.image(-450, -120, 'soundImage').setDepth(10).setScale(0.7);
        const musicImage = this.scene.add.image(-450, 80, 'musicImage').setDepth(10).setScale(0.7);
        const soundProgreesBar = this.scene.add.image(40, -100, 'sounProgress')
        const musicProgreesBar = this.scene.add.image(40,100, 'sounProgress')
        const sounPlus = this.scene.add.image(420, 40, 'soundPlus').setInteractive()
        const soundMinus = this.scene.add.image(-330, 40, 'soundMinus').setInteractive()
        const sounPlusOne = this.scene.add.image(420, -160, 'soundPlus').setInteractive()
        const soundMinusOne = this.scene.add.image(-330, -160, 'soundMinus').setInteractive()

        // New sprite for sound level indicator
        const soundLevelIndicator = this.scene.add.image(40, -100, 'indicatorSprite').setDepth(11).setInteractive();
        const musicLevelIndicator = this.scene.add.image(40, 100, 'indicatorSprite').setDepth(11).setInteractive();

        // Configure initial positions based on current sound levels
        let soundLevel = 0.5; // Example: start at 50%
        let musicLevel = 0.5; // Example: start at 50%

        // Set initial position of indicators
        soundLevelIndicator.x = soundProgreesBar.x + (soundProgreesBar.width * soundLevel - soundProgreesBar.width / 2);
        musicLevelIndicator.x = musicProgreesBar.x + (musicProgreesBar.width * musicLevel - musicProgreesBar.width / 2);




        const toggleBarSprite = [
            this.scene.textures.get('toggleBar'),
            this.scene.textures.get('toggleBar')
        ];
        if(this.soundEnabled){
            
        }
        const exitButtonSprites = [
            this.scene.textures.get('crossButton'),
            this.scene.textures.get('crossButtonHover')
        ];
        this.settingClose = new InteractiveBtn(this.scene, exitButtonSprites, () => {
            infopopupContainer.destroy();
            settingblurGraphic.destroy();
            this.buttonMusic("buttonpressed")
        }, 0, true);
        this.settingClose.setPosition(500, -200).setScale(0.8);

        popupBg.setOrigin(0.5);
        popupBg.setScale(0.9)
        popupBg.setAlpha(1); // Set background transparency
        infopopupContainer.add([popupBg, settingText, this.settingClose, soundsImage, musicImage, soundProgreesBar, musicProgreesBar, sounPlusOne, soundMinusOne, sounPlus, soundMinus, soundLevelIndicator, musicLevelIndicator]);
         // Add interactivity to plus and minus buttons for sound
        sounPlus.on('pointerdown', () => {
            if (soundLevel < 1) {
                soundLevel += 0.1; // Increase sound level
                this.adjustSoundVolume(soundLevel); // Adjust sound volume function
                musicLevelIndicator.x = musicProgreesBar.x + ((musicProgreesBar.width * soundLevel) - musicProgreesBar.width / 1.5);
            }
        });

        soundMinus.on('pointerdown', () => {
            if (soundLevel > 0) {
                soundLevel -= 0.1; // Decrease sound level
                this.adjustSoundVolume(soundLevel); // Adjust sound volume function
                musicLevelIndicator.x = musicProgreesBar.x + ((musicProgreesBar.width * soundLevel) - musicProgreesBar.width / 2.5);
            }
        });

        // Add interactivity to plus and minus buttons for music
        sounPlusOne.on('pointerdown', () => {
            if (musicLevel < 1) {
                musicLevel += 0.1; // Increase music level
                this.adjustMusicVolume(musicLevel); // Adjust music volume function
                soundLevelIndicator.x = soundProgreesBar.x + (soundProgreesBar.width * musicLevel - soundProgreesBar.width / 2);
            }
        });

        soundMinusOne.on('pointerdown', () => {
            if (musicLevel > 0) {
                musicLevel -= 0.1; // Decrease music level
                this.adjustMusicVolume(musicLevel); // Adjust music volume function
                soundLevelIndicator.x = musicProgreesBar.x + (soundProgreesBar.width * musicLevel - soundProgreesBar.width / 2);
            }
        });
}

    // Function to adjust sound volume
    adjustSoundVolume(level:number) {
        // Implement sound volume adjustment logic here
        this.scene.sound.volume = level; // Example using Phaser sound manager
    }

    // Function to adjust music volume
    adjustMusicVolume(level: number) {
        // Implement music volume adjustment logic here
        this.scene.sound.volume = level; // Example using Phaser sound manager
    }
    
    buttonMusic(key: string){
        // this.SoundManager.playSound(key)
    }

    /**
     * @method openLogoutPopup
     * @description creating an container for exitPopup 
     */
    openLogoutPopup() {
        // Create a semi-transparent background for the popup
        const blurGraphic = this.scene.add.graphics().setDepth(1); // Set depth lower than popup elements
        blurGraphic.fillStyle(0x000000, 0.5); // Black with 50% opacity
        blurGraphic.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height); // Cover entire screen
        
        this.UiContainer.onSpin(true);
        // Create a container for the popup
        const popupContainer = this.scene.add.container(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        ).setDepth(1); // Set depth higher than blurGraphic
    
        // Popup background image
        const popupBg = this.scene.add.image(0, 0, 'messagePopup').setDepth(10);
        popupBg.setOrigin(0.5);
        popupBg.setDisplaySize(900, 559); // Set the size for your popup background
        popupBg.setAlpha(1); // Set background transparency
        this.exitBtn.disableInteractive();
        // Add text to the popup
        const popupText = new TextLabel(this.scene, 0, -45, "Do you really want \n to exit?", 50, "#ffffff");
        
        // Yes and No buttons
        const logoutButtonSprite = [
            this.scene.textures.get("yesButton"),
            this.scene.textures.get("yesButtonHover")
        ];
        this.yesBtn = new InteractiveBtn(this.scene, logoutButtonSprite, () => {
            
            this.UiContainer.onSpin(false);
            Globals.Socket?.socket.emit("EXIT", {});
            // window.parent.postMessage("onExit", "*");
            popupContainer.destroy();
            blurGraphic.destroy(); // Destroy blurGraphic when popup is closed
        }, 0, true);
        const logoutNoButtonSprite = [
            this.scene.textures.get("noButton"),
            this.scene.textures.get("noButtonHover")
        ];
        this.noBtn = new InteractiveBtn(this.scene, logoutNoButtonSprite, () => {
            
            this.UiContainer.onSpin(false);
            this.exitBtn.setInteractive()
            // this.exitBtn.setTexture("normalButton");
            popupContainer.destroy();
            blurGraphic.destroy(); // Destroy blurGraphic when popup is closed
        }, 0, true);
       
        this.yesBtn.setPosition(-130, 80).setScale(0.5, 0.5);
        this.noBtn.setPosition(130, 80).setScale(0.5, 0.5);;
       
        // Add all elements to popupContainer
        popupContainer.add([popupBg, popupText, this.yesBtn, this.noBtn]);
        // Add popupContainer to the scene
        this.scene.add.existing(popupContainer);       
    }
    
    buttonInteraction(press: boolean){
        if(press){
            this.menuBtn.disableInteractive();
            this.settingBtn.disableInteractive()
            this.rulesBtn.disableInteractive();
            this.menuBtn.disableInteractive();
        }
    }
}

class InteractiveBtn extends Phaser.GameObjects.Sprite {
    moveToPosition: number = -1;
    defaultTexture!: Phaser.Textures.Texture;
    hoverTexture!: Phaser.Textures.Texture

    constructor(scene: Phaser.Scene, textures: Phaser.Textures.Texture[], callback: () => void, endPos: number, visible: boolean) {
        super(scene, 0, 0, textures[0].key); // Use texture key
        this.defaultTexture = textures[0];
        this.hoverTexture = textures[1];        
        this.setOrigin(0.5);
        this.setInteractive();
        this.setVisible(visible);
        this.moveToPosition = endPos;
        this.on('pointerdown', () => {
            this.setTexture(this.hoverTexture.key)
            // this.setFrame(1);
            callback();
        });
        this.on('pointerup', () => {
            this.setTexture(this.defaultTexture.key)
            // this.setFrame(0);
        });
        this.on('pointerout', () => {
            this.setTexture(this.defaultTexture.key)
            // this.setFrame(0);
        });
        // Set up animations if necessary
        this.anims.create({
            key: 'hover',
            frames: this.anims.generateFrameNumbers(textures[1].key),
            frameRate: 10,
            repeat: -1
        });
    }
}