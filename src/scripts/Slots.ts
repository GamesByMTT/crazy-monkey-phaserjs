import Phaser from 'phaser';
import { Globals, ResultData, initData } from "./Globals";
import { gameConfig } from './appconfig';
import { UiContainer } from './UiContainer';
import { Easing, Tween } from "@tweenjs/tween.js"; // If using TWEEN for animations
import SoundManager from './SoundManager';
export class Slots extends Phaser.GameObjects.Container {
    slotMask: Phaser.GameObjects.Graphics;
    SoundManager: SoundManager
    slotSymbols: any[][] = [];
    moveSlots: boolean = false;
    uiContainer!: UiContainer;
    // winingMusic!: Phaser.Sound.BaseSound
    resultCallBack: () => void;
    slotFrame!: Phaser.GameObjects.Sprite;
    private maskWidth: number;
    private maskHeight: number;
    private symbolKeys: string[];
    private symbolWidth: number;
    private symbolHeight: number;
    private spacingX: number;
    private spacingY: number;
    private reelContainers: Phaser.GameObjects.Container[] = [];
    private totalVisibleSymbols: number = 3; // Number of visible symbols on the reel
    constructor(scene: Phaser.Scene, uiContainer: UiContainer, callback: () => void, SoundManager : SoundManager) {
        super(scene);

        this.resultCallBack = callback;
        this.uiContainer = uiContainer;
        this.SoundManager = SoundManager
        this.slotMask = new Phaser.GameObjects.Graphics(scene);
        
        this.maskWidth = gameConfig.scale.width;
        this.maskHeight = 600;
        // this.slotMask.fillStyle(0xffffff, 1);
        this.slotMask.fillRoundedRect(0, 0, this.maskWidth, this.maskHeight, 20);
        // mask Position set
        this.slotMask.setPosition(
            gameConfig.scale.width / 5,
            gameConfig.scale.height / 5.5
        );
        // this.add(this.slotMask);
        // Filter and pick symbol keys based on the criteria
        this.symbolKeys = this.getFilteredSymbolKeys();
        
        // Assume all symbols have the same width and height
        const exampleSymbol = new Phaser.GameObjects.Sprite(scene, 0, 0, this.getRandomSymbolKey());
        this.symbolWidth = exampleSymbol.displayWidth/ 5;
        this.symbolHeight = exampleSymbol.displayHeight/5;
        this.spacingX = this.symbolWidth * 6; // Add some spacing
        this.spacingY = this.symbolHeight * 5.8; // Add some spacing
        // console.log(this.symbolHeight, "symbolHeightsymbolHeightsymbolHeight");
        
        const startPos = {
            x: gameConfig.scale.width /3.45,
            y: gameConfig.scale.height / 3.5    
        };
        const totalSymbol = 7;
        const visibleSymbol = 3;
        const startIndex = 1;
        const initialYOffset = (totalSymbol - startIndex - visibleSymbol) * this.spacingY;
        const totalSymbolsPerReel = 14; 
        for (let i = 0; i < 5; i++) { // 5 columns
            const reelContainer = new Phaser.GameObjects.Container(this.scene);
            this.reelContainers.push(reelContainer); // Store the container for future use
            
            this.slotSymbols[i] = [];
            for (let j = 0; j < totalSymbolsPerReel; j++) { // 3 rows
                let symbolKey = this.getRandomSymbolKey(); // Get a random symbol key
                let slot = new Symbols(scene, symbolKey, { x: i, y: j }, reelContainer);
                slot.symbol.setMask(new Phaser.Display.Masks.GeometryMask(scene, this.slotMask));
                slot.symbol.setPosition(
                    startPos.x + i * this.spacingX,
                    startPos.y + j * this.spacingY 
                );
                slot.symbol.setScale(0.9, 0.9)
                slot.startX = slot.symbol.x;
                slot.startY = slot.symbol.y;
                this.slotSymbols[i].push(slot);
                reelContainer.add(slot.symbol)
            }
            reelContainer.height = this.slotSymbols[i].length * this.spacingY;
            reelContainer.setPosition(reelContainer.x, -initialYOffset);
            this.add(reelContainer); 
        }
    }

    getFilteredSymbolKeys(): string[] {
        // Filter symbols based on the pattern
        const allSprites = Globals.resources;
        const filteredSprites = Object.keys(allSprites).filter(spriteName => {
            const regex = /^slots\d+_\d+$/; // Regex to match "slots<number>_<number>"
            if (regex.test(spriteName)) {
                const [, num1, num2] = spriteName.match(/^slots(\d+)_(\d+)$/) || [];
                const number1 = parseInt(num1, 10);
                const number2 = parseInt(num2, 10);
                // Check if the numbers are within the desired range
                return number1 >= 1 && number1 <= 12 && number2 >= 1 && number2 <= 12;
            }
            return false;
        });

        return filteredSprites;
    }

    getRandomSymbolKey(): string {
        const randomIndex = Phaser.Math.Between(0, this.symbolKeys.length - 1);        
        return this.symbolKeys[randomIndex];
    }

    moveReel() {    
        const initialYOffset = (this.slotSymbols[0][0].totalSymbol - this.slotSymbols[0][0].visibleSymbol - this.slotSymbols[0][0].startIndex) * this.slotSymbols[0][0].spacingY;
        setTimeout(() => {
            for (let i = 0; i < this.reelContainers.length; i++) {
                this.reelContainers[i].setPosition(
                    this.reelContainers[i].x,
                    -initialYOffset // Set the reel's position back to the calculated start position
                );
            }    
        }, 100);
         
        for (let i = 0; i < this.reelContainers.length; i++) {
            for (let j = 0; j < this.reelContainers[i].list.length; j++) {
                setTimeout(() => {
                    this.slotSymbols[i][j].startMoving = true;
                    if (j < 3) this.slotSymbols[i][j].stopAnimation();
                }, 100 * i);
            }
        }
        this.uiContainer.maxbetBtn.disableInteractive();
        this.moveSlots = true;
    }

    update(time: number, delta: number) {
        if (this.slotSymbols && this.moveSlots) {
            for (let i = 0; i < this.reelContainers.length; i++) {
                this.reelContainers[i].y += 3000 * delta / 1000;
                if (this.reelContainers[i].y >= this.maskHeight - this.symbolHeight) {
                     this.reelContainers[i].y -= this.reelContainers[i].height;
                }
            }
        }
    }
    // stopTween() {
    //     // Calculate the maximum delay for stopping the reels
    //     const maxDelay = 200 * (this.reelContainers.length - 1);
    //     // Call resultCallBack after all tweens finish
    //     setTimeout(() => {
    //         this.resultCallBack();
    //         this.moveSlots = false;
    //         ResultData.gameData.symbolsToEmit.forEach((rowArray: any) => {
    //             rowArray.forEach((row: any) => {
    //                 if (typeof row === "string") {
    //                     const [y, x]: number[] = row.split(",").map((value) => parseInt(value));
    //                     const animationId = `symbol_anim_${ResultData.gameData.ResultReel[x][y]}`;
    //                     if (this.slotSymbols[y] && this.slotSymbols[y][x]) {
    //                         this.winMusic("winMusic");
    //                         this.slotSymbols[y][x].playAnimation(animationId);
    //                     }
    //                 }
    //             });
    //         });
    //     }, maxDelay + 200); // Ensure resultCallBack is called after all reels stop
    //     // Iterate over reelContainers and stop them with a delay
    //     for (let i = 0; i < this.slotSymbols.length; i++) {
    //         for (let j = 0; j < this.slotSymbols[i].length; j++) {
    //           setTimeout(() => {
    //                 this.slotSymbols[i][j].endTween();
    //             }, 200 * i);
    //         }
    //     }
    // }
    
   
    
    // winMusic
   
    stopTween() {
        // const maxDelay = 300 * (this.reelContainers.length - 1)

        const reelStopDelay = 100; // Delay between each reel stop
        const stopReel = (reelIndex: number) => {
            const reel = this.reelContainers[reelIndex];
            const reelDelay = reelStopDelay * (reelIndex * 0.6);
            for (let j = 0; j < this.slotSymbols[reelIndex].length; j++) {
                 this.scene.time.delayedCall(150, () => { // Example: 50ms delay
                    this.moveSlots = false;
                });
                // endTween to replace the sprite according to 
                this.slotSymbols[reelIndex][j].endTween();
            }
            // Calculate the target Y position 
            const visibleAreaHeight = 3 * this.spacingY; 
            const numReelHeights = Math.ceil(reel.y / visibleAreaHeight);
            const targetY = -(numReelHeights * visibleAreaHeight); 
            
            this.scene.tweens.add({
                targets: reel,
                delay: reelDelay, // Apply the delay here
                y: {
                    from:targetY - 50,
                    to: targetY ,
                    duration: 500, 
                    ease: 'Bounce.easeOut'
                },
                onComplete: () => {
                    if (reelIndex === this.reelContainers.length - 1) {  
                        this.playWinAnimations();
                    } 
                }
            });   
        };
        for (let i = 0; i < this.reelContainers.length; i++) { 
            stopReel(i);   
        }
    }

    playWinAnimations() {
       
        this.resultCallBack(); // Call the result callback
        ResultData.gameData.symbolsToEmit.forEach((rowArray: any) => {
            rowArray.forEach((row: any) => {
                if (typeof row === "string") {
                    const [y, x]: number[] = row.split(",").map((value) => parseInt(value));
                    const animationId = `symbol_anim_${ResultData.gameData.ResultReel[x][y]}`;
                    if (this.slotSymbols[y] && this.slotSymbols[y][x]) {
                        this.winMusic("winMusic");
                        this.slotSymbols[y][x].playAnimation(animationId);
                    }
                }
            });
        });
    }

    winMusic(key: string){
        this.SoundManager.playSound(key)
    }
    
}

// @Sybols CLass
class Symbols {
    symbol: Phaser.GameObjects.Sprite;
    startY: number = 0;
    startX: number = 0;
    startMoving: boolean = false;
    index: { x: number; y: number };
    totalSymbol : number = 7;
    visibleSymbol: number = 3;
    startIndex: number = 1;
    spacingY : number = 204;
    scene: Phaser.Scene;
    private isMobile: boolean;
    reelContainer: Phaser.GameObjects.Container
    private bouncingTween: Phaser.Tweens.Tween | null = null;

    constructor(scene: Phaser.Scene, symbolKey: string, index: { x: number; y: number }, reelContainer: Phaser.GameObjects.Container) {
        this.scene = scene;
        this.index = index;
        this.reelContainer = reelContainer
        const updatedSymbolKey = this.updateKeyToZero(symbolKey)
        this.symbol = new Phaser.GameObjects.Sprite(scene, 0, 0, updatedSymbolKey);
        this.symbol.setOrigin(0.5, 0.5);
        this.isMobile = scene.sys.game.device.os.android || scene.sys.game.device.os.iOS;
        // Load textures and create animation
        const textures: string[] = [];
        for (let i = 0; i < 8; i++) {
            textures.push(`${symbolKey}`);
        }  
        // console.log(textures, "textures");
              
        this.scene.anims.create({
            key: `${symbolKey}`,
            frames: textures.map((texture) => ({ key: texture })),
            frameRate: 10,
            repeat: -1,
        });        
    }

    // to update the slotx_0 to show the 0 index image at the end
    updateKeyToZero(symbolKey: string): string {
        const match = symbolKey.match(/^slots(\d+)_\d+$/);
        if (match) {
            const xValue = match[1];
            return `slots${xValue}_0`;
        } else {
            return symbolKey; // Return the original key if format is incorrect
        }
    }
    playAnimation(animationId: any) {
        // console.log(animationId, "playanimation");
        
        this.symbol.play(animationId)
    }
    stopAnimation() {
        this.symbol.anims.stop();
        this.symbol.setFrame(0);
    }
    endTween() {
        if (this.index.y < 3) {
            let textureKeys: string[] = [];
            // Retrieve the elementId based on index
            const elementId = ResultData.gameData.ResultReel[this.index.y][this.index.x];
                for (let i = 0; i < 8; i++) {
                    const textureKey = `slots${elementId}_${i}`;
                    // Check if the texture exists in cache
                    if (this.scene.textures.exists(textureKey)) {
                        textureKeys.push(textureKey);                        
                    } 
                }
                // Check if we have texture keys to set
                    if (textureKeys.length > 0) {
                    // Create animation with the collected texture keys
                        this.scene.anims.create({
                            key: `symbol_anim_${elementId}`,
                            frames: textureKeys.map(key => ({ key })),
                            frameRate: 20,
                            repeat: -1
                        });
                    // Set the texture to the first key and start the animation
                        this.symbol.setTexture(textureKeys[0]);           
                    }
        }
        // Stop moving and start tweening the sprite's position
        this.scene.time.delayedCall(10, () => { // Example: 50ms delay
            this.startMoving = false; 
        });
    }
    
   
}