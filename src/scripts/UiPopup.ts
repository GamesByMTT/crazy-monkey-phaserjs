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
        this.infoBtnInit();
        this.menuBtnInit();
        this.exitButton();
        this.UiContainer = uiContainer
        this.SoundManager = soundManager
        scene.add.existing(this);
    }

    menuBtnInit() {
        const menuBtnTextures = [
            this.scene.textures.get('MenuBtn'),
            this.scene.textures.get('MenuBtnH')
        ];
        this.menuBtn = new InteractiveBtn(this.scene, menuBtnTextures, () => {
            this.buttonMusic("buttonpressed")
            this.openPopUp();
        }, 0, true);
        this.menuBtn.setPosition( gameConfig.scale.width/ 2 - this.menuBtn.width * 7, gameConfig.scale.height - this.menuBtn.height * 2.3 );
        this.add(this.menuBtn);
    }
    exitButton(){
        const exitButtonSprites = [
            this.scene.textures.get('exitButton'),
            this.scene.textures.get('exitButtonPressed')
        ];
        this.exitBtn = new InteractiveBtn(this.scene, exitButtonSprites, ()=>{
                this.buttonMusic("buttonpressed")
                this.openLogoutPopup();
        }, 0, true, );
        this.exitBtn.setPosition(gameConfig.scale.width - this.exitBtn.width * 0.5, this.exitBtn.height * 0.5).setScale(0.5, 0.5)
        this.add(this.exitBtn)
    }
    
    settingBtnInit() {
        const settingBtnSprites = [
            this.scene.textures.get('settingBtn'),
            this.scene.textures.get('settingBtnH')
        ];
        this.settingBtn = new InteractiveBtn(this.scene, settingBtnSprites, () => {
            this.buttonMusic("buttonpressed")
            // setting Button
            this.openSettingPopup();
        }, 1, false); // Adjusted the position index
        this.settingBtn.setPosition(gameConfig.scale.width/ 2 - this.settingBtn.width * 5, this.settingBtn.height * 0.7);
        this.add(this.settingBtn);
    }

    infoBtnInit() {
        const infoBtnSprites = [
            this.scene.textures.get('infoBtn'),
            this.scene.textures.get('infoBtnH'),
        ];
        this.infoBtn = new InteractiveBtn(this.scene, infoBtnSprites, () => {
            // info button 
            this.buttonMusic("buttonpressed")
            this.openInfoPopup();
        }, 2, false); // Adjusted the position index
        this.infoBtn.setPosition(gameConfig.scale.width/ 2 - this.infoBtn.width * 5, this.infoBtn.height * 0.7);
        this.add(this.infoBtn);
    }

    openPopUp() {
        // Toggle the isOpen boolean
        this.isOpen = !this.isOpen;
        this.menuBtn.setInteractive(false);
        if (this.isOpen) {
            // this.tweenToPosition(this.rulesBtn, 3);
            this.tweenToPosition(this.infoBtn, 2);
            this.tweenToPosition(this.settingBtn, 1);
        } else {
            // this.tweenBack(this.rulesBtn);
            this.tweenBack(this.infoBtn);
            this.tweenBack(this.settingBtn);
        }
    }

    tweenToPosition(button: InteractiveBtn, index: number) {
        const targetY =  this.menuBtn.y - (index * (this.menuBtn.height))
       // Calculate the Y position with spacing
       button.setPosition(this.menuBtn.x, this.menuBtn.y)
        button.setVisible(true);
        this.scene.tweens.add({
            targets: button,
            y: targetY,
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
            y: button,
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
        
        const popupBg = this.scene.add.image(0, 0, 'settingPopup').setDepth(9);
        const soundsImage = this.scene.add.image(-200, -120, 'soundImage').setDepth(10);
        const musicImage = this.scene.add.image(-200, 50, 'musicImage').setDepth(10);

        const toggleBarSprite = [
            this.scene.textures.get('toggleBar'),
            this.scene.textures.get('toggleBar')
        ];
        if(this.soundEnabled){
            
        }
        const initialTexture = this.soundEnabled ? "onButton" : "offButton";
        const onOff = this.scene.add.image(220, -120, initialTexture).setScale(0.5);
        onOff.setInteractive()
        onOff.on('pointerdown', () => {
            this.toggleSound(onOff);
        })

        const toggleMusicBar = this.scene.add.image(200, 50, "toggleBar")
        toggleMusicBar.setScale(0.5)
        const musicinitialTexture = this.musicEnabled ? "onButton" : "offButton";
        const offMusic = this.scene.add.image(220, 50, musicinitialTexture)
        offMusic.setScale(0.5)
        offMusic.setInteractive();
        offMusic.on('pointerdown', () => {
            this.toggleMusic(offMusic)
        })

        this.toggleBar = new InteractiveBtn(this.scene, toggleBarSprite, () => {
            // this.toggleSound();
        }, 0, true).setPosition(200, -120);
        this.toggleBar.setScale(0.5);

        const exitButtonSprites = [
            this.scene.textures.get('exitButton'),
            this.scene.textures.get('exitButtonPressed')
        ];
        this.settingClose = new InteractiveBtn(this.scene, exitButtonSprites, () => {
            infopopupContainer.destroy();
            settingblurGraphic.destroy();
            this.buttonMusic("buttonpressed")
        }, 0, true);
        this.settingClose.setPosition(350, -350).setScale(0.7);

        popupBg.setOrigin(0.5);
        popupBg.setScale(0.8);
        popupBg.setAlpha(1); // Set background transparency

        infopopupContainer.add([popupBg, this.settingClose, soundsImage, musicImage, this.toggleBar, onOff, toggleMusicBar, offMusic]);
    }

    toggleSound(onOff: any) {
        // Toggle sound state
        this.soundEnabled = !this.soundEnabled;
        if (this.soundEnabled) {
            onOff.setTexture('onButton');
            onOff.setPosition(220, -120); // Move position for 'On' state
            this.SoundManager.setSoundEnabled(this.soundEnabled)
            // Logic to turn sound on
            // Globals.soundManager.play("yourSound");
        } else {
            onOff.setTexture('offButton');
            onOff.setPosition(180, -120); // Move position for 'Off' state
            this.SoundManager.setSoundEnabled(this.soundEnabled)
            // Logic to turn sound off
            // Globals.soundManager.stop("yourSound");
        }
    }

    toggleMusic(offMusic: any) {
        // Toggle sound state
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            offMusic.setTexture('onButton');
            offMusic.setPosition(220, 50); // Move position for 'On' state
            this.SoundManager.setMusicEnabled(this.musicEnabled)

            // Globals.soundManager.play("yourSound");
        } else {
            offMusic.setTexture('offButton');
            this.SoundManager.setMusicEnabled(this.musicEnabled);
            offMusic.setPosition(180, 50); // Move position for 'Off' state
            // Logic to turn sound off
            // Globals.soundManager.stop("yourSound");
        }
    }

    /**
     * @method openinfo
     */

        openInfoPopup() { 
                // 1. Create the main popup container 
                const popupContainer = this.scene.add.container(0, 0).setDepth(11); 
                // 2. Add a background to the popup container 
                const popupBackground = this.scene.add.sprite( gameConfig.scale.width / 2, gameConfig.scale.height / 2, "popupbg" ); popupBackground.setDisplaySize(1920, 1080); popupContainer.add(popupBackground); 
                // 3. Add a heading image to the popup container 
                const headingImage = this.scene.add.image( gameConfig.scale.width / 2, gameConfig.scale.height / 2 - 400, 'headingImage' ); popupContainer.add(headingImage); 
                // 4. Add a close button to the popup 
                const closeButton = this.scene.add.sprite( gameConfig.scale.width / 2 + 800, gameConfig.scale.height / 2 - 400, 'exitButton' ).setInteractive(); 
                closeButton.setScale(0.5); closeButton.on('pointerdown', () => { popupContainer.destroy(); 
                    // Destroy the popup when the close button is clicked 
                    scrollContainer.destroy(); 
                    // Destroy the scroll container when the popup is closed
                    }); 
                    popupContainer.add(closeButton); 
                    // 5. Create a mask to define the visible area for scrolling 
                    const maskShape = this.scene.make.graphics().fillRect( 
                        0, // Adjust X position to center 
                        gameConfig.scale.height/2 - 300, // Adjust Y position 
                        gameConfig.scale.width - 100, // Full width minus some padding 
                        800 // Desired height of the scrollable area 
                    ); 
                    const mask = maskShape.createGeometryMask(); 
                    // 6. Add the scrollable container to the popup container 
                    const scrollContainer = this.scene.add.container(
                        0, // Adjust X position to align with the mask
                        gameConfig.scale.height / 2 - 300 // Adjust Y position
                    );
                    scrollContainer.setMask(mask); // Apply the mask to the scroll container 
                    popupContainer.add(scrollContainer); 
                    console.log("initData", initData.UIData.symbols);
                    
                    // 7. Add the content that will be scrolled 
                    const contentHeight = 2000; // Example content height, adjust as needed 
                    const content = this.scene.add.image( gameConfig.scale.width / 2, 100, 'minorSymbolsHeading' ).setOrigin(0.5).setDepth(2); 
                    const minSymbol1 = this.scene.add.image(350, 350, "slots0_0").setDepth(2).setScale(0.5) 
                    const minSymbol2 = this.scene.add.image(850, 350, "slots1_0").setDepth(2).setScale(0.5) 
                    const minSymbol3 = this.scene.add.image(1350, 350, "slots2_0").setDepth(2).setScale(0.5) 
                    const minSymbol1Text = this.scene.add.text(450, 300, `5X - ${initData.UIData.symbols[0]} \n4X - 15 \n3X - 5`, TextStyle ) 
                    const minSymbol2Text = this.scene.add.text(950, 300, '5X - 70 \n4X - 25 \n3X - 8', TextStyle ) 
                    const minSymbol3Text = this.scene.add.text(1450, 300, '5X - 100 \n4X - 50 \n3X - 10', TextStyle ) 
                    const minSymbol4 = this.scene.add.image(650, 550, "slots3_0").setDepth(2).setScale(0.5) 
                    const minSymbol5 = this.scene.add.image(1050, 550, "slots4_0").setDepth(2).setScale(0.5) 
                    const minSymbol4Text = this.scene.add.text(750, 500, '5X - 125 \n4X - 75 \n3X - 12', TextStyle ) 
                    const minSymbol5Text = this.scene.add.text(1150, 500, '5X - 250 \n4X - 100 \n3X - 15', TextStyle ) 
                     
                    const majorSymbol1 = this.scene.add.image(650, 1100, "slots5_0").setDepth(2).setScale(0.5) 
                    const majorSymbol1Text = this.scene.add.text(750, 1050, '5X - 70 \n4X - 25 \n3X - 8', TextStyle ) 
                    const majorSymbol2 = this.scene.add.image(1050, 1100, "slots8_0").setDepth(2).setScale(0.5) 
                    const majorSymbol2Text = this.scene.add.text(1150, 1050, '5X - 100 \n4X - 50 \n3X - 10', TextStyle ) 
                    const majorSymbol3 = this.scene.add.image(650, 1300, "slots7_0").setDepth(2).setScale(0.5) 
                    const majorSymbol3Text = this.scene.add.text(750, 1250, '5X - 70 \n4X - 25 \n3X - 8', TextStyle ) 
                    const majorSymbol4 = this.scene.add.image(1050, 1300, "slots6_0").setDepth(2).setScale(0.5) 
                    const majorSymbol4Text = this.scene.add.text(1150, 1250, '5X - 70 \n4X - 25 \n3X - 8', TextStyle )
                   
                    const specialSymBol1 = this.scene.add.image(200, 1750, "slots10_0").setDepth(2).setOrigin(0.5)
                    const specialSymBol1Text = this.scene.add.text(100, 1700, "", TextStyle)
                    const specialSymBol2 = this.scene.add.image(200, 1950, "slots12_0").setDepth(2).setOrigin(0.5)

                    const specialSymBol2Text = this.scene.add.text(100, 1900, "", TextStyle)
                    const MajorSymBolHeading = this.scene.add.image( gameConfig.scale.width / 2, 800, 'majorSymbolHeading' ).setOrigin(0.5).setDepth(2);
                    const specialSymBolHeading = this.scene.add.image(gameConfig.scale.width / 2, 1550, "specialSymBolHeading").setDepth(2).setOrigin(0.5)
                    scrollContainer.add([content,minSymbol1, minSymbol1Text, minSymbol2,minSymbol2Text, 
                        minSymbol3, minSymbol3Text, minSymbol4, minSymbol4Text, minSymbol5, minSymbol5Text, 
                        MajorSymBolHeading, majorSymbol1, majorSymbol1Text, majorSymbol2, majorSymbol2Text, 
                        majorSymbol3, majorSymbol3Text, majorSymbol4, majorSymbol4Text, specialSymBolHeading
                    ]); 
                    // 8. Scrollbar background 
                    const scrollbarBg = this.scene.add.sprite( gameConfig.scale.width - 40, // Positioned on the right side 
                        gameConfig.scale.height / 2, 'scrollBg' ).setOrigin(0.5).setDisplaySize(50, 600); // Adjust height as needed 
                    popupContainer.add(scrollbarBg); 
                    // 9. Roller image for the scrollbar 
                    const roller = this.scene.add.image( gameConfig.scale.width - 40, gameConfig.scale.height / 2 - 200, 'scroller' ).setOrigin(0.5).setInteractive({ draggable: true }); 
                    popupContainer.add(roller); 
                    // 10. Add drag event listener to the roller 
                    this.scene.input.setDraggable(roller); 
                    roller.on('drag', (pointer: any, dragX: number, dragY: number) => {
                        // Keep the roller within the scrollbar bounds
                        const minY = scrollbarBg.getTopCenter().y + roller.height / 2;
                        const maxY = scrollbarBg.getBottomCenter().y - roller.height / 2;
                
                        // Clamp roller position
                        dragY = Phaser.Math.Clamp(dragY, minY, maxY);
                        roller.y = dragY;
                
                        // Calculate the scroll percentage (0 to 1)
                        const scrollPercent = (dragY - minY) / (maxY - minY);
                
                        // Map the scroll percentage to the content's Y position range
                        const contentMaxY = 300; // The top position of content (relative to mask)
                        const contentMinY = -(contentHeight - 600); // The bottom position of content relative to mask
                
                        // Update scroll container's Y position based on scroll percentage
                        scrollContainer.y = Phaser.Math.Interpolation.Linear([contentMaxY, contentMinY], scrollPercent);
                    });
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
        popupBg.setDisplaySize(835, 677); // Set the size for your popup background
        popupBg.setAlpha(1); // Set background transparency
        this.exitBtn.disableInteractive();
        // Add text to the popup
        const popupText = new TextLabel(this.scene, 0, -45, "Do you really want \n to exit?", 50, "#6b768b");
        
        // Yes and No buttons
        const logoutButtonSprite = [
            this.scene.textures.get("normalButton"),
            this.scene.textures.get("normalButton")
        ];
        this.yesBtn = new InteractiveBtn(this.scene, logoutButtonSprite, () => {
            
            this.UiContainer.onSpin(false);
            Globals.Socket?.socket.emit("EXIT", {});
            // window.parent.postMessage("onExit", "*");
            popupContainer.destroy();
            blurGraphic.destroy(); // Destroy blurGraphic when popup is closed
        }, 0, true);
    
        this.noBtn = new InteractiveBtn(this.scene, logoutButtonSprite, () => {
            
            this.UiContainer.onSpin(false);
            this.exitBtn.setInteractive()
            // this.exitBtn.setTexture("normalButton");
            popupContainer.destroy();
            blurGraphic.destroy(); // Destroy blurGraphic when popup is closed
        }, 0, true);
       
        this.yesBtn.setPosition(-130, 80).setScale(0.5, 0.5);
        this.noBtn.setPosition(130, 80).setScale(0.5, 0.5);;
        // Button labels
        const noText = new TextLabel(this.scene, 130, 75, "No", 30, "#ffffff");
        const yesText = new TextLabel(this.scene, -130, 75, "Yes", 30, "#ffffff");
        // Add all elements to popupContainer
        popupContainer.add([popupBg, popupText, this.yesBtn, this.noBtn, yesText, noText]);
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