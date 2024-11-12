// MainLoader.ts

import { Scene, GameObjects } from "phaser";
import MainScene from "./MainScene";
import { LoaderConfig, LoaderSoundConfig } from "../scripts/LoaderConfig";
import { Globals } from "../scripts/Globals";
import SoundManager from "../scripts/SoundManager";
import { Howl } from "howler";
import GambleScene from "./GambleScene";
import WebFont from "webfontloader";

export default class MainLoader extends Scene {
    resources: any;
    private progressBar: GameObjects.Sprite | null = null;
    private progressBox: GameObjects.Sprite | null = null;
    private logoImage: GameObjects.Sprite | null = null;
    private loaderText: GameObjects.Sprite | null = null;
    private maxProgress: number = 0.7; // Cap progress at 70%
    private backgroundMusic: Phaser.Sound.BaseSound | null = null; // Add a variable for background music
    public soundManager: SoundManager; // Add a SoundManager instance

    constructor(config: Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.resources = LoaderConfig;
        this.soundManager = new SoundManager(this); 
    }

    preload() {

        this.load.image("logo", "src/sprites/CrazyMonkeyLogo.png");
        this.load.image("loadingText", "src/sprites/loadingText.png");
        this.load.image('loaderBg', "src/sprites/loaderBg.png")
        this.load.image("assetsloader", "src/sprites/assetsloader.png")
        // Once the background image is loaded, start loading other assets
        this.load.once('complete', () => {
            this.addBackgroundImage();
            this.startLoadingAssets();
        });
        this.setupFontLoader();
    }

    private addBackgroundImage() {
        const { width, height } = this.scale;
        // this.add.image(width / 2, height / 2, 'Background').setOrigin(0.5).setDisplaySize(width, height);
        this.logoImage = this.add.sprite(width/2, 400, 'logo').setScale(0.2, 0.2)
        // Initialize progress bar graphics
        this.loaderText = this.add.sprite(width/2, height/2 + 115, 'loadingText').setScale(0.2)
        this.progressBox = this.add.sprite(width / 2, height / 2 + 180, "loaderBg").setScale(0.2); 
        // Initialize progress bar using assetsLoader.png image
        this.progressBar = this.add.sprite(width / 2, height / 2+175, "assetsloader").setOrigin(0.5).setScale(0.2);
        this.progressBar.setCrop(0, 0, 0, this.progressBar.height); // Start with 0 width
    }

    private startLoadingAssets() {
        // Load all assets from LoaderConfig
        Object.entries(LoaderConfig).forEach(([key, value]) => {
            this.load.image(key, value);
        });
        // Start loading assets and update progress bar
        this.load.start();

        this.load.on('progress', (value: number) => {
            // Limit progress to 70% until socket initialization is done
            const adjustedValue = Math.min(value * this.maxProgress, this.maxProgress);
            this.updateProgressBar(adjustedValue);
        });

        this.load.on('complete', () => {
            if (Globals.Socket?.socketLoaded) {
                this.loadScene();
            }
        });
    }

    private updateProgressBar(value: number) {
        const { width } = this.scale;
        if (this.progressBar) {
            this.progressBar.setCrop(0, 0, this.progressBar.width * value, this.progressBar.height);
        }
    }
    private setupFontLoader() {
        WebFont.load({
            custom: {
                families: ['Poplar'],
                urls: ['src/fonts/PoplarStdBlack.ttf']
            },
            active: () => {
                // Fonts have loaded
            }
        });
    }

    private completeLoading() {
        if (this.progressBox) {
            this.progressBox.destroy();
        }
        if (this.progressBar) {
            this.progressBar.destroy();
        }
        if(this.logoImage){
            this.logoImage.destroy();
        }
        if(this.loaderText){
            this.loaderText.destroy();
        }
        this.updateProgressBar(1); // Set progress to 100%
        const loadedTextures = this.textures.list;
        Globals.resources = { ...loadedTextures }
        Object.entries(LoaderSoundConfig).forEach(([key]) => {
            Globals.soundResources[key] = new Howl({
                src: [LoaderSoundConfig[key]], // Use the same source as you provided for loading
                autoplay: false,
                loop: false,
            });
        });
    }
    public loadScene() {
        this.completeLoading();
            Globals.SceneHandler?.removeScene('Background')
            Globals.SceneHandler?.addScene('MainScene', MainScene, true)
    }
}
