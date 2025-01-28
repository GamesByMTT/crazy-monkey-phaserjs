import Phaser, { Scene } from "phaser";
import { currentGameData, ResultData, gambleData, gambleResult, Globals } from "../Globals";
import SoundManager from "../SoundManager";
import { gameConfig } from "../appconfig";

export class GamblePopup extends Phaser.GameObjects.Container {
    SoundManager!: SoundManager;
    SceneBg!: Phaser.GameObjects.Sprite;
    backCards!: Phaser.GameObjects.Sprite[]; // Array to hold all back cards
    DealerCard!: Phaser.GameObjects.Sprite;
    doubleButton!: Phaser.GameObjects.Sprite;
    collecButton!: Phaser.GameObjects.Sprite;
    winBg!: Phaser.GameObjects.Sprite;
    currentWinningText!: Phaser.GameObjects.Text; // Text to display current winning
    isGambleResultRequested: boolean = false; // Flag to ensure the message is sent only once
    doubleButtonText!: Phaser.GameObjects.Text
    collectButtonText!: Phaser.GameObjects.Text
    noteBg!: Phaser.GameObjects.Sprite
    constructor(scene: Scene, data: any) {
        super(scene);
        this.backCards = []; // Initialize the back cards array
        this.SoundManager = new SoundManager(this.scene)
        this.SceneBg = new Phaser.GameObjects.Sprite(this.scene, gameConfig.scale.width / 2, gameConfig.scale.height / 2, 'Background')
            .setDisplaySize(gameConfig.scale.width, gameConfig.scale.height)
            .setDepth(11)
            .setInteractive();

        this.SceneBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation();
        });

        this.winBg = new Phaser.GameObjects.Sprite(this.scene, gameConfig.scale.width / 2, gameConfig.scale.height / 1.2, "winPanel");
        this.DealerCard = new Phaser.GameObjects.Sprite(this.scene, gameConfig.scale.width * 0.15, gameConfig.scale.height / 2, "BackCard1");
        this.noteBg = new Phaser.GameObjects.Sprite(this.scene, gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.2, "noteBox").setDisplaySize(500, 190) .setOrigin(0.5)
        const noteText = this.scene.add.text(gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.2, "PICK ONE OF THE THREE CARDS TO \nCHALLENGE DEALER", {fontFamily: "Poplar", color: "#FFFFFF", fontSize: 35, align:"center"}).setOrigin(0.5)
        const dealerText = this.scene.add.text(gameConfig.scale.width * 0.15, gameConfig.scale.height * 0.75, "DEALER", {fontFamily: "Poplar", color: "#ffff00", fontSize: 60}).setOrigin(0.5)

        // Create back cards and add them to the array
        this.backCards.push(
            this.createBackCard(gameConfig.scale.width / 2.6, gameConfig.scale.height / 2, "BackCard1", 0),
            this.createBackCard(gameConfig.scale.width / 1.8, gameConfig.scale.height / 2, "BackCard2", 1),
            this.createBackCard(gameConfig.scale.width / 1.4, gameConfig.scale.height / 2, "BackCard3", 2)
        );
        // Initialize currentWinningText with initial value
        this.currentWinningText = this.scene.add.text(
            this.winBg.x, this.winBg.y + 25, // Position over winBg
            `${ResultData.playerData.currentWining}`, // Initial text
            { fontSize: 50, color: '#ffff00', fontFamily: "Poplar" } // Styling
        ).setOrigin(0.5); // Center the text
        this.add([
            this.SceneBg, this.winBg, this.DealerCard,
            ...this.backCards,
            this.currentWinningText, this.noteBg, noteText, dealerText // Add the text to the container
        ]);
    }

    createBackCard(x: number, y: number, texture: string, index: number): Phaser.GameObjects.Sprite {
        const backCard = new Phaser.GameObjects.Sprite(this.scene, x, y, texture)
            .setScale(0.8)
            .setInteractive();
        backCard.on('pointerdown', () => {
            if (!this.isGambleResultRequested) { // Check if the message has already been sent
                this.isGambleResultRequested = true; // Set the flag to true
                Globals.Socket?.sendMessage("GambleResultData", { id: "GambleInit", GAMBLETYPE: "HIGHCARD" });
                setTimeout(() => {
                    if(this.doubleButton){
                            this.doubleButton.setVisible(false)
                            this.collecButton.setVisible(false);
                            this.doubleButtonText.destroy()
                            this.collectButtonText.destroy()
                    }
                    
                    this.handleGambleResult(index);

                }, 300);

            }
        });

        return backCard;
    }

    handleGambleResult(clickedIndex: number) {
        if (!gambleResult.gamleResultData.playerWon) {
            this.flipCard(this.DealerCard, gambleData.gambleCards.highCard);
            this.flipCard(this.backCards[clickedIndex], gambleData.gambleCards.lowCard);
            if(this.doubleButton){
                this.doubleButton.setVisible(false)
                this.collecButton.setVisible(false);
                this.doubleButtonText.destroy()
                this.collectButtonText.destroy()
            }
            
            setTimeout(() => {
                currentGameData.pendingFreeSpin = true;
                currentGameData.gambleOpen = false;
                currentGameData.popupOpen = false
                this.scene.events.emit("bonusStateChanged", false);
                Globals.Socket?.sendMessage("GAMBLECOLLECT", { id: "GamleCollect" });
                currentGameData.gambleState = false
                this.scene.events.emit("updateWin")
                this.scene.events.emit('closePopup')
            }, 2000);

        } else {
            // Player won: Show high card on clicked card and ex cards on the others
            this.flipCard(this.backCards[clickedIndex], gambleData.gambleCards.highCard);
            this.flipCard(this.DealerCard, gambleData.gambleCards.lowCard);
            this.doubleButton = new Phaser.GameObjects.Sprite(this.scene, gameConfig.scale.width * 0.9, gameConfig.scale.height / 2.5, "Double").setInteractive();
            this.collecButton = new Phaser.GameObjects.Sprite(this.scene, gameConfig.scale.width * 0.9, gameConfig.scale.height / 1.9, "Double").setInteractive();
            this.doubleButtonText = this.scene.add.text(this.doubleButton.x - 80, this.doubleButton.y - 20, "DOUBLE", { fontSize: '40px', fontFamily: 'Arial', color: "#ffffff" });
            this.collectButtonText = this.scene.add.text(this.collecButton.x - 85, this.collecButton.y - 20, "COLLECT", { fontSize: '40px', fontFamily: 'Arial', color: "#ffffff" })
            this.collecButton.on('pointerdown', () => {
                currentGameData.pendingFreeSpin = true;
                currentGameData.gambleOpen = false;
                currentGameData.popupOpen = false;
                currentGameData.gambleState = false
                this.scene.events.emit("bonusStateChanged", false);
                
                Globals.Socket?.sendMessage("GAMBLECOLLECT", { id: "GamleCollect" });
                this.scene.events.emit("updateWin")
                this.scene.events.emit('closePopup')
            });

            this.doubleButton.on('pointerdown', () => {
                Globals.Socket?.sendMessage("GambleInit", { id: "GambleInit", GAMBLETYPE: "HIGHCARD" });
                this.resetCards();
            });
            this.add([this.doubleButton, this.collecButton, this.doubleButtonText, this.collectButtonText]);
        }
        const otherCards = this.backCards.filter((_, idx) => idx !== clickedIndex);
        this.flipCard(otherCards[0], gambleData.gambleCards.exCards[0]);
        this.flipCard(otherCards[1], gambleData.gambleCards.exCards[1]);
        this.updateCurrentWinningText();
    }

    updateCurrentWinningText() {
        let winAmount = gambleResult.gamleResultData.currentWining
        this.currentWinningText.setText(`${winAmount}`);
    }

    flipCard(card: Phaser.GameObjects.Sprite, newCardData: any) {
        this.SoundManager.playSound("cardMusic")
        this.scene.tweens.add({
            targets: card,
            scaleX: 0, // Flip halfway
            duration: 200,
            onComplete: () => {
                // Change texture when at the halfway point
                card.setTexture(this.getCardTexture(newCardData));

                // Continue the flip
                this.scene.tweens.add({
                    targets: card,
                    scaleX: 0.8, // Back to original scale
                    duration: 200
                });
            }
        });
    }

    getCardTexture(cardData: any) {
        return `${cardData.suit}${cardData.value}`; // Example texture naming
    }

    resetCards() {
        // Logic to reset the cards back to their initial state
        this.backCards.forEach(card => {
            card.setTexture("BackCard1");
            card.setScale(0.8);
        });
        this.DealerCard.setTexture("BackCard1");
        this.isGambleResultRequested = false; // Reset the flag to allow new results
    }
}