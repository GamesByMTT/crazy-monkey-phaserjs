import Phaser from "phaser";
import { initData } from "./Globals";
import { gameConfig } from "./appconfig";
import { LineGenerator } from "./Lines";

export default class LineSymbols extends Phaser.GameObjects.Container{
    numberArr: Phaser.GameObjects.Container[] = [];
    linesGenerator!: LineGenerator; // Reference to LineGenerator
    numberContainers!: Phaser.GameObjects.Container
    constructor(scene: Phaser.Scene, yOf: number, xOf: number, linesGenerator: LineGenerator) {
        // console.log(xOf, yOf);
        super(scene);
        this.linesGenerator = linesGenerator;
        // Create lines based on initData
        for (let i = 0; i < 9; i++) {
            let numberText = this.createNumber(scene, i);
            this.numberArr.push(numberText);
            this.add(numberText);
        }

        this.setPosition(gameConfig.scale.width / 2, gameConfig.scale.height/2.9);
        // Add this Container to the scene
        scene.add.existing(this);
    }
    createNumber(scene: Phaser.Scene, index: number): Phaser.GameObjects.Container {
        const numberContainer = new Phaser.GameObjects.Container(scene);
        let leftSprite: Phaser.GameObjects.Sprite;
        let rightSprite: Phaser.GameObjects.Sprite;
        
        // let leftSprite, rightSprite;
        let yPosition = (index / 2) * 140 - 520; // Adjusted Y position for both sides
    
        // For left side sprites
        leftSprite = scene.add.sprite(-gameConfig.scale.width / 3.65, yPosition + 380, `left${index}`);
        leftSprite.setInteractive({ useHandCursor: true }).setDepth(5);
        numberContainer.add(leftSprite);
    
        // For right side sprites
        rightSprite = scene.add.sprite(gameConfig.scale.width / 3.65, yPosition + 380, `right${index}`);
        rightSprite.setInteractive({ useHandCursor: true }).setDepth(5);
        numberContainer.add(rightSprite);
    
        // Add hover event listeners for the left sprite
        leftSprite.on("pointerover", () => {
            leftSprite.setTexture(`leftHover${index}`);
            this.showLines(index)
        });
            
        leftSprite.on("pointerout", () => {
            leftSprite.setTexture(`left${index}`);
            this.hideLines()
        });
    
        // Add hover event listeners for the right sprite
        rightSprite.on("pointerover", () => {
            rightSprite.setTexture(`rightHover${index}`)
            this.showLines(index)
        });
        rightSprite.on("pointerout", () => {
            rightSprite.setTexture(`right${index}`)
            this.hideLines()
        });
    
        return numberContainer;
    }
    
    showLines(index: number) {
        // Example: show lines related to the number
        this.linesGenerator.showLines([index]); // Adjust as needed
    }

    hideLines() {
        this.linesGenerator.hideLines();
    }
}