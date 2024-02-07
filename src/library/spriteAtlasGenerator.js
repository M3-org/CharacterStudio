import * as THREE from "three"
import { getCameraPosition } from "./utils";
const localVector3 = new THREE.Vector3();

export class SpriteAtlasGenerator {
    constructor(characterManager){
        this.characterManager = characterManager;
        this.screenshotManager = characterManager.screenshotManager;
        this.blinkManager = characterManager.blinkManager;
        this.animationManager = this.characterManager.animationManager;
    }

    async createSpriteAtlas(manifestURL){
        
        const manifest = await this._fetchManifest(manifestURL);
        const {

            assetsLocation = "",
            animationsDirectory = "",
            backgroundColor = [1,1,1,1],
            topFrameOffsetPixels = 64,
            bottomFrameOffsetPixels = 64,
            backgroundDescription ="",
            atlasWidth = 512,
            atlasHeight = 512,
            spritesCollection
        } = manifest
        const animBasePath = assetsLocation + animationsDirectory + "/";
        // const normalizedTopOffset = topFrameOffsetPixels/height;
        // const normalizedBottomOffset = bottomFrameOffsetPixels/height;

        this.screenshotManager.setBackground(backgroundColor)
        this.blinkManager.enableScreenshot();

        this.screenshotManager._setBonesOffset(0.2);

        let counter = 0;
        console.log(manifest);
        const scope = this;
        if (Array.isArray(spritesCollection)){
            console.log("e");
            async function processAnimations() {
                if (Array.isArray(spritesCollection)) {
                    for (const spriteInfo of spritesCollection) {
                        const {
                            animationPath,
                            framesNumber,
                            lookAtCamera,
                            expression,
                            cameraPosition,
                            cameraFrame,
                        } = spriteInfo;
                        counter++
                        const saveName = counter.toString().padStart(4, '0');
                        await scope.animationManager.loadAnimation(animBasePath + animationPath, true, 0);
                        const vectorCameraPosition = getCameraPosition(cameraPosition);
                        scope.screenshotManager.setCameraFrameWithName(cameraFrame,vectorCameraPosition);
                        const clipDuration = scope.animationManager.getCurrentClip()?.duration;
                        if (clipDuration){
                            console.log(clipDuration);
                            const timeOffsets = clipDuration/(framesNumber + 1)
                            for (let i =0; i < framesNumber ; i++){

                                scope.animationManager.setTime(i * timeOffsets);
                                scope.screenshotManager.saveScreenshot(saveName, atlasWidth, atlasHeight);
                            }
                        }
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