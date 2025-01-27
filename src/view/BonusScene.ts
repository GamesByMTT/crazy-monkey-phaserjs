import Phaser, { Scene } from "phaser";
import { currentGameData, Globals, ResultData } from "../scripts/Globals";
import SoundManager from "../scripts/SoundManager";

export default class BonusScene extends Scene {
    public bonusContainer!: Phaser.GameObjects.Container;
    SoundManager!: SoundManager;  // Declare the type
    SceneBg!: Phaser.GameObjects.Sprite;
    winBg!: Phaser.GameObjects.Sprite;
    noteBg!: Phaser.GameObjects.Sprite
    private spriteObjects: Phaser.GameObjects.Sprite[] = [];
    private spriteNames: string[] = [];
    private coconutObjects: Phaser.GameObjects.Sprite[] = [];
    private coconutAnims: string[] = [];
    private bonusResults: string[] = ['20', '40', '30', '50', '0']; // Array of values to show
    private totalWinAmount: number = 0;
    private winamountText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'BonusScene' });
        this.SoundManager = new SoundManager(this); 
    }

    create() {
        
        const { width, height } = this.cameras.main;
        this.bonusContainer = this.add.container();
        this.SoundManager.playSound("bonusBg");
        this.SceneBg = new Phaser.GameObjects.Sprite(this, width / 2, height / 2, 'Background')
            .setDisplaySize(width, height)
            .setDepth(11)
            .setInteractive();
        this.SceneBg.on('pointerdown', (pointer:Phaser.Input.Pointer)=>{
            pointer.event.stopPropagation();
        })
        this.winBg = new Phaser.GameObjects.Sprite(this, width * 0.9, height / 2.1, "winBg");
        this.noteBg = new Phaser.GameObjects.Sprite(this, width * 0.11, height * 0.5, "noteBox").setDisplaySize(350, 230)
        const noteText = this.add.text(this.noteBg.x, this.noteBg.y, `TAP ON THE ROPES TO \nREVEAL YOUR PRIZE UNTILL \nIT'S GAMEOVER`, { fontSize: '28px', color: "#ffffff", align: 'center', fontFamily:"Poplar" }).setOrigin(0.5);
        
        // let winamount = this.add.text(width * 0.895, height / 2, ResultData.gameData.WinAmout.toString(), { font: "40px Arial", color: "#fff" });
        this.winamountText = this.add.text(width * 0.9, height / 2, this.totalWinAmount.toString(), { font: "40px Arial", color: "#fff",  align: 'center',  }).setOrigin(0.5);
        this.bonusContainer.add([this.SceneBg, this.winBg, this.winamountText, this.noteBg, noteText]);

        // Initialize sprite names and animations
        for (let i = 0; i < 30; i++) {
            this.spriteNames.push(`Bail${i}`);
        }
        for (let j = 0; j < 48; j++) {
            this.coconutAnims.push(`coconutAnim${j}`);
        }

        // Define x positions for sprites
        const xPositions: number[] = [500, 750, 1000, 1250, 1500]; // Adjust these values as needed

        // Create coconut sprites and set up interactivity
        xPositions.forEach((xPos: number, index: number) => {
            const sprite = this.add.sprite(xPos, 400, 'Bail0')
                .setInteractive()
                .setDepth(10); // Make sure bail is below coconut
            this.spriteObjects.push(sprite);
            
            const coconut = this.add.sprite(xPos, 400, "coconutButton")
                .setInteractive()
                .setVisible(false)
                .setDepth(11);
                
            coconut.setData('value', ResultData.gameData.BonusResult[index]);
            
            sprite.on('pointerdown', () => {
                this.handleCoconutClick(coconut, xPos, 400, sprite);
            });
            
            this.coconutObjects.push(coconut);
            });

        this.createTweenAnimation();
    }

    private createTweenAnimation(): void {
        this.tweens.addCounter({
            from: 0,
            to: this.spriteNames.length - 1,
            duration: 1500,
            repeat: -1,
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                const frameIndex = Math.floor(tween.getValue());
                // Only update sprites that still exist
                this.spriteObjects.forEach(sprite => {
                    if (sprite && sprite.scene) {  // Check if sprite still exists
                        sprite.setTexture(this.spriteNames[frameIndex]);
                    }
                });
            }
        });
    }

    private handleCoconutClick(coconut: Phaser.GameObjects.Sprite, x: number, y: number, bailSprite: Phaser.GameObjects.Sprite): void {

        const index = this.spriteObjects.indexOf(bailSprite);
        if (index > -1) {
            this.spriteObjects.splice(index, 1);
        }
        // Immediately disable interaction to prevent multiple clicks
        bailSprite.disableInteractive();
        const valueText = coconut.getData('value');
        const value = parseInt(coconut.getData('value'))
        this.totalWinAmount += value;
        this.winamountText.setText(this.totalWinAmount.toString());
        coconut.destroy();
        bailSprite.destroy();
        
        const animSprite = this.add.sprite(x, y, this.coconutAnims[0]).setDepth(12);
        
        let finalFramePosition = { x, y };
        this.SoundManager.playSound("coconutFall");
        
        this.tweens.addCounter({
            from: 0,
            to: this.coconutAnims.length - 1,
            duration: 1500,
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                const frameIndex = Math.floor(tween.getValue());
                animSprite.setTexture(this.coconutAnims[frameIndex]);
                finalFramePosition = { x: animSprite.x, y: animSprite.y };
            },
            onComplete: () => {
                let text = this.add.text(finalFramePosition.x, finalFramePosition.y + 380, `+${valueText}`, 
                    { font: "50px Arial", color: "#fff" }).setOrigin(0.5);
                
                if(value === 0){
                    text.destroy();
                    text = this.add.text(finalFramePosition.x, finalFramePosition.y + 360, "GameOver", 
                        { font: "40px Arial", color: "#fff"}).setOrigin(0.5);
                        
                    setTimeout(() => { 
                        this.SoundManager.pauseSound("bonusBg");
                        currentGameData.bonusOpen = false
                        currentGameData.popupOpen = false
                        const mainScene = this.scene.get("MainScene")
                        console.log("mainscene", mainScene);
                        mainScene.events.emit("bonusStateChanged", false)
                        // this.events.emit("bonusStateChanged", false);
                        Globals.SceneHandler?.removeScene("BonusScene");
                    }, 2000);
                } else {
                    this.SoundManager.playSound("bonuswin");
                }
        
                this.tweens.add({
                    targets: text,
                    alpha: 0,
                    duration: 1000,
                    delay: 1000,
                    onComplete: () => {
                        text.destroy();
                    }
                });
            }
        });
    }
}
