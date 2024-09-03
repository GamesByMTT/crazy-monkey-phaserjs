import Phaser, { Scene } from "phaser";
import { initData, ResultData } from "./Globals";
import { gameConfig } from "./appconfig";

export default class InfoScene extends Scene{
    pageviewContainer!: Phaser.GameObjects.Container;
    popupBackground!: Phaser.GameObjects.Sprite
    Symbol1!: Phaser.GameObjects.Sprite
    leftArrow!: Phaser.GameObjects.Sprite
    rightArrow!: Phaser.GameObjects.Sprite
    currentPageIndex: number = 0;
    pages: Phaser.GameObjects.Container[] = [];
    constructor(){
        super({key: 'InfoScene'})
    }
    create(){
        this.pageviewContainer = this.add.container();
        this.popupBackground = new Phaser.GameObjects.Sprite(this, gameConfig.scale.width/2, gameConfig.scale.height/2, "PopupBackground").setScale(0.3);
        this.pageviewContainer.add(this.popupBackground)
        this.leftArrow = new Phaser.GameObjects.Sprite(this, 200, gameConfig.scale.height/2, "leftArrow").setScale(0.2);
        this.rightArrow = new Phaser.GameObjects.Sprite(this, 1700, gameConfig.scale.height/2, "rightArrow").setScale(0.2);
        this.pageviewContainer.add([this.leftArrow, this.rightArrow])

        this.pages = []
        this.createPages()

    }
    createPages() {
        // Create pages and add content
        this.pages[1] = this.add.container(0, 0);
        const symbol1 = this.add.sprite(200, 300, "info1")
        this.pages[1].add([symbol1]);
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