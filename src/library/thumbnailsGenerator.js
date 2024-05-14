import * as THREE from "three"
import { getAsArray, getVectorCameraPosition } from "./utils";
const localVector3 = new THREE.Vector3();

export class ThumbnailGenerator {
    constructor(characterManager){
        this.characterManager = characterManager;
        this.screenshotManager = characterManager.screenshotManager;
        this.blinkManager = characterManager.blinkManager;
        this.animationManager = this.characterManager.animationManager;
    }

    async createThumbnailsWithObjectData(objectData, maxQty = Infinity, loadAnimation = true, loadTrait = true){

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

        const delay = ms => new Promise(res => setTimeout(res, ms));
        
        this.screenshotManager.setBottomFrameOffset(bottomFrameOffset);
        this.screenshotManager.setTopFrameOffset(topFrameOffset);
        this.screenshotManager.setBackground(backgroundColor)
        this.blinkManager.enableScreenshot();
        await this.screenshotManager._calculateBoneOffsets(0.2);

        const scope = this;
        let counter = 0;

        // pose the character
        console.log(objectData);
        
        if (Array.isArray(thumbnailsCollection)){
            console.log("t");
            async function processScreenshots() {
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
                    console.log("TRAITS", modelTraits);

                    const vectorCameraPosition = getVectorCameraPosition(cameraPosition);
                    if (cameraFrame){
                        console.log("frames camera");
                        scope.screenshotManager.setCameraFrameWithName(cameraFrame, vectorCameraPosition);
                    }
                    else{
                        
                        scope.screenshotManager.frameShot(bottomBoneName, topBoneName, vectorCameraPosition, bottomBoneMaxVertex, topBoneMaxVertex);
                    }

                    for (let i=0; i < modelTraits.length;i++){
                        console.log(modelTraits[i].id);
                        const traitId = modelTraits[i].id;
                        await scope.characterManager.loadTrait(traitGroup, traitId,true);
                        //await scope.animationManager.loadAnimation(animBasePath + poseAnimation, true, finalAnimationTime);
                        //scope.animationManager.setTime(finalAnimationTime);
                        await delay(100);
                        scope.screenshotManager.saveScreenshot(traitGroup + "_" + traitId, thumbnailsWidth, thumbnailsHeight);
                   
                        counter++
                        if (counter >= maxQty){
                            break;
                        }
                    }
                    //const saveName = animationName ? animationName : counter.toString().padStart(2, '0');

                }
            }
            // Call the function to start processing animations
            await processScreenshots();
        }

        this.blinkManager.disableScreenshot();
    }

    async createThumbnailsWithManifest(manifestURL, maxQty){
        
        const manifest = await this._fetchManifest(manifestURL);
        await this.createThumbnailsWithObjectData(manifest,maxQty)
        
    }

    async _fetchManifest(location) {
        const response = await fetch(location)
        const data = await response.json()
        return data
    }

}