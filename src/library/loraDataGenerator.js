import * as THREE from "three"
const localVector3 = new THREE.Vector3();

export class LoraDataGenerator {
    constructor(characterManager, loraManifestLocation){
        this.characterManager = characterManager;
        this.screenshotManager = characterManager.screenshotManager;
        this.blinkManager = characterManager.blinkManager;
        this.animationManager = this.characterManager.animationManager;

        console.log(loraManifestLocation);
        this._fetchManifest(loraManifestLocation);

        console.log(this.characterManager);
        console.log(this.screenshotManager);

        this.temptime = 0;
    }


    async _fetchManifest(location) {
        const response = await fetch(location)
        const data = await response.json()
        console.log(data);
        return data
    }

    _poseCharacter(url){
        this.animationManager.loadAnimation(url);
    }
    testPause(){
        console.log("pause")
        this.animationManager.isPaused() ? this.animationManager.play() : this.animationManager.pause();
    }
    testTime(){
        this.animationManager.setTime(this.temptime);
        this.temptime += 0.25;
    }
    setOffsets(){
        console.log("set offsets")
        this.screenshotManager._getBonesOffset(0.2);
    }

    cowboy(){
        this.screenshotManager.frameCowboyShot();
    }
    full(){
        this.screenshotManager.frameFullShot();
    }
    close(){
        this.screenshotManager.frameCloseupShot();
    }
    medium(){
        this.screenshotManager.frameMediumShot();
    }

    testScreenshot(name){
        // this.screenshotManager.setupCamera(cameraPosition, lookAtPosition, fieldOfView = 30);
        this.screenshotManager.setBackground([0,0,0])
        this.blinkManager.enableScreenshot();
        
        

        this.screenshotManager.saveScreenshot(name, 512,512);
        //this.screenshotManager._getMinMaxOffsetByBone(this.characterManager.characterModel,"head", 0.6);

        this.blinkManager.disableScreenshot();
        console.log("take screenshot");
    }


}