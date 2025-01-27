import Phaser from 'phaser';
import { Scene, GameObjects, Types } from 'phaser';
import { Globals, ResultData, currentGameData, initData } from './Globals';
import { TextLabel } from './TextLabel';
import { gameConfig } from './appconfig';
import MainScene from '../view/MainScene';
import SoundManager from './SoundManager';

import { Popupmanager } from './PopupManager';
import { InteractiveBtn } from './IneractiveBtn';
// Define UiContainer as a Phaser Scene class
export class UiContainer extends Phaser.GameObjects.Container {
    SoundManager: SoundManager
    popupManager: Popupmanager
    spinBtn!: Phaser.GameObjects.Sprite;
    maxbetBtn!: Phaser.GameObjects.Sprite;
    autoBetBtn!: Phaser.GameObjects.Sprite;
    doubleButton!: Phaser.GameObjects.Sprite;
    freeSpinBgImg!: Phaser.GameObjects.Sprite
    fireAnimation: Phaser.GameObjects.Sprite[] = [];
    CurrentBetText!: TextLabel;
    currentWiningText!: TextLabel;
    currentBalanceText!: TextLabel;
    // CurrentLineText!: TextLabel;
    freeSpinText!: TextLabel;
    pBtn!: Phaser.GameObjects.Sprite;
    mBtn!: Phaser.GameObjects.Sprite
    public isAutoSpinning: boolean = false; // Flag to track if auto-spin is active
    mainScene!: Phaser.Scene
    fireSprite1!: Phaser.GameObjects.Sprite
    fireSprite2!: Phaser.GameObjects.Sprite
    betButtonDisable!: Phaser.GameObjects.Container
    freeSpinContainer!: Phaser.GameObjects.Container
    spinButtonSound!: Phaser.Sound.BaseSound
    normalButtonSound!: Phaser.Sound.BaseSound
    exitBtn!: Phaser.GameObjects.Sprite
    settingBtn!:Phaser.GameObjects.Sprite
    infoBtn!: Phaser.GameObjects.Sprite
    isSpinning: boolean = false;
    turboSprite!: Phaser.GameObjects.Sprite;
    stopButton!: GameObjects.Sprite
    turboAnimation: Phaser.Types.Animations.AnimationFrame[] = []

    constructor(scene: Scene, spinCallBack: () => void, soundManager: SoundManager) {
        super(scene);
        this.popupManager = new Popupmanager(scene)
        scene.add.existing(this); 
        // Initialize UI elements
        this.isSpinning = false
        this.maxBetInit();
        this.spinBtnInit(spinCallBack);
        this.stopSpinButton()
        this.autoSpinBtnInit(spinCallBack);
        this.lineBtnInit();
        this.doubleButtonInit()
        this.winBtnInit();
        this.balanceBtnInit();
        this.BetBtnInit();
        this.exitButton()
        this.settingBtnInit();
        this.infoButton();
        this.turboButton()
      
        
        this.SoundManager = soundManager;
        this.scene.events.on("updateWin", this.updateData, this)
        this.scene.events.on("stopButtonStateChange", this.hideStopButton, this)
        this.scene.events.on("freeSpin", () => this.freeSpinStart(spinCallBack), this)
    }

    /**
     * @method lineBtnInit Shows the number of lines for example 1 to 20
     */
    lineBtnInit() { 
        const container = this.scene.add.container(0, 0);
        // container.add(lineText);
        this.pBtn = this.createButton('pBtn', gameConfig.scale.width / 2 - this.maxbetBtn.width / 1.3, gameConfig.scale.height - this.maxbetBtn.height * 0.7, () => {
            this.buttonMusic("buttonpressed");
            this.pBtn.setTexture('pBtnH');
            this.pBtn.disableInteractive();
            if (!currentGameData.isMoving) {
                currentGameData.currentBetIndex++;
                if (currentGameData.currentBetIndex >= initData.gameData.Bets.length) {
                    currentGameData.currentBetIndex = 0;
                }
                const betAmount = initData.gameData.Bets[currentGameData.currentBetIndex];
                const updatedBetAmount = betAmount * 20;
                // this.CurrentLineText.updateLabelText(betAmount);
                this.CurrentBetText.updateLabelText(updatedBetAmount.toFixed(3).toString());
            }
            this.scene.time.delayedCall(200, () => {
                this.pBtn.setTexture('pBtn');
                this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            });
        }).setDepth(0);
        container.add(this.pBtn);
    }

    /**
     * @method winBtnInit add sprite and text
     * @description add the sprite/Placeholder and text for winning amount 
     */
    winBtnInit() {
        const winPanel = this.scene.add.sprite(0, 0, 'winPanel');
        winPanel.setOrigin(0.5);
        // winPanel.setScale(0.8, 0.8)
        winPanel.setPosition(gameConfig.scale.width/2, gameConfig.scale.height/2 + (winPanel.width *0.9));
        const currentWining: any = ResultData.playerData.currentWining;
        const yourWin = new TextLabel(this.scene,0, -20, "Your Win", 30, "#ffffff")
        this.currentWiningText = new TextLabel(this.scene, 0, 20, currentWining, 45, "#FFFFFF");
        const winPanelChild = this.scene.add.container(winPanel.x, winPanel.y)
        winPanelChild.add([this.currentWiningText, yourWin]);
        if(currentWining > 0){
            // console.log(currentWining, "currentWining");
            this.scene.tweens.add({
                targets:  this.currentWiningText,
                scaleX: 1.3, 
                scaleY: 1.3, 
                duration: 500, // Duration of the scale effect
                yoyo: true, 
                repeat: -1, 
                ease: 'Sine.easeInOut' // Easing function
            });
        }
    }
    /**
     * @method balanceBtnInit Remaning balance after bet (total)
     * @description added the sprite/placeholder and Text for Total Balance 
     */
    balanceBtnInit() {
        const balancePanel = this.scene.add.sprite(0, 0, 'balancePanel');
        balancePanel.setOrigin(0.5);
        balancePanel.setPosition(gameConfig.scale.width / 3.25, gameConfig.scale.height/8);
        const container = this.scene.add.container(balancePanel.x, balancePanel.y);
        // container.add(balancePanel);
        currentGameData.currentBalance = initData.playerData.Balance;
        this.currentBalanceText = new TextLabel(this.scene, 0, 15, currentGameData.currentBalance.toFixed(2), 27, "#ffffff");
        container.add(this.currentBalanceText);
    }
    /**
     * @method stopSpinButton stop button functionality
     * @description this method draw stop button when spin button is pressed
     */
    stopSpinButton(){
        const container = this.scene.add.container(gameConfig.scale.width / 1.15, gameConfig.scale.height - this.spinBtn.height/1.1)
        this.stopButton = this.scene.add.sprite(0, 0, "stopButton").setInteractive().setScale(0.8).setVisible(false)
        this.stopButton.on("pointerdown", ()=>{
            currentGameData.stopButtonEnabled = !currentGameData.stopButtonEnabled
            this.scene.events.emit("stopImmediately")
        })
        container.add(this.stopButton)
    }
    /**
     * @method spinBtnInit Spin the reel
     * @description this method is used for creating and spin button and on button click the a SPIn emit will be triggered to socket and will deduct the amout according to the bet
     */
    spinBtnInit(spinCallBack: () => void) {
        
        this.spinBtn = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "spinBtn");
       
        this.spinBtn = this.createButton('spinBtn', gameConfig.scale.width / 1.15, gameConfig.scale.height - this.spinBtn.height/1.1, () => {
            // this.spinButtonSound = this.scene.sound.add("spinButton", {loop: false, volume: 0.8})
            if(ResultData.playerData.Balance < initData.gameData.Bets[currentGameData.currentBetIndex]){
                // this.lowBalancePopup();
                return
            }
            this.buttonMusic("spinButton");
            if(currentGameData.isAutoSpin){
                currentGameData.isAutoSpin = !currentGameData.isAutoSpin
                return;
            }
            const balance = parseFloat(this.currentBalanceText.text);
            const balanceendValue = balance - (initData.gameData.Bets[currentGameData.currentBetIndex] * initData.gameData.Lines.length);
            // Create the tween
            this.scene.tweens.add({
                targets: { value: balance },
                value: balanceendValue,
                duration: 500, // Duration in milliseconds
                ease: 'Linear',
                onUpdate: (tween) => {
                    // Update the text during the tween
                    const currentBalance = tween.getValue();
                    this.currentBalanceText.updateLabelText(currentBalance.toFixed(3).toString());
                },
                onComplete: () => {
                    // Ensure final value is exact
                    this.currentBalanceText.updateLabelText(balanceendValue.toFixed(3).toString());
                }
            });
        // tween added to scale transition
            this.scene.tweens.add({
                targets: this.spinBtn,
                duration: 100,
                onComplete: () => {
                    this.startSpining(spinCallBack)
                    // Trigger the spin callback
                    // this.onSpin(true);
                    this.scene.tweens.add({
                        targets: this.spinBtn,
                        duration: 100,
                        onComplete: () => {
                            
                        }
                    });
                }
            });
        });
        this.spinBtn.setScale(0.8)
    }

     

    startSpining(spinCallBack: () => void){
        if(!currentGameData.turboMode){
            this.stopButton.setVisible(true)
        }
        this.isSpinning = true;
        this.onSpin(true)
        Globals.Socket?.sendMessage("SPIN", { 
                currentBet: currentGameData.currentBetIndex, 
                currentLines: initData.gameData.Lines.length, 
                spins: 1 
        });
        spinCallBack();
        // Reset the flag after some time or when spin completes
        setTimeout(() => {
            this.isSpinning = false;
        }, 1200); // Adjust timeout as needed
    }

    /**
     * @method maxBetBtn used to increase the bet amount to maximum
     * @description this method is used to add a spirte button and the button will be used to increase the betamount to maximun example on this we have twenty lines and max bet is 1 so the max bet value will be 1X20 = 20
     */
    maxBetInit() {
        this.maxbetBtn =  new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'maxBetBtn');
        this.maxbetBtn = this.createButton('maxBetBtn', gameConfig.scale.width / 2 + this.maxbetBtn.width * 0.25, gameConfig.scale.height - this.maxbetBtn.height * 0.7 , () => {
            if (this.SoundManager) {
                this.buttonMusic("buttonpressed");
            }
            this.scene.tweens.add({
                targets: this.maxbetBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                onComplete: ()=>{
                    this.maxbetBtn.setTexture("maxBetBtOnPressed")
                    this.maxbetBtn.disableInteractive()
                    currentGameData.currentBetIndex = initData.gameData.Bets[initData.gameData.Bets.length - 1];
                    this.CurrentBetText.updateLabelText((currentGameData.currentBetIndex*20).toString());
                    // this.CurrentLineText.updateLabelText(initData.gameData.Bets[initData.gameData.Bets.length - 1]);
                    this.scene.tweens.add({
                        targets: this.maxbetBtn,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 100,
                        onComplete: ()=>{
                            this.maxbetBtn.setTexture("maxBetBtn");
                            this.maxbetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true })
                        }
                    })
                    
                }
            })
        
        }).setDepth(0);      
    }
    /**
     * @method autoSpinBtnInit 
     * @param spinCallBack 
     * @description crete and auto spin button and on that spin button click it change the sprite and called a recursive function and update the balance accroding to that
     */
    autoSpinBtnInit(spinCallBack: () => void) {
        this.autoBetBtn = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "autoSpin").setScale(0.8);
        const container = this.scene.add.container(this.autoBetBtn.width - this.autoBetBtn.width/4, gameConfig.scale.height - this.spinBtn.height/1.1)
        const autoPlay = [
            this.scene.textures.get("autoSpin"),
            this.scene.textures.get("autoSpin")
        ]
        this.autoBetBtn = new InteractiveBtn(this.scene, autoPlay, ()=>{
            currentGameData.isAutoSpin = !currentGameData.isAutoSpin
            if(!currentGameData.isAutoSpin){
                this.isSpinning = false
                return
            }else{
                this.buttonMusic("buttonpressed")
                this.freeSpinStart(spinCallBack)
            }
        }, 7, true);
        // const autoPlayText = this.scene.add.text(0, 0, "Auto\nPlay",{fontFamily: "Deutsch", fontSize: "28px", color:"#ffffff", align:"center"}).setOrigin(0.5)
        this.autoBetBtn.setScale(0.8)
        container.add([this.autoBetBtn]);
    }

    freeSpinStart(spinCallBack: () => void){
        currentGameData.gambleOpen = false
        currentGameData.popupOpen = false
        currentGameData.bonusOpen = false;
        if(currentGameData.isAutoSpin || ResultData.gameData.freeSpins.count > 0){
            if(ResultData.gameData.freeSpins.count > 0){
                
            }
            this.isSpinning = true;
            this.onSpin(true)
            Globals.Socket?.sendMessage("SPIN", { 
                currentBet: currentGameData.currentBetIndex, 
                currentLines: initData.gameData.Lines.length, 
                spins: 1 
            });
            spinCallBack();
        }
        
            // Reset the flag after some time or when spin completes
        // setTimeout(() => {
        //     this.isSpinning = false;
        // }, 1200); // Adjust timeout as needed
    }

    /**
     * @method BetBtnInit 
     * @description this method is used to create the bet Button which will show the totla bet which is placed and also the plus and minus button to increase and decrese the bet value
     */
    BetBtnInit() {
        const container = this.scene.add.container(gameConfig.scale.width / 1.45, gameConfig.scale.height/8);
        this.betButtonDisable = container    
        const betPanel = this.scene.add.sprite(0, 0, 'BetPanel').setOrigin(0.5).setDepth(4);
        container.add(betPanel);
        this.CurrentBetText = new TextLabel(this.scene, 0, 15, ((initData.gameData.Bets[currentGameData.currentBetIndex]) * 20).toString(), 27, "#FFFFFF").setDepth(6);
        container.add(this.CurrentBetText);
    }

    /**
     * @method freeSpininit 
     * @description this method is used for showing the number of freeSpin value at the top of reels
     */
    freeSpininit(freeSpinNumber: number){
        if(freeSpinNumber == 0){
            if(this.freeSpinBgImg){
                this.freeSpinBgImg.destroy();
                this.freeSpinText.destroy()
                this.freeSpinContainer.destroy();
            }   
        }
        if(freeSpinNumber >= 1){
            // this.freeSpinContainer = this.scene.add.container(gameConfig.scale.width/2, gameConfig.scale.height*0.15);
            // const freeSpinBg = this.scene.add.sprite(this.freeSpinContainer.x, this.freeSpinContainer.y, "").setScale(0.8, 0.5);
            // const freeSpinCount = new TextLabel(this.scene, freeSpinBg.x - 20, freeSpinBg.y - 5, "Free Spin : ", 27, "#ffffff");
            // this.freeSpinText = new TextLabel(this.scene, freeSpinBg.x + 55, freeSpinBg.y - 5, freeSpinNumber.toString(), 27, "#ffffff")
            // this.freeSpinBgImg = freeSpinBg
        }else{
           
        }
    }
  
    createButton(key: string, x: number, y: number, callback: () => void): Phaser.GameObjects.Sprite {
        const button = this.scene.add.sprite(x, y, key).setInteractive({ useHandCursor: true, pixelPerfect: true });
        button.on('pointerdown', callback);
        return button;
    }
   
    doubleButtonInit(){
        const container = this.scene.add.container(gameConfig.scale.width / 2 + this.maxbetBtn.height * 2.9, gameConfig.scale.height - this.maxbetBtn.height * 0.7)
        this.doubleButton = this.scene.add.sprite(0, 0, "doubleButton").disableInteractive()
        this.doubleButton.on("pointerdown", ()=>{
            currentGameData.gambleOpen = true;
            currentGameData.popupOpen = true;
            Globals.Socket?.sendMessage("GambleInit", { id: "GambleInit", GAMBLETYPE: "HIGHCARD" });
            // this.popupManager.showGamblePopup()
            this.popupManager.showGamblePopup({
                onClose: () => {
                    currentGameData.gambleOpen = false;
                    currentGameData.popupOpen = false
                    this.scene.events.emit("bonusStateChanged", false);
                }
            });
        })

        container.add(this.doubleButton)
    }
   

    onSpin(spin: boolean) {
        // Handle spin functionality
        if(this.isAutoSpinning){
            return
        }
        if(spin){
            this.spinBtn.disableInteractive();
            // this.spinBtn.setTexture("spinBtnOnPressed");
            this.spinBtn.setTexture("spinBtn");
            this.autoBetBtn.setTexture("autoSpin")
            // this.autoBetBtn.setTexture("autoSpinOnPressed")
            this.autoBetBtn.disableInteractive();
            this.maxbetBtn.disableInteractive();
            this.pBtn.disableInteractive();
            if(currentGameData.turboMode){
                this.spinBtn.setAlpha(0.5)
            }
            this.autoBetBtn.setAlpha(0.5)
            
        }else{
            this.spinBtn.setTexture("spinBtn");
            this.spinBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.autoBetBtn.setTexture("autoSpin");
            this.autoBetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.maxbetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.spinBtn.setScale(0.8);
            // this.autoBetBtn.setScale(0.8);
            this.spinBtn.setAlpha(1)
            this.autoBetBtn.setAlpha(1)
        }        
    }

    buttonMusic(key: string){
        this.SoundManager.playSound(key)
    }
  

    exitButton(){
        this.exitBtn =  new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'crossButton');
        this.exitBtn = this.createButton('crossButton', gameConfig.scale.width * 0.8, gameConfig.scale.height * 0.14 , () => {
            if (this.SoundManager) {
                this.buttonMusic("buttonpressed");
            }
            this.scene.tweens.add({
                targets: this.exitBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                onComplete: ()=>{
                    this.exitBtn.setTexture("crossButton")
                    this.exitBtn.disableInteractive()
                    this.popupManager.showLogoutPopup()
                    this.scene.tweens.add({
                        targets: this.exitBtn,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 100,
                        onComplete: ()=>{
                            this.exitBtn.setTexture("crossButton");
                            this.exitBtn.setInteractive({ useHandCursor: true, pixelPerfect: true })
                        }
                    })
                    
                }
            })
        
        });
    }

    settingBtnInit(){
        this.settingBtn = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "settingBtn").setOrigin(0.5).setInteractive().setScale(0.45)
        this.settingBtn = this.createButton("settingBtn", gameConfig.scale.width * 0.13, gameConfig.scale.height * 0.65, ()=>{
            if(this.SoundManager){
                this.buttonMusic("buttonpressed")
            }
            this.scene.tweens.add({
                targets: this.settingBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                onComplete: ()=>{
                    this.settingBtn.setTexture("settingBtn")
                    this.settingBtn.disableInteractive()
                    this.popupManager.showSettingPopup()
                    this.scene.tweens.add({
                        targets: this.settingBtn,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 100,
                        onComplete: ()=>{
                            this.settingBtn.setTexture("settingBtn");
                            this.settingBtn.setInteractive({ useHandCursor: true, pixelPerfect: true })
                        }
                    })
                    
                }
            })
        })
    }

    infoButton(){
        this.infoBtn = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "MenuBtn").setOrigin(0.5)
        this.infoBtn = this.createButton("MenuBtn", gameConfig.scale.width * 0.13, gameConfig.scale.height * 0.55, ()=>{
            if(this.SoundManager){
                this.buttonMusic("buttonpressed")
            }
            this.popupManager.showInfoPoup();
        })
    }

    updateData(){
        const startValue = parseFloat(this.currentBalanceText.text);
        const endValue = ResultData.playerData.Balance;
        // Create the tween
        this.scene.tweens.add({
            targets: { value: startValue },
            value: endValue,
            duration: 1000, // Duration in milliseconds
            ease: 'Linear',
            onUpdate: (tween) => {
                // Update the text during the tween
                const currentValue = tween.getValue();
                this.currentBalanceText.updateLabelText(currentValue.toFixed(3).toString());
            },
            onComplete: () => {
                this.currentBalanceText.updateLabelText(endValue.toFixed(3).toString());
                
            }
        });

        //Animation for win Text
        const winStart = parseFloat(this.currentWiningText.text);
        const winendValue = ResultData.playerData.currentWining;
        // Create the tween
        this.scene.tweens.add({
            targets: { value: winStart },
            value: winendValue,
            duration: 500, // Duration in milliseconds
            ease: 'Linear',
            onUpdate: (tween) => {
                // Update the text during the tween
                const currentWinValue = tween.getValue();
                this.currentWiningText.updateLabelText(currentWinValue.toFixed(3).toString());
            },
            onComplete: () => {
                // Ensure final value is exact
                this.currentWiningText.updateLabelText(winendValue.toFixed(3).toString());
                if(winendValue > 0){
                    this.doubleButton.setInteractive()
                    this.scene.tweens.add({
                        targets: this.doubleButton,
                        scaleX: { from: 1, to: 1.2 },  // Start from 1, go to 1.2
                        scaleY: { from: 1, to: 1.2 },  // Start from 1, go to 1.2
                        duration: 500,                  // Half a second for each direction
                        yoyo: true,                     // Makes it go back and forth
                        repeat: -1,                     // Infinite repeat
                        ease: 'Sine.easeInOut'         // Smooth transition
                    });
                }else{
                    if (this.doubleButton) {
                        // Stop all tweens associated with doubleButton
                        this.scene.tweens.killTweensOf(this.doubleButton);
                        this.doubleButton.disableInteractive();               
                    }
                }
                
            }
        });
       
        if (ResultData.gameData.isBonus) {
            currentGameData.bonusOpen = true;
            currentGameData.popupOpen = true
            this.scene.events.emit("bonusStateChanged", true);
        }
    }

     //turbo Button
     turboButton(){
        const container = this.scene.add.container(gameConfig.scale.width * 0.85, gameConfig.scale.height * 0.68)
        this.turboSprite = this.scene.add.sprite(0, 0, "turboAnim0").setOrigin(0.5).setScale(0.5).setInteractive()
       
        this.turboSprite.on("pointerdown", ()=>{
            this.turboSprite.setScale(0.47)
            this.addFrames()
            currentGameData.turboMode = !currentGameData.turboMode
            if(currentGameData.turboMode){
                this.turboSprite.play('turboSpin')
            }else{
                this.turboSprite.stop()
                this.turboAnimation = []
                this.turboSprite.setTexture('turboAnim0')
            }
        })
        this.turboSprite.on("pointerup", ()=>{
            this.turboSprite.setScale(0.5)
        })
        container.add([this.turboSprite])
    }
    addFrames(){
        for(let p = 0; p < 40; p++){
            this.turboAnimation.push({key: `turboAnim${p}`});
        }
        this.scene.anims.create({
            key: 'turboSpin',
            frames: this.turboAnimation,
            frameRate: 40,
            repeat: -1
        })
    }

    hideStopButton(){
        setTimeout(() => {
            this.stopButton.setVisible(false)
        }, 500);
    }
}
