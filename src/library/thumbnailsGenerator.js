
import { getAsArray, getVectorCameraPosition } from "./utils";
import { ZipManager } from "./zipManager";


export class ThumbnailGenerator {
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
    //, exsitingZipFile = null, zipName = ""
    async createThumbnailsWithObjectData(objectData, loadAnimation = true, exsitingZipFile = null, zipName = ""){

        const {

            assetsLocation = "",
            poseAnimation = "",
            animationFrame,
            animationTime,
            backgroundColor = [1,1,1,0],
            screenshotOffset,
            topFrameOffset = 0.1,
            bottomFrameOffset = 0.1,
            thumbnailsWidth = 128,
            thumbnailsHeight = 128,
            
            thumbnailsCollection
        } = objectData
        const animBasePath = assetsLocation + "/";

        let finalAnimationTime = animationFrame || 0;
        if (animationTime != null){
            finalAnimationTime = animationTime * 30;
        }

        if (loadAnimation){
            await this.animationManager.loadAnimation(animBasePath + poseAnimation, true, finalAnimationTime);
        }


        // const normalizedTopOffset = topFrameOffsetPixels/height;
        // const normalizedBottomOffset = bottomFrameOffsetPixels/height;


        this.screenshotManager.cameraFrameManager.setBottomFrameOffset(bottomFrameOffset);
        this.screenshotManager.cameraFrameManager.setTopFrameOffset(topFrameOffset);
        this.screenshotManager.setBackground(backgroundColor)
        this.blinkManager.enableScreenshot();
        await this.screenshotManager.cameraFrameManager.calculateBoneOffsets(this.characterManager.characterModel,0.2);

        const scope = this;
        

        // pose the character
        
        if (Array.isArray(thumbnailsCollection)){

            const zip = exsitingZipFile == null ? new ZipManager() : exsitingZipFile;
            let singleSave = false;
            const processScreenshots = async()=> {
                for (const thumbnailInfo of thumbnailsCollection) {
                    
                    const {
                        traitGroup,
                        cameraPosition = "front",
                        bottomBoneName,
                        bottomBoneMaxVertex = false,
                        topBoneName,
                        topBoneMaxVertex = true,
                        groupTopOffset,
                        groupBotomOffset,
                        cameraFrame,
                        saveOnlyIDs
                    } = thumbnailInfo;



                    if (!bottomBoneName || !topBoneName){
                        if (!cameraFrame){
                            console.warn("missing bonename info or camera frame. Skipping")
                        }
                    }
                    if (!traitGroup){
                        console.warn("missing trait group for thumbnail info. Skipping")
                        continue;
                    }

                    const getSaveOnlyIDs = () => {
                        const resultArray = [];
                        const saveOnlyIDArray = getAsArray (saveOnlyIDs);
                        saveOnlyIDArray.forEach(idValue => {
                            resultArray.push({id:idValue})
                        });
                        return resultArray;
                    }

                    const modelTraits = saveOnlyIDs == null ? 
                        scope.characterManager.getTraits(traitGroup):
                        getSaveOnlyIDs();
                        


                    if (modelTraits == null){
                        console.log("SKipping Thumbnail Generation for trait group " + traitGroup + ", its not present in the character manifest.")
                        continue;
                    }

                    const vectorCameraPosition = getVectorCameraPosition(cameraPosition);
                    if (cameraFrame){
                        scope.screenshotManager.cameraFrameManager.setCameraFrameWithName(cameraFrame, vectorCameraPosition);
                    }
                    else{
                        
                        scope.screenshotManager.cameraFrameManager.frameShot(bottomBoneName, topBoneName, vectorCameraPosition, bottomBoneMaxVertex, topBoneMaxVertex);
                    }

                    //let counter = 0;
                    for (let i=0; i < modelTraits.length;i++){

                        const traitId = modelTraits[i].id;
                        let imgName = traitId;

                        if (modelTraits[i].fullDirectory != null){
                            const fullDir = modelTraits[i].fullDirectory.split('/');
                            const baseName = fullDir[fullDir.length - 1];
                            imgName = baseName.split('.')[0];
                        }
                        await scope.characterManager.loadTrait(traitGroup, traitId,true);

                        if (thumbnailsCollection.length == 1 && modelTraits.length == 1){
                            singleSave = true;
                            scope.screenshotManager.saveScreenshot(imgName,thumbnailsWidth, thumbnailsHeight);
                        }
                        else{
                            const imgData = scope.screenshotManager.getImageData(thumbnailsWidth, thumbnailsHeight);
                            zip.addData(imgData,imgName, "png", traitGroup);
                        }
                   
                        // counter++
                        // if (counter >= 10){
                        //     break;
                        // }
                    }
                    //const saveName = animationName ? animationName : counter.toString().padStart(2, '0');

                }
            }
            
            // Call the function to start processing animations
            await processScreenshots();
            if (exsitingZipFile == null && singleSave == false){
                if (zipName == "")
                    zipName = "thumbnails_zip"; 
                zip.saveZip(zipName);
            }
        }

        this.blinkManager.disableScreenshot();
    }

    async createThumbnails(spriteObject, exsitingZipFile = null, zipName = ""){
        const manifestURL = spriteObject.manifest;
        const manifest = await this._fetchManifest(manifestURL);
        await this.createThumbnailsWithObjectData(manifest, true, exsitingZipFile, zipName);
        
    }

    async _fetchManifest(location) {
        const response = await fetch(location)
        const data = await response.json()
        return data
    }

}