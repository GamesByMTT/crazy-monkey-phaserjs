import Phaser, { GameObjects, Scene } from "phaser";
import SoundManager from "../SoundManager";
import { currentGameData, Globals, initData } from "../Globals";
import { gameConfig } from "../appconfig";

export class InfoPopup extends GameObjects.Container {
    SoundManager!: SoundManager
    pageviewContainer!: Phaser.GameObjects.Container;
    popupBackground!: Phaser.GameObjects.Sprite
    Symbol1!: Phaser.GameObjects.Sprite
    leftArrow!: Phaser.GameObjects.Sprite
    rightArrow!: Phaser.GameObjects.Sprite
    infoCross!: Phaser.GameObjects.Sprite
    currentPageIndex: number = 0;
    pages: Phaser.GameObjects.Container[] = [];
    constructor(scene: Scene, data: any) {
        super(scene);
        // this.SceneBg = new Phaser.GameObjects.Sprite(this.scene, width / 2, height / 2, 'Background')
        //     .setDisplaySize(width, height)
        //     .setDepth(11)
        //     .setInteractive();
        // this.SceneBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        //     pointer.event.stopPropagation();
        // })

        this.popupBackground = new Phaser.GameObjects.Sprite(this.scene, gameConfig.scale.width / 2, gameConfig.scale.height / 2, "PopupBackground").setScale(0.27);
        this.leftArrow = new Phaser.GameObjects.Sprite(this.scene, 300, gameConfig.scale.height / 2, "leftArrow").setInteractive();
        this.rightArrow = new Phaser.GameObjects.Sprite(this.scene, 1600, gameConfig.scale.height / 2, "rightArrow").setInteractive();
        this.infoCross = new Phaser.GameObjects.Sprite(this.scene, 1600, gameConfig.scale.height / 2 - 400, "infoCross").setInteractive().setScale(0.2)
        this.infoCross.on('pointerdown', () => {
            this.scene.events.emit("closePopup")
        });
        this.leftArrow.on('pointerdown', () => {
            console.log("left arrow clicked");
            this.goToPreviousPage();

        })
        this.rightArrow.on('pointerdown', () => {
            console.log("rightArrow arrow clicked");
            this.goToNextPage()

        })
        this.add([this.popupBackground, this.leftArrow, this.rightArrow, this.infoCross])
        this.pages = []
        this.createPages()
    }
    createPages() {
        // Create pages and add content
        this.pages[1] = this.scene.add.container(0, 0);
        const symbol1 = this.scene.add.sprite(450, 300, "inofIcon1").setScale(0.22)
        const symbol2 = this.scene.add.sprite(750, 300, "inofIcon2").setScale(0.22)
        const symbol3 = this.scene.add.sprite(1050, 300, "inofIcon3").setScale(0.22)
        const symbol4 = this.scene.add.sprite(1350, 300, "inofIcon4").setScale(0.22)
        const symbol5 = this.scene.add.sprite(450, 500, "inofIcon5").setScale(0.22)
        const symbol6 = this.scene.add.sprite(750, 500, "inofIcon6").setScale(0.22)
        const symbol7 = this.scene.add.sprite(1050, 500, "inofIcon7").setScale(0.22)
        const symbol8 = this.scene.add.sprite(1350, 500, "inofIcon8").setScale(0.22)
        console.log(initData.UIData.symbols[0], "initData.UIData.symbols[0]");
        const infoIcons = [
            { x: 540, y: 220 }, // Position for infoIcon2
            { x: 840, y: 220 }, // Position for infoIcon3
            { x: 1140, y: 220 }, //
            { x: 1440, y: 220 }, //
            { x: 540, y: 420 }, //
            { x: 840, y: 420 }, //
            { x: 1140, y: 420 }, //
            { x: 1440, y: 420 }, //
        ]

        initData.UIData.symbols.forEach((symbol, symbolIndex) => {
            // Get the corresponding infoIcon position
            const iconPosition = infoIcons[symbolIndex];

            if (!iconPosition) return; // Avoid undefined positions

            // Loop through each multiplier in the current symbol

            symbol.multiplier.forEach((multiplierValueArray, multiplierIndex, array) => {
                if (Array.isArray(multiplierValueArray)) {
                    const multiplierValue = multiplierValueArray[0];
                    if (multiplierValue > 0) {  // Skip the loop iteration if multiplierValue is 0
                        // Determine the text (e.g., '5x', '4x', '2x')
                        const prefix = [5, 4, 3][multiplierIndex]; // Customize this if needed
                        // console.log(multiplierValue, "multiplierValue");
                        let text = `X - ${multiplierValue}X \n`;
                        // Create the text object
                        const textObject = this.scene.add.text(
                            iconPosition.x, // X position (you might want to offset this)
                            iconPosition.y + multiplierIndex * 60, // Y position (spacing between lines)
                            text,
                            { fontFamily: "Poplar", fontSize: '45px', color: '#fff' } // Customize text style
                        );
                        this.pages[1].add(textObject);
                    }
                }
            });
        });
        this.pages[1].add([symbol1, symbol2, symbol3, symbol4, symbol5, symbol6, symbol7, symbol8]);
        this.add(this.pages[1]);

        this.pages[2] = this.scene.add.container(this.scene.scale.width, 0);  // Position off-screen initially
        const bonusSymbol = this.scene.add.sprite(200, 300, 'slots8_0')
        const bonusPageHeading = this.scene.add.text(gameConfig.scale.width * 2, gameConfig.scale.height * 0.5, "Hey this is testing purpose and i am checking that this text is going to be appear or not in second page! let me check it first").setOrigin(0.5)
        this.pages[2].add([bonusSymbol, bonusPageHeading]);
        this.add(this.pages[2]);

        this.pages[3] = this.scene.add.container(this.scene.scale.width * 2, 0);  // Position off-screen initially
        this.pages[3].add(this.scene.add.sprite(200, 300, 'Page3Sprite'));
        this.add(this.pages[3]);

        this.pages = [this.pages[1], this.pages[2], this.pages[3]];
        this.currentPageIndex = 0;
    }

    goToNextPage() {
        if (this.currentPageIndex < this.pages.length - 1) {
            const currentPage = this.pages[this.currentPageIndex];
            const nextPage = this.pages[this.currentPageIndex + 1];
            currentPage.setVisible(false);
            // Animate current page out (move left)
            // this.scene.tweens.add({
            //     targets: currentPage,
            //     x: -this.scene.scale.width,  // Move off-screen to the left
            //     // duration: 500,
            //     // ease: 'Power2',
            //     onComplete: () => {
            //         currentPage.setVisible(false);
            //     }
            // });
            nextPage.setVisible(true);
            // Animate next page in (move from right)
            // this.scene.tweens.add({
            //     targets: nextPage,
            //     x: 0,  // Move into view
            //     duration: 500,
            //     ease: 'Power2',
            //     onStart: () => {
            //         nextPage.setVisible(true);
            //     }
            // });

            this.currentPageIndex++;
        }
    }

    goToPreviousPage() {
        if (this.currentPageIndex > 0) {
            const currentPage = this.pages[this.currentPageIndex];
            const prevPage = this.pages[this.currentPageIndex - 1];
            currentPage.setVisible(false);
            // Animate current page out (move right)
            // this.scene.tweens.add({
            //     targets: currentPage,
            //     x: this.scene.scale.width,  // Move off-screen to the right
            //     duration: 500,
            //     ease: 'Power2',
            //     onComplete: () => {
            //         currentPage.setVisible(false);
            //     }
            // });
            prevPage.setVisible(true);
            // // Animate previous page in (move from left)
            // this.scene.tweens.add({
            //     targets: prevPage,
            //     x: 0,  // Move into view
            //     duration: 500,
            //     ease: 'Power2',
            //     onStart: () => {
            //         prevPage.setVisible(true);
            //     }
            // });

            this.currentPageIndex--;
        }
    }
}