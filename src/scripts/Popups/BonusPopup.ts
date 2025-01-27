import { Scene, GameObjects } from "phaser";
import { Globals, ResultData, initData, currentGameData } from "../Globals";
import SoundManager from "../SoundManager";
import { gameConfig } from "../appconfig";

export class BonusPopup extends Phaser.GameObjects.Container {
    soundManager: SoundManager
    SceneBg!: Phaser.GameObjects.Sprite;
    winBg!: Phaser.GameObjects.Sprite;
    private spriteObjects: Phaser.GameObjects.Sprite[] = [];
    private spriteNames: string[] = [];
    private coconutObjects: Phaser.GameObjects.Sprite[] = [];
    private coconutAnims: string[] = [];
    private bonusResults: string[] = ['20', '40', '30', '50', '0']; // Array of values to show
    private totalWinAmount: number = 0;
    private winamountText!: Phaser.GameObjects.Text;
    constructor(scene: Scene) {
        super(scene)
        this.soundManager = new SoundManager(this.scene)

        this.soundManager.playSound("bonusBg");
        this.SceneBg = new Phaser.GameObjects.Sprite(this.scene, gameConfig.scale.width / 2, gameConfig.scale.height / 2, 'Background')
            .setDisplaySize(gameConfig.scale.width, gameConfig.scale.height)
            .setDepth(11)
            .setInteractive();
        this.SceneBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation();
        })
        this.winBg = new Phaser.GameObjects.Sprite(this.scene, gameConfig.scale.width * 0.9, gameConfig.scale.height / 2.1, "winBg");

        // let winamount = this.add.text(width * 0.895, height / 2, ResultData.gameData.WinAmout.toString(), { font: "40px Arial", color: "#fff" });
        this.winamountText = this.scene.add.text(gameConfig.scale.width * 0.9, gameConfig.scale.height / 2, this.totalWinAmount.toString(), { font: "40px Arial", color: "#fff", align: 'center', }).setOrigin(0.5);
        this.add([this.SceneBg, this.winBg, this.winamountText]);

        // Initialize sprite names and animations
        for (let i = 0; i <= 29; i++) {
            this.spriteNames.push(`Bail${i}`);
        }
        for (let j = 0; j <= 47; j++) {
            this.coconutAnims.push(`coconutAnim${j}`);
        }

        // Define x positions for sprites
        const xPositions: number[] = [500, 750, 1000, 1250, 1500]; // Adjust these values as needed

        // Create coconut sprites and set up interactivity
        xPositions.forEach((xPos: number, index: number) => {
            const coconut = this.scene.add.sprite(xPos, 400, "coconutButton").setInteractive();
            coconut.setDepth(11);
            coconut.setData('value', ResultData.gameData.BonusResult[index]); // Assign the value from the array
            coconut.on('pointerdown', () => this.handleCoconutClick(coconut, xPos, 400)); // Add click handler
            this.coconutObjects.push(coconut);
            const sprite = this.scene.add.sprite(xPos, 400, 'Bail0'); // Start with the first sprite
            this.spriteObjects.push(sprite);
        });

        this.add(this.spriteObjects)
        this.add(this.coconutObjects);
        this.createTweenAnimation();

    }

    private createTweenAnimation(): void {
        this.scene.tweens.addCounter({
            from: 0,
            to: this.spriteNames.length - 1,
            duration: 1500, // Duration for each frame change (adjust as needed)
            repeat: -1, // Loop indefinitely
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                const frameIndex = Math.floor(tween.getValue());
                // Update the texture of each sprite with the corresponding frame
                this.spriteObjects.forEach(sprite => {
                    sprite.setTexture(this.spriteNames[frameIndex]);
                });
            }
        });
    }

    private handleCoconutClick(coconut: Phaser.GameObjects.Sprite, x: number, y: number): void {
        const valueText = coconut.getData('value');
        const value = parseInt(coconut.getData('value'))
        this.totalWinAmount += value;
        // Remove the clicked coconut sprite
        this.winamountText.setText(this.totalWinAmount.toString());
        coconut.destroy();

        const animSprite = this.scene.add.sprite(x, y, this.coconutAnims[0]).setDepth(12); // Start with the first frame

        // Track the last position for the text
        let finalFramePosition = { x, y };
        this.soundManager.playSound("coconutFall");
        // Tween animation to cycle through frames
        this.scene.tweens.addCounter({
            from: 0,
            to: this.coconutAnims.length - 1,
            duration: 1500, // Duration for each frame change (adjust as needed)
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                const frameIndex = Math.floor(tween.getValue());
                animSprite.setTexture(this.coconutAnims[frameIndex]);
                // Update final frame position if needed
                finalFramePosition = { x: animSprite.x, y: animSprite.y };
            },
            onComplete: () => {
                // Display the text at the last frame's position
                let text = this.scene.add.text(finalFramePosition.x, finalFramePosition.y + 380, `+${valueText}`, { font: "50px Arial", color: "#fff" }).setOrigin(0.5)
                if (value === 0) {
                    text.destroy();
                    text = this.scene.add.text(finalFramePosition.x, finalFramePosition.y + 360, "GameOver", { font: "40px Arial", color: "#fff" }).setOrigin(0.5)
                    setTimeout(() => {
                        currentGameData.bonusOpen = false
                        currentGameData.popupOpen = false
                        this.soundManager.pauseSound("bonusBg")
                        this.scene.events.emit('closePopup');
                    }, 2000);
                } else {
                    this.soundManager.playSound("bonuswin");
                }
                this.scene.tweens.add({
                    targets: text,
                    alpha: 0, // Fade out text
                    duration: 1000,
                    delay: 1000, // Wait for the animation to complete
                    onComplete: () => {
                        // if(text == "Game Over")
                        text.destroy(); // Remove the text after animation completes
                    }
                });
                // animSprite.destroy(); // Clean up after animation
            }
        });
    }

}