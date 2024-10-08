import { VRMExpressionPresetName } from "@pixiv/three-vrm";
import { Clock } from "three";

const SCREENSHOT_EYES_OPEN_THRESHOLD = 2;

export class BlinkManager {
  constructor(closeTime = 0.5, openTime = 0.5, continuity = 1, randomness = 5) {
    this.vrmBlinkers = [];
    this.mode = 'ready';
    
    this.clock = new Clock();

    this.closeTime = closeTime
    this.openTime = openTime
    this.continuity = continuity;
    this.randomness = randomness
    
    this._eyeOpen = 1
    this._blinkCounter = 0;

    this.isTakingScreenShot = false;

    this.update()
  }

  addVRM(vrm){
    this.vrmBlinkers.push(vrm)
  }

  removeVRM(vrm) {
    const index = this.vrmBlinkers.indexOf(vrm);

    if (index !== -1) {
        this.vrmBlinkers.splice(index, 1);
    }
}

  enableScreenshot() {
    this.isTakingScreenShot = true;
    this._eyeOpen = SCREENSHOT_EYES_OPEN_THRESHOLD;
    this._updateBlinkers();
  }

  disableScreenshot() {
    this.isTakingScreenShot = false;
  }

  update(){
    setInterval(() => {
      if (this.isTakingScreenShot) {
        return;
      }
      const deltaTime = this.clock.getDelta()
      switch (this.mode){
        
        case 'closing': 
          if ( this._eyeOpen > 0)
            this._eyeOpen -= deltaTime / this.closeTime;
          else{
            this._eyeOpen = 0
            this.mode = 'open'
          }
          this._updateBlinkers();
        break;
        case 'open':
          if ( this._eyeOpen < 1)
            this._eyeOpen += deltaTime / this.openTime;
          else{
            this._eyeOpen = 1
            this.mode = 'ready'
          }
          this._updateBlinkers();
        break;
        case 'ready':
          this._blinkCounter += deltaTime;
          if (this._blinkCounter >= this.continuity){
            if (Math.floor(Math.random() * this.randomness) === 0)
              this.mode = 'closing'
            this._blinkCounter = 0;
          }
          
        break;
      }
    }, 1000/30);
  }

  _updateBlinkers(){
    this.vrmBlinkers.forEach(vrm => {
        vrm.expressionManager.setValue(VRMExpressionPresetName.Blink, 1 - this._eyeOpen)
        vrm.expressionManager.update()
    });
  }
}