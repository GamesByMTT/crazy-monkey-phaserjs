import Phaser, {Scene} from "phaser";
import { currentGameData, ResultData, gambleData, gambleResult } from "../Globals";
import SoundManager from "../SoundManager";

export class GamblePopup extends Phaser.GameObjects.Container {
    constructor(scene: Scene, data: any){
        super(scene);
    }
}