
import { getVectorCameraPosition } from "./utils";
import { CharacterManager } from "./characterManager";
import { AnimationManager } from "./animationManager";
import { ScreenshotManager } from "./screenshotManager";
import { BlinkManager } from "./blinkManager";
import { ZipManager } from "./zipManager";

export class SpriteAtlasGenerator {

    characterManager:CharacterManager;
    screenshotManager:ScreenshotManager;
    blinkManager:BlinkManager;
    animationManager:AnimationManager;

    constructor(characterManager:CharacterManager){
        this.characterManager = characterManager;
        this.screenshotManager = characterManager.screenshotManager;
        this.blinkManager = characterManager.blinkManager;
        this.animationManager = this.characterManager.animationManager;
    }

    async createSpriteAtlas(manifestURL:string, exsitingZipFile:ZipManager|null = null, zipName = ""){
        const spriteFolderName = "spriteData";
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
        const delay = (ms:number) => new Promise(res => setTimeout(res, ms));
        
        this.screenshotManager.cameraFrameManager.setBottomFrameOffset(bottomFrameOffset);
        this.screenshotManager.cameraFrameManager.setTopFrameOffset(topFrameOffset);
        this.screenshotManager.setBackground(backgroundColor)
        this.blinkManager.enableScreenshot();
        await this.screenshotManager.cameraFrameManager.calculateBoneOffsets(this.characterManager.characterModel,0.2);

        let counter = 0;

        const scope = this;
        
        if (Array.isArray(spritesCollection)){
            const zip = exsitingZipFile == null ? new ZipManager() : exsitingZipFile;
            async function processAnimations() {
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
                    // const saveName = animationName ? animationName : counter.toString().padStart(2, '0');
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
        setTimeout(()=>{
            this.animationManager.loadAnimation(this.animationManager.animationPaths[this.animationManager.curLoadAnim])
        },1000)
    }

    async _fetchManifest(location:string) {
        const response = await fetch(location)
        const data = await response.json()
        return data
    }

}