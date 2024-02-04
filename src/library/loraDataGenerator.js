import * as THREE from "three"
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

    async createLoraData(manifestURL){
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
        // await this.animationManager.loadAnimation(animBasePath + loraInfo.animationPath,true,0);
        // await delay(10);

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
            
                        const vectorCameraPosition = scope._getCameraPosition(cameraPosition);
                        scope._setCameraFrame(cameraFrame,vectorCameraPosition);
            
                        // set camera position
                        scope.screenshotManager.saveScreenshot(saveName, width, height);
                        scope._saveTextFile("anata" + " " + description + " " + backgroundDescription,saveName);
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

    _getCameraPosition(cameraPosition){

        let x,y,z = 0
        if (Array.isArray(cameraPosition)){
            x = cameraPosition[0]||0;
            y = cameraPosition[1]||0;
            z = cameraPosition[2]||0;
            
        }
        else if (typeof cameraPosition === 'string' || cameraPosition instanceof String){
            
            const positionString = cameraPosition.split('-');
            positionString.forEach(pos => {
                pos = pos.toLowerCase();
                switch (pos){
                    case "left":
                        x = -1
                        break;
                    case "right":
                        x = 1
                        break;
                    case "bottom":
                    case "down":
                        y = -1
                        break;
                    case "top":
                    case "up":
                        y = 1
                        break;
                    case "back":
                    case "backward":
                        z = -1
                        break;
                    case "front":
                    case "forward":
                        z = 1
                        break;
                    default:
                        console.warn("unkown cameraPosition name: " + pos + " in: " + cameraPosition +". Please use left, right, bottom, top, back or front")
                        break;
                }
            });
        }
        return new THREE.Vector3(x,y,z);
    }

    _saveTextFile(textContent, filename) {
        const blob = new Blob([textContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename + ".txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    _setCameraFrame(shotName, vectorCameraPosition){
        const shotNameLower = shotName.toLowerCase();
        switch (shotNameLower){
            case "fullshot":
                this.screenshotManager.frameShot("leftFoot", "head",vectorCameraPosition)
                break;
            case "cowboyshot":
                this.screenshotManager.frameShot("hips", "head",vectorCameraPosition)
                break;
            case "mediumshot":
                this.screenshotManager.frameShot("chest", "head",vectorCameraPosition)
                break;
            case "mediumcloseup":
            case "mediumcloseupshot":
                this.screenshotManager.frameShot("chest", "head",vectorCameraPosition,true)
                break;
            case "closeup":
            case "closeupshot":
                this.screenshotManager.frameShot("head", "head",vectorCameraPosition)
                break;
            default:
                console.warn("unkown cameraFrame: " + shotName + ". Please use fullShot, cowboyShot, mediumShot, mediumCloseup or closeup")
                this.screenshotManager.frameShot("leftFoot", "head",vectorCameraPosition)
                break;
        }
    }


}