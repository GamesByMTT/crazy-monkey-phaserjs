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
      
        this.popupBackground = new Phaser.GameObjects.Sprite(this.scene, gameConfig.scale.width / 2, gameConfig.scale.height / 2, "PopupBackground").setScale(0.27);
        this.leftArrow = new Phaser.GameObjects.Sprite(this.scene, 250, gameConfig.scale.height / 2, "leftArrow").setInteractive().setScale(1.6);
        this.rightArrow = new Phaser.GameObjects.Sprite(this.scene, 1670, gameConfig.scale.height / 2, "rightArrow").setInteractive().setScale(1.6);
        this.infoCross = new Phaser.GameObjects.Sprite(this.scene, 1600, gameConfig.scale.height / 2 - 400, "infoCross").setInteractive().setScale(0.2)
        this.infoCross.on('pointerdown', () => {
            this.scene.events.emit("closePopup")
        });
        this.leftArrow.on('pointerdown', () => {
            this.leftArrow.setTexture("leftArrowHover").setScale(1.6)
            this.goToPreviousPage();
        })
        this.leftArrow.on("pointerup", ()=>{
            this.leftArrow.setTexture("leftArrow").setScale(1.6)
        })
        this.rightArrow.on('pointerdown', () => {
            this.rightArrow.setTexture("rightArrowHover").setScale(1.6)
            this.goToNextPage()
        })
        this.rightArrow.on("pointerup", ()=>{
            this.rightArrow.setTexture("rightArrow").setScale(1.6)
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

        //Page 2
        this.pages[2] = this.scene.add.container(0, 0);  // Position off-screen initially
        
        const bonusPageHeading = this.scene.add.text(gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.2, "WINNING ARE CALCULATED BASED ON BET PER LINE \nBET PER LINE = TOTAL BET / NUMBER OF LINES", {fontFamily: "Poplar", fontSize: 60, color: "#ffffff", align:"center", lineSpacing: 2, resolution: 5}).setOrigin(0.5)
        const bonusSymbol = this.scene.add.sprite(gameConfig.scale.width * 0.3, gameConfig.scale.height * 0.35, 'slots8_0').setOrigin(0.5).setScale(0.8)
        const bonusText = this.scene.add.text(gameConfig.scale.width * 0.48, gameConfig.scale.height * 0.35, "Triggers bonus games", {fontFamily: "Poplar", fontSize: 60, color: "#ffffff", align:"center", lineSpacing: 2, resolution: 5}).setOrigin(0.5)
        const wildSymbol = this.scene.add.sprite(gameConfig.scale.width * 0.3, gameConfig.scale.height * 0.5, "slots9_0").setScale(0.8).setOrigin(0.5)
        const wildSymbolText = this.scene.add.text(gameConfig.scale.width * 0.55, gameConfig.scale.height * 0.5, "Substitute for all symbols except bonus", {fontFamily: "Poplar", fontSize: 60, color: "#ffffff", lineSpacing: 2, resolution: 5}).setOrigin(0.5)
        this.pages[2].add([bonusPageHeading, bonusSymbol, bonusText, wildSymbol, wildSymbolText]);
        this.add(this.pages[2]);

        //Page 3
        this.pages[3] = this.scene.add.container(0, 0);  // Position off-screen initially

        const page3Heading = this.scene.add.text(gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.17, "DOUBLE GAME", {fontFamily: "Poplar", fontSize: 80, color: "#ffffff", align:"center", lineSpacing: 2, resolution: 5}).setOrigin(0.5)
        const gambleImage = this.scene.add.sprite(gameConfig.scale.width * 0.28, gameConfig.scale.height * 0.32, "gambleGame").setOrigin(0.5).setScale(0.6)
        const gambleText = this.scene.add.text(gameConfig.scale.width * 0.6, gameConfig.scale.height * 0.32, `THE PLAYER CAN CLICK "DOUBLE" BITTON AFTER A \nWIN TO ACTIVATE THE RISK GAME. THE PLAYER FACES OF \n AGAINST THE DEALER WITH THE TOTAL OF FOUR CARDS`, {fontFamily:"Poplar", fontSize: 40, color: "#ffffff", align:"center", lineSpacing: 2, resolution: 8}).setOrigin(0.5)
        const gambleTextPara = this.scene.add.text(gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.5, "THE PLAYER SELECTS ONE OF THE THREE FACE-DOWN CARDS FIRST. THEN THE DEALER REVEALS \nTHEIR CARD. IF THE PLAYER'S CHOOSEN CARD IS HIGHER IN VALUE THAN THE DEALER'S CARD, \nTHE PLAYER'S WINNINGS ARE DOUBLED. IF NOT, THE RECIVES NOTHING.", {fontFamily: "Poplar", fontSize: 40, color: "#ffffff", lineSpacing: 2, resolution: 8}).setOrigin(0.5)

        this.pages[3].add([page3Heading, gambleImage, gambleText, gambleTextPara]);
        this.add(this.pages[3]);

        //PAGE4
        this.pages[4] = this.scene.add.container(0, 0);  // Position
        const page4Heading = this.scene.add.text(gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.17, "BONUS GAME", {fontFamily: "Poplar", fontSize: 80, align:"center", color: "#ffffff", lineSpacing: 2, resolution: 5}).setOrigin(0.5)
        const bonusImage = this.scene.add.sprite(gameConfig.scale.width * 0.32, gameConfig.scale.height * 0.39, "bonusGame").setOrigin(0.5).setScale(0.6)
        const bonusTextOne = this.scene.add.text(gameConfig.scale.width * 0.67, gameConfig.scale.height * 0.4, `UNLOCK THE COCONUT SURPRISE BONUS \nGAME BY LANDING 5 BONUS ICONS ON THE \nSLOTS REELS. IN THIS GAME, YOU'LL SEE THE FIVE \n SIMILAR HANGING PLANTS ROPES. SELECT \nONE OF THE ROPES TO REVELA YOUR PRIZE. \n A COCONUT WILL DROP AND BREAK OPEN, \nDISPLAYING THE AMOUNT YOU HAVE WON!`, {fontFamily:"Poplar", fontSize: 40, color: "#ffffff", lineSpacing: 2, resolution: 8}).setOrigin(0.5)
        this.pages[4].add([page4Heading, bonusImage, bonusTextOne])
        this.add(this.pages[4])

        this.pages = [this.pages[1], this.pages[2], this.pages[3], this.pages[4]];
        // Hide all pages initially except the first one
        this.pages.forEach((page, index) => {
            page.setVisible(index === 0);
        });

        this.currentPageIndex = 0;
        // this.updateArrowVisibility();
    }

    goToNextPage() {
        if (this.currentPageIndex < this.pages.length - 1) {
            // Hide current page
            this.pages[this.currentPageIndex].setVisible(false);
            
            // Increment index and show next page
            this.currentPageIndex++;
            this.pages[this.currentPageIndex].setVisible(true);
    
            // Update arrow visibility
            // this.updateArrowVisibility();
        }
    }
    
    goToPreviousPage() {
        if (this.currentPageIndex > 0) {
            // Hide current page
            this.pages[this.currentPageIndex].setVisible(false);
            
            // Decrement index and show previous page
            this.currentPageIndex--;
            this.pages[this.currentPageIndex].setVisible(true);
    
            // Update arrow visibility
            // this.updateArrowVisibility();
        }
    }
    updateArrowVisibility() {
        // Show/hide arrows based on current page
        this.leftArrow.setVisible(this.currentPageIndex > 0);
        this.rightArrow.setVisible(this.currentPageIndex < this.pages.length - 1);
    }
}