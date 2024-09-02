import Phaser, { Scene } from "phaser";
import { Globals, gambleData, gambleResult } from "../scripts/Globals";
import SoundManager from "../scripts/SoundManager";

export default class GambleScene extends Scene {
    public bonusContainer!: Phaser.GameObjects.Container;
    public spinContainer!: Phaser.GameObjects.Container;
    SoundManager!: SoundManager;
    SceneBg!: Phaser.GameObjects.Sprite;
    backCards!: Phaser.GameObjects.Sprite[]; // Array to hold all back cards
    DealerCard!: Phaser.GameObjects.Sprite;
    doubleButton!: Phaser.GameObjects.Sprite;
    collecButton!: Phaser.GameObjects.Sprite;
    winBg!: Phaser.GameObjects.Sprite;
    isGambleResultRequested: boolean = false; // Flag to ensure the message is sent only once

    constructor() {
        super({ key: 'GambleScene' });
        this.backCards = []; // Initialize the back cards array
    }

    create() {
        console.log("gambleData", gambleData);

        const { width, height } = this.cameras.main;
        this.bonusContainer = this.add.container();
        this.SceneBg = new Phaser.GameObjects.Sprite(this, width / 2, height / 2, 'Background')
            .setDisplaySize(width, height)
            .setDepth(11)
            .setInteractive();
        
        this.SceneBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation();
        });

        this.winBg = new Phaser.GameObjects.Sprite(this, width / 2, height / 1.2, "winBg");
        this.DealerCard = new Phaser.GameObjects.Sprite(this, width * 0.15, height / 2, "BackCard1");

        // Create back cards and add them to the array
        this.backCards.push(
            this.createBackCard(width / 2.6, height / 2, "BackCard1", 0),
            this.createBackCard(width / 1.8, height / 2, "BackCard2", 1),
            this.createBackCard(width / 1.4, height / 2, "BackCard3", 2)
        );

        this.doubleButton = new Phaser.GameObjects.Sprite(this, width * 0.9, height / 2.5, "Double").setInteractive();
        this.collecButton = new Phaser.GameObjects.Sprite(this, width * 0.9, height / 2, "collectButton").setInteractive();

        this.collecButton.on('pointerdown', () => {
            console.log("Collect button clicked");
            
            if (Globals.SceneHandler?.getScene("GambleScene")) {
                Globals.SceneHandler.removeScene("GambleScene");
            }
        });

        this.bonusContainer.add([
            this.SceneBg, this.winBg, this.DealerCard, 
            ...this.backCards, this.doubleButton, this.collecButton
        ]);
    }

    createBackCard(x: number, y: number, texture: string, index: number): Phaser.GameObjects.Sprite {
        const backCard = new Phaser.GameObjects.Sprite(this, x, y, texture)
            .setScale(0.8)
            .setInteractive();

        backCard.on('pointerdown', () => {
            if (!this.isGambleResultRequested) { // Check if the message has already been sent
                this.isGambleResultRequested = true; // Set the flag to true
                Globals.Socket?.sendMessage("GambleResultData", { id: "GambleInit", GAMBLETYPE: "HIGHCARD" });
                this.handleGambleResult(index);
            }
        });

        return backCard;
    }

    handleGambleResult(clickedIndex: number) {
        console.log(gambleResult, "gambleResult");
        if(!gambleResult.gamleResultData.playerWon){
            this.flipCard(this.DealerCard, gambleData.gambleCards.highCard);
            this.flipCard(this.backCards[clickedIndex], gambleData.gambleCards.lowCard);
            
        }else{
            // Player won: Show high card on clicked card and ex cards on the others
            this.flipCard(this.backCards[clickedIndex], gambleData.gambleCards.highCard);
            this.flipCard(this.DealerCard, gambleData.gambleCards.lowCard);
        }
        const otherCards = this.backCards.filter((_, idx) => idx !== clickedIndex);
        this.flipCard(otherCards[0], gambleData.gambleCards.exCards[0]);
        this.flipCard(otherCards[1], gambleData.gambleCards.exCards[1]);
    }

    flipCard(card: Phaser.GameObjects.Sprite, newCardData: any) {
        this.tweens.add({
            targets: card,
            scaleX: 0, // Flip halfway
            duration: 200,
            onComplete: () => {
                // Change texture when at the halfway point
                card.setTexture(this.getCardTexture(newCardData));
                
                // Continue the flip
                this.tweens.add({
                    targets: card,
                    scaleX: 0.8, // Back to original scale
                    duration: 200
                });
            }
        });
    }

    getCardTexture(cardData: any) {
        // You should map the card data to the correct texture here
        console.log(`${cardData.suit}${cardData.value}`);
        
        return `${cardData.suit}${cardData.value}`; // Example texture naming
    }
}
