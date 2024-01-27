import * as THREE from "three"
const localVector3 = new THREE.Vector3();

export class LoraDataGenerator {
    constructor(characterManager){
        this.characterManager = characterManager;
        this.screenshotManager = characterManager.screenshotManager;
        this.blinkManager = characterManager.blinkManager;

        console.log(this.characterManager);
        console.log(this.screenshotManager);
    }
    
    testScreenshot(){
        // this.screenshotManager.setupCamera(cameraPosition, lookAtPosition, fieldOfView = 30);

        this.blinkManager.enableScreenshot();

        // this.characterManager.characterModel.traverse(o => {
        //     if (o.isSkinnedMesh) {
        //     const headBone = o.skeleton.bones.filter(bone => bone.name === 'head')[0];
        //     headBone.getWorldPosition(localVector3);
        //     }
        // });
        // localVector3.z += 0.3;
        // localVector3.y += 0.3;
        // this.screenshotManager.setCamera(localVector3, 1);
        this.screenshotManager.positionCameraBetweenPoints(new THREE.Vector3(0,0,0), new THREE.Vector3(0,1.7,0), new THREE.Vector3(1,1,1),30)
        this.screenshotManager.saveScreenshot("testScreenshot", 512,512);

        this.blinkManager.disableScreenshot();
        console.log("take screenshot");
    }


}