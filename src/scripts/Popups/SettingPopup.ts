import Phaser, { Scene } from "phaser";
import { currentGameData } from "../Globals";
import SoundManager from "../SoundManager";
import { gameConfig } from "../appconfig";

export class SettingPopup extends Phaser.GameObjects.Container {
    SoundManager: SoundManager
    settingClose!: Phaser.GameObjects.Sprite
    constructor(scene: Scene, data: any) {
        super(scene);
        this.SoundManager = new SoundManager(scene)

        const popupBg = this.scene.add.image(gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.5, 'messagePopup').setDepth(9);
        const settingText = this.scene.add.image(gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.5 -330, 'settingText').setScale(0.6)
        const soundsImage = this.scene.add.image(gameConfig.scale.width * 0.5 - 450, gameConfig.scale.height * 0.5 - 120, 'soundImage').setDepth(10).setScale(0.7);
        const musicImage = this.scene.add.image(gameConfig.scale.width * 0.5 - 450, gameConfig.scale.height * 0.5 + 80, 'musicImage').setDepth(10).setScale(0.7);
        const soundProgreesBar = this.scene.add.image(gameConfig.scale.width * 0.5 + 40, gameConfig.scale.height * 0.5 -100, 'sounProgress')
        const musicProgreesBar = this.scene.add.image(gameConfig.scale.width * 0.5 + 40, gameConfig.scale.height * 0.5 + 100, 'sounProgress')
        const sounPlus = this.scene.add.image(gameConfig.scale.width * 0.5 + 420, gameConfig.scale.height * 0.5 + 40, 'soundPlus').setInteractive()
        const soundMinus = this.scene.add.image(gameConfig.scale.width * 0.5 - 330, gameConfig.scale.height * 0.5 + 40, 'soundMinus').setInteractive()
        const sounPlusOne = this.scene.add.image(gameConfig.scale.width * 0.5 + 420, gameConfig.scale.height * 0.5 - 160, 'soundPlus').setInteractive()
        const soundMinusOne = this.scene.add.image(gameConfig.scale.width * 0.5 -330, gameConfig.scale.height * 0.5 -160, 'soundMinus').setInteractive()

        // New sprite for sound level indicator
        const soundLevelIndicator = this.scene.add.image(gameConfig.scale.width * 0.5 + 40, gameConfig.scale.height * 0.5 - 100, 'indicatorSprite').setDepth(11).setInteractive();
        const musicLevelIndicator = this.scene.add.image(gameConfig.scale.width * 0.5 + 40,  gameConfig.scale.height * 0.5 +100, 'indicatorSprite').setDepth(11).setInteractive();

        // Configure initial positions based on current sound levels
        let soundLevel = 0.5; // Example: start at 50%
        let musicLevel = 0.5; // Example: start at 50%

        // Set initial position of indicators
        soundLevelIndicator.x = soundProgreesBar.x + (soundProgreesBar.width * soundLevel - soundProgreesBar.width / 1.5);
        musicLevelIndicator.x = musicProgreesBar.x + (musicProgreesBar.width * musicLevel - musicProgreesBar.width / 2.5);

        const exitButtonSprites = [
            this.scene.textures.get('crossButton'),
            this.scene.textures.get('crossButtonHover')
        ];
        this.settingClose = this.scene.add.sprite(gameConfig.scale.width * 0.5 + 500, gameConfig.scale.height * 0.5 - 200, exitButtonSprites[0]).setInteractive().setScale(0.8)
        this.settingClose.on("pointerdown", ()=>{
            this.buttonMusic("buttonpressed")
            this.scene.events.emit("closePopup")
        }) 

        popupBg.setOrigin(0.5);
        popupBg.setScale(0.9)
        popupBg.setAlpha(1); // Set background transparency
        this.add([popupBg, settingText, this.settingClose, soundsImage, musicImage, soundProgreesBar, musicProgreesBar, sounPlusOne, soundMinusOne, sounPlus, soundMinus, soundLevelIndicator, musicLevelIndicator]);
        // Add interactivity to plus and minus buttons for sound
        sounPlus.on('pointerdown', () => {
            if (soundLevel < 1) {
                soundLevel += 0.1; // Increase sound level
                this.adjustSoundVolume(soundLevel); // Adjust sound volume function
                musicLevelIndicator.x = musicProgreesBar.x + ((musicProgreesBar.width * soundLevel) - musicProgreesBar.width / 1.5);
            }
        });

        soundMinus.on('pointerdown', () => {
            if (soundLevel > 0) {
                soundLevel -= 0.1; // Decrease sound level
                this.adjustSoundVolume(soundLevel); // Adjust sound volume function
                musicLevelIndicator.x = musicProgreesBar.x + ((musicProgreesBar.width * soundLevel) - musicProgreesBar.width / 2.5);
            }
        });

        // Add interactivity to plus and minus buttons for music
        sounPlusOne.on('pointerdown', () => {
            if (musicLevel < 1) {
                musicLevel += 0.1; // Increase music level
                this.adjustMusicVolume(musicLevel); // Adjust music volume function
                soundLevelIndicator.x = soundProgreesBar.x + (soundProgreesBar.width * musicLevel - soundProgreesBar.width / 1.5);
            }
        });

        soundMinusOne.on('pointerdown', () => {
            if (musicLevel > 0) {
                musicLevel -= 0.1; // Decrease music level
                this.adjustMusicVolume(musicLevel); // Adjust music volume function
                soundLevelIndicator.x = musicProgreesBar.x + (soundProgreesBar.width * musicLevel - soundProgreesBar.width / 2.5);
            }
        });
    }

    // Function to adjust sound volume
    adjustSoundVolume(level: number) {
        let adjustMusicVolume
        adjustMusicVolume = parseFloat(level.toFixed(1))
        adjustMusicVolume = adjustMusicVolume < 0 ? 0 : adjustMusicVolume
        if (adjustMusicVolume < 0) {
            this.SoundManager.setVolume("backgroundMusic", adjustMusicVolume)
        }
    }

    // Function to adjust music volume
    adjustMusicVolume(level: number) {
        let adjustMusicVolume
        adjustMusicVolume = parseFloat(level.toFixed(1))
        adjustMusicVolume = adjustMusicVolume < 0 ? 0 : adjustMusicVolume
        if (adjustMusicVolume < 0) {
            this.SoundManager.setVolume("backgroundMusic", adjustMusicVolume)
        }
    }

    buttonMusic(key: string) {
        this.SoundManager.playSound(key)
    }
}