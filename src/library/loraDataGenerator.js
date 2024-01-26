export class LoraDataGenerator {
    constructor(characterManager){
        this.characterManager = characterManager;
        this.screenshotManager = characterManager.screenshotManager;

        console.log(this.characterManager);
        console.log(this.screenshotManager);
    }

    testScreenshot(){
        console.log("take screenshot");
    }
}