
import { AnimationManager } from "./animationManager";
import { BlinkManager } from "./blinkManager";
import { CharacterManager } from "./characterManager";
import { ScreenshotManager } from "./screenshotManager";
import { getVectorCameraPosition } from "./utils";
import { ZipManager } from "./zipManager";

export class LoraDataGenerator {

    screenshotManager:ScreenshotManager
    blinkManager:BlinkManager
    animationManager:AnimationManager

    temptime:number
    constructor(public characterManager:CharacterManager,public zipManager?:ZipManager) {
        this.characterManager = characterManager;
        this.screenshotManager = characterManager.screenshotManager;
        this.blinkManager = characterManager.blinkManager;
        this.animationManager = this.characterManager.animationManager;

        this.temptime = 0;
    }

    get vrms(){
        return (Object.values(this.characterManager.avatar).map((vrm)=>vrm.vrm))
    }

    async createLoraData(loraObject:{
      "name": string
      "description"?: string,
      "manifest": string,
      "icon": string
    }, exsitingZipFile:ZipManager|null = null, zipName = ""){
        const manifestURL = loraObject.manifest;
        const loraFolderName = loraObject.name ? "loraData/" + loraObject.name : "loraData";
        const manifest = await this._fetchManifest(manifestURL);
        const {

            assetsLocation = "",
            animationsDirectory = "",
            backgroundGrayscale = 1,
            // @dev unused, commented out for now;
            // topFrameOffsetPixels = 64,
            // bottomFrameOffsetPixels = 64,
            backgroundDescription ="",
            width = 512,
            height = 512,
            dataCollection
        } = manifest
        const animBasePath = assetsLocation + animationsDirectory + "/";
        // @dev unused, commented out for now;
        // const normalizedTopOffset = topFrameOffsetPixels/height;
        // const normalizedBottomOffset = bottomFrameOffsetPixels/height;

        this.screenshotManager.setBackground([backgroundGrayscale,backgroundGrayscale,backgroundGrayscale])
        this.blinkManager.enableScreenshot();

        await this.screenshotManager.cameraFrameManager.calculateBoneOffsets(this.characterManager.characterModel,0.2);

        let counter = 0;
        const scope = this;
        if (Array.isArray(dataCollection)){
            const zip = exsitingZipFile == null ? new ZipManager() : exsitingZipFile;
            const processAnimations = async() =>{
                if (Array.isArray(dataCollection)) {
                    for (let i =0; i < dataCollection.length;i++){
                        const {
                            animationPath,
                            animationTime = 0,
                            animationFrame,
                            // @dev unused, commented out for now;
                            // lookAtCamera,
                            // expression,
                            cameraPosition,
                            cameraFrame,
                            description
                        } = dataCollection[i];
                        counter++
                        const saveName = counter.toString().padStart(4, '0');
                        const finalAnimationTime = animationFrame ? animationFrame/30 : animationTime
                        await scope.animationManager.loadAnimation(animBasePath + animationPath, true, finalAnimationTime);
                        this.vrms.forEach((vrm)=>{
                            vrm.springBoneManager?.reset()
                        })
                        const vectorCameraPosition = getVectorCameraPosition(cameraPosition);
                        scope.screenshotManager.cameraFrameManager.setCameraFrameWithName(cameraFrame,vectorCameraPosition);

                        const imgData = scope.screenshotManager.getImageData(width, height, null);
                        // add lora data folder?
                        zip.addData(imgData,saveName, "png", loraFolderName);
                        zip.addData("anata" + " " + description + " " + backgroundDescription,saveName, "txt", loraFolderName)
                    }
                }
            }

            // Call the function to start processing animations
            await processAnimations();

            // save only if no zipcontainer was provided
            if (exsitingZipFile == null){
                if (zipName == "")
                    zipName = "lora_zip"; 
                zip.saveZip(zipName);
            }
        }

        this.blinkManager.disableScreenshot();
    }

    async _fetchManifest(location:string) {
        const response = await fetch(location)
        const data = await response.json()
        return data
    }

    
}