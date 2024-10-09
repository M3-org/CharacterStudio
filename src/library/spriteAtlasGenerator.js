import { getVectorCameraPosition } from "./utils";
import { ZipManager } from "./zipManager";

export class SpriteAtlasGenerator {
    /**
     * @typedef {import('./screenshotManager').ScreenshotManager} ScreenshotManager
     * @type {ScreenshotManager}
     */
    screenshotManager

    constructor(characterManager){
        this.characterManager = characterManager;
        this.screenshotManager = characterManager.screenshotManager;
        this.blinkManager = characterManager.blinkManager;
        this.animationManager = this.characterManager.animationManager;
    }

    async createSpriteAtlas(spriteObject, exsitingZipFile = null, zipName = ""){
        const manifestURL = spriteObject.manifest;
        const spriteFolderName = spriteObject.name ? "spriteData/" + spriteObject.name : "spriteData";
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
        
        this.screenshotManager.cameraFrameManager.setBottomFrameOffset(bottomFrameOffset);
        this.screenshotManager.cameraFrameManager.setTopFrameOffset(topFrameOffset);
        this.screenshotManager.setBackground(backgroundColor)
        this.blinkManager.enableScreenshot();
        await this.screenshotManager.cameraFrameManager.calculateBoneOffsets(this.characterManager.characterModel,0.2);

        let counter = 0;
        const scope = this;
        
        if (Array.isArray(spritesCollection)){
            const zip = exsitingZipFile == null ? new ZipManager() : exsitingZipFile;
            const processAnimations=async ()=> {
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
                        const currentAnimationFolder = spriteFolderName + "/" + (animationName ? animationName : counter.toString().padStart(2, '0'));
                        await scope.animationManager.loadAnimation(animBasePath + animationPath, true, 0);
                        const vectorCameraPosition = getVectorCameraPosition(cameraPosition);
                        scope.screenshotManager.cameraFrameManager.setCameraFrameWithName(cameraFrame,vectorCameraPosition);
                        const clipDuration = scope.animationManager.getCurrentClipDuration();

                        const timeOffsets = clipDuration/framesNumber
                        for (let i =0; i < framesNumber ; i++){
                            
                            scope.animationManager.setTime(i * timeOffsets);
                            // delay required as its saving images too fast
                            // await delay(100);
                            // pixelStyleSize ?
                            //     scope.screenshotManager.savePixelScreenshot(saveName + "_" +i.toString().padStart(2, '0'), atlasWidth, atlasHeight,pixelStyleSize):
                            //     scope.screenshotManager.saveScreenshot(saveName + "_" +i.toString().padStart(2, '0'), atlasWidth, atlasHeight);



                            const imgData = scope.screenshotManager.getImageData(atlasWidth, atlasHeight, pixelStyleSize);
                            // add lora data folder?
                            zip.addData(imgData,i.toString().padStart(2, '0'), "png", currentAnimationFolder);
                        }
                    }
                }
            }
            // Call the function to start processing animations
            await processAnimations();

            // save only if no zipcontainer was provided
            if (exsitingZipFile == null){
                if (zipName == "")
                    zipName = "sprites_zip"; 
                zip.saveZip(zipName);
            }
        }

        this.blinkManager.disableScreenshot();
    }

    async _fetchManifest(location) {
        const response = await fetch(location)
        const data = await response.json()
        return data
    }

}