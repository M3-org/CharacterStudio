import * as THREE from "three"
import { getVectorCameraPosition } from "./utils";
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
            screenshotOffset,
            topFrameOffset = 0.1,
            bottomFrameOffset = 0.1,
            pixelStyleSize, 
            atlasWidth = 512,
            atlasHeight = 512,
            spritesCollection
        } = manifest
        const animBasePath = assetsLocation + animationsDirectory + "/";
        // const normalizedTopOffset = topFrameOffsetPixels/height;
        // const normalizedBottomOffset = bottomFrameOffsetPixels/height;
        const delay = ms => new Promise(res => setTimeout(res, ms));
        
        this.screenshotManager.setBottomFrameOffset(bottomFrameOffset);
        this.screenshotManager.setTopFrameOffset(topFrameOffset);
        this.screenshotManager.setBackground(backgroundColor)
        this.blinkManager.enableScreenshot();
        await this.screenshotManager._calculateBoneOffsets(0.2);

        let counter = 0;
        console.log(manifest);
        const scope = this;
        
        if (Array.isArray(spritesCollection)){
            console.log("e");
            async function processAnimations() {
                if (Array.isArray(spritesCollection)) {
                    for (const spriteInfo of spritesCollection) {
                        const {
                            animationName,
                            animationPath,
                            framesNumber,
                            lookAtCamera,
                            expression,
                            cameraPosition,
                            cameraFrame,
                        } = spriteInfo;
                        counter++
                        const saveName = animationName ? animationName : counter.toString().padStart(2, '0');
                        await scope.animationManager.loadAnimation(animBasePath + animationPath, true, 0);
                        const vectorCameraPosition = getVectorCameraPosition(cameraPosition);
                        scope.screenshotManager.setCameraFrameWithName(cameraFrame,vectorCameraPosition);
                        const clipDuration = scope.animationManager.getCurrentClipDuration();

                        const timeOffsets = clipDuration/framesNumber
                        for (let i =0; i < framesNumber ; i++){
                            
                            scope.animationManager.setTime(i * timeOffsets);
                            // delay required as its saving images too fast
                            await delay(100);
                            pixelStyleSize ?
                                scope.screenshotManager.savePixelScreenshot(saveName + "_" +i.toString().padStart(2, '0'), atlasWidth, atlasHeight,pixelStyleSize):
                                scope.screenshotManager.saveScreenshot(saveName + "_" +i.toString().padStart(2, '0'), atlasWidth, atlasHeight);
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