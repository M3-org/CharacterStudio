import * as THREE from "three"
import { getCameraPosition, saveTextFile } from "./utils";
const localVector3 = new THREE.Vector3();

export class LoraDataGenerator {
    constructor(characterManager){
        this.characterManager = characterManager;
        this.screenshotManager = characterManager.screenshotManager;
        this.blinkManager = characterManager.blinkManager;
        this.animationManager = this.characterManager.animationManager;

        console.log(this.characterManager);
        console.log(this.screenshotManager);

        this.temptime = 0;
    }

    async createLoraData(manifestURL, baseText){
        const manifest = await this._fetchManifest(manifestURL);
        const {

            assetsLocation = "",
            animationsDirectory = "",
            backgroundGrayscale = 1,
            topFrameOffsetPixels = 64,
            bottomFrameOffsetPixels = 64,
            backgroundDescription ="",
            width = 512,
            height = 512,
            dataCollection
        } = manifest
        const animBasePath = assetsLocation + animationsDirectory + "/";
        const normalizedTopOffset = topFrameOffsetPixels/height;
        const normalizedBottomOffset = bottomFrameOffsetPixels/height;

        this.screenshotManager.setBackground([backgroundGrayscale,backgroundGrayscale,backgroundGrayscale])
        this.blinkManager.enableScreenshot();

        this.screenshotManager._setBonesOffset(0.2);

        let counter = 0;
        const scope = this;
        if (Array.isArray(dataCollection)){
            async function processAnimations() {
                if (Array.isArray(dataCollection)) {
                    for (const loraInfo of dataCollection) {
                        const {
                            animationPath,
                            animationTime = 0,
                            animationFrame,
                            lookAtCamera,
                            expression,
                            cameraPosition,
                            cameraFrame,
                            description
                        } = loraInfo;
                        counter++
                        const saveName = counter.toString().padStart(4, '0');
                        const finalAnimationTime = animationFrame ? animationFrame/30 : animationTime
                        await scope.animationManager.loadAnimation(animBasePath + animationPath, true, finalAnimationTime);
                        
                        const vectorCameraPosition = getCameraPosition(cameraPosition);
                        scope.screenshotManager.setCameraFrameWithName(cameraFrame,vectorCameraPosition);
            
                        // set camera position
                        scope.screenshotManager.saveScreenshot(saveName, width, height);
                        saveTextFile("anata" + " " + description + " " + backgroundDescription,saveName);
                    }
                }
            }
            
            // Call the function to start processing animations
            await processAnimations();
        }

        this.blinkManager.disableScreenshot();
    }

    async _fetchManifest(location) {
        const response = await fetch(location)
        const data = await response.json()
        return data
    }

    
}