import Phaser, { Scene } from "phaser";
import { Globals, initData, ResultData } from "./Globals";
import { gameConfig } from "./appconfig";

export default class InfoScene extends Scene{
    pageviewContainer!: Phaser.GameObjects.Container;
    popupBackground!: Phaser.GameObjects.Sprite
    Symbol1!: Phaser.GameObjects.Sprite
    leftArrow!: Phaser.GameObjects.Sprite
    rightArrow!: Phaser.GameObjects.Sprite
    infoCross!: Phaser.GameObjects.Sprite
    currentPageIndex: number = 0;
    pages: Phaser.GameObjects.Container[] = [];
    constructor(){
        super({key: 'InfoScene'})
    }
    create(){
        this.pageviewContainer = this.add.container();
        this.popupBackground = new Phaser.GameObjects.Sprite(this, gameConfig.scale.width/2, gameConfig.scale.height/2, "PopupBackground").setScale(0.27);
        this.pageviewContainer.add(this.popupBackground)
        this.leftArrow = new Phaser.GameObjects.Sprite(this, 300, gameConfig.scale.height/2, "leftArrow");
        this.rightArrow = new Phaser.GameObjects.Sprite(this, 1600, gameConfig.scale.height/2, "rightArrow");
        this.infoCross = new Phaser.GameObjects.Sprite(this, 1600, gameConfig.scale.height/2-400, "infoCross").setInteractive().setScale(0.2)
        this.infoCross.on('pointerdown', ()=>{
            if(Globals.SceneHandler?.getScene("InfoScene")){
                Globals.SceneHandler.removeScene("InfoScene")
            }
        })
        this.pageviewContainer.add([this.leftArrow, this.rightArrow, this.infoCross])
        this.pages = []
        this.createPages()

    }
    createPages() {
        // Create pages and add content
        this.pages[1] = this.add.container(0, 0);
        const symbol1 = this.add.sprite(500, 300, "inofIcon1").setScale(0.22)
        const symbol2 = this.add.sprite(800, 300, "inofIcon2").setScale(0.22)
        const symbol3 = this.add.sprite(1100, 300, "inofIcon3").setScale(0.22)
        const symbol4 = this.add.sprite(1400, 300, "inofIcon4").setScale(0.22)
        const symbol5 = this.add.sprite(500, 500, "inofIcon5").setScale(0.22)
        const symbol6 = this.add.sprite(800, 500, "inofIcon6").setScale(0.22)
        const symbol7 = this.add.sprite(1100, 500, "inofIcon7").setScale(0.22)
        const symbol8 = this.add.sprite(1400, 500, "inofIcon8").setScale(0.22)
        console.log(initData.UIData.symbols[0], "initData.UIData.symbols[0]");
        const infoIcons = [
            { x: 620, y: 300 }, // Position for infoIcon2
            { x: 920, y: 300 }, // Position for infoIcon3
            { x: 1220, y: 300 }, //
            { x: 1520, y: 300 }, //
            { x: 620, y: 500 }, //
            { x: 920, y: 500 }, //
            { x: 1220, y: 500 }, //
            { x: 1520, y: 500 }, //
        ]

         initData.UIData.symbols.forEach((symbol, symbolIndex) => {
            // Get the corresponding infoIcon position
            const iconPosition = infoIcons[symbolIndex];

            if (!iconPosition) return; // Avoid undefined positions

            // Loop through each multiplier in the current symbol
            
            symbol.multiplier.forEach((multiplierValue, multiplierIndex, array) => {
                if (multiplierValue !== 0) {  // Skip the loop iteration if multiplierValue is 0
                    // Determine the text (e.g., '5x', '4x', '2x')
                    const prefix = [5, 4, 2][multiplierIndex]; // Customize this if needed
                    console.log(multiplierValue, "multiplierValue");
                    let text = `${prefix}x ${multiplierValue}`;            
                    // Create the text object
                    const textObject = this.add.text(
                        iconPosition.x, // X position (you might want to offset this)
                        iconPosition.y + multiplierIndex * 20, // Y position (spacing between lines)
                        text,
                        { fontSize: '16px', color: '#fff' } // Customize text style
                    );
                    // Optionally adjust the position further based on requirements
                    textObject.setOrigin(0.5, 0.5); // Center the text if needed
                }
            });
            
            
            
           
        });
        this.pages[1].add([symbol1, symbol2, symbol3, symbol4, symbol5]);
        this.pageviewContainer.add(this.pages[1]);

        this.pages[2] = this.add.container(this.scale.width, 0);  // Position off-screen initially
        this.pages[2].add(this.add.sprite(200, 300, 'Page2Sprite'));
        this.pageviewContainer.add(this.pages[2]);

        this.pages[3] = this.add.container(this.scale.width * 2, 0);  // Position off-screen initially
        this.pages[3].add(this.add.sprite(200, 300, 'Page3Sprite'));
        this.pageviewContainer.add(this.pages[3]);

        this.pages = [this.pages[1], this.pages[2], this.pages[3]];
        this.currentPageIndex = 0;
    }
}