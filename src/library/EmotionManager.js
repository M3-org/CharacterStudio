import { VRMExpressionPresetName } from "@pixiv/three-vrm";
import { Clock } from "three";

/**
 * @typedef {import('@pixiv/three-vrm').VRMExpressionPresetName} VRMExpressionPresetName
 * @typedef {import('@pixiv/three-vrm').VRM} VRM
 * 
 */

export class EmotionManager {
    /**
     * @type {VRM[]}
     */
  vrmEmotion
  /**
   * @type {'ready'|'animating'|'stopping'|'transition'}
   */
  mode
  /**
   * @type {Clock}
   */
  clock
  continuous = false;
  /**
   * @type {VRMExpressionPresetName|null}
   */
  emotionPlaying =null;
  /**
   * @type {number}
   */
  emotionValue = 0;
  /**
   * @type {number}
   */
  intensity = 1;
  /**
   * Time for the emotion to go from 0 to 1 (divide by two if you want fast in and out)
   * @type {number}
   */
  emotionTime = 0.6;
  /**
   * @type {boolean}
   */
  isTakingScreenShot = false;

  /**
   * For transitioning to the next emotion from the current one;
   * @type {VRMExpressionPresetName|null}
   */
  _nextEmotion = null;
  /**
   * @type {number}
   */
  _nextEmotionTime = 0;
  /**
   * @type {number}
   */
  _nextEmotionValue = 0;
  /**
   * @type {number}
   */
  _nextIntensity = 1;
  _nextIsContinuous = false;

  constructor( ) {
    this.vrmEmotion = [];
    this.mode = 'ready';
    
    this.clock = new Clock();
    
    this.isTakingScreenShot = false;
    
    this.update()
  }

  get availableEmotions(){
    const keys = Object.keys(VRMExpressionPresetName).map((t)=>t.toLowerCase())
    const available= []
    for(const vrm of this.vrmEmotion){
      for(const key of keys){
        if(key==='blink') continue
        if(available.includes(key)) continue
        const express =vrm.expressionManager?.getExpression(key)

        if(express && express._binds.length > 0){
          available.push(key)
        }
      }
    }
    return available
  }

  /**
   * @param {VRM} vrm 
   */
  addVRM(vrm){
    if(!vrm.expressionManager) return
    this.vrmEmotion.push(vrm)
  }
  /**
   * 
   * @param {'aa'|'ee'|'ii'|'oo'|'uu'|'blink'|'joy'|'angry'|'sorrow'|'fun'|'lookUp'|'lookDown'|'lookLeft'|'lookRight'} emotion 
   */
  hasEmotion(emotion){
    return this.availableEmotions.some(emo => emo === emotion)
  }

  /**
   * @param {VRM} vrm 
   */
  removeVRM(vrm) {
    const index = this.vrmEmotion.indexOf(vrm);

    if (index !== -1) {
        this.vrmEmotion.splice(index, 1);
    }
  }

  enableScreenshot() {
    this.isTakingScreenShot = true;
    this.emotionPlaying = null;
    this._updateEmotions();
  }

  disableScreenshot() {
    this.isTakingScreenShot = false;
  }

  _isBlink(emotion){
    return emotion === 'blink'
  }
  /**
   * 
   * @param {'aa'|'ee'|'ii'|'oo'|'uu'|'blink'|'joy'|'angry'|'sorrow'|'fun'|'lookUp'|'lookDown'|'lookLeft'|'lookRight'} emotion 
   * @param {number} [time]
   * @param {boolean} [continuous]
   * @param {number} [intensity]
   */
  playEmotion(emotion, time=undefined, continuous=false, intensity = 1){
    if (!this.hasEmotion(emotion)) {
      console.warn(`Emotion ${emotion} not available`)
      return
    }
    if(this._isBlink(emotion)){
        console.warn(`Blink is handled by the BlinkManager, ignoring`)
        return
    }
    if(emotion === this.emotionPlaying){
      if(intensity === this.intensity){
        return
      }
    }
    const intensity_ = Math.min(1,Math.max(0,intensity))
    if(this.mode === 'animating' && this.emotionPlaying){
      this.continuous = false;
      // transition to the next emotion
      this._nextEmotion = emotion
      this._nextEmotionTime = time || this.emotionTime 
      this._nextEmotionValue = 0
      this._nextIntensity = intensity_
      this._nextIsContinuous = continuous || false
      this.mode = 'transition'
      return
    }

    this.emotionPlaying = emotion
    this.intensity = intensity_
    if(time){
      this.emotionTime = time
    }
    this.continuous = continuous || false
    this.mode = 'animating'
  }

  _setIsReady(){
    this.emotionValue = 0
    this.intensity = 1
    this.emotionPlaying = null
    this.continuous = false
    this.mode = 'ready'
  }

  _removeNextEmotion(){
    this._nextEmotion = null
    this._nextIntensity = 1
    this._nextEmotionValue = 0
    this._nextEmotionTime = 0
    this._nextIsContinuous = false
  }

  update(){
    setInterval(() => {
      if (this.isTakingScreenShot) {
        return;
      }
      const deltaTime = this.clock.getDelta()
      switch (this.mode){
        
        case 'animating': 
          if ( this.emotionPlaying){
            if(this.emotionValue < this.intensity){
              this.emotionValue += deltaTime / this.emotionTime;
              this.emotionValue = Math.min(1,this.emotionValue)
            }

            if(!this.continuous && this.emotionValue >= this.intensity){
              this.mode = 'stopping'
            }
            
          }else{
            this._setIsReady()
          }
          this._updateEmotions();
        break;
        case 'stopping':
          if ( this.emotionPlaying){
            if(this.emotionValue>0){
              this.emotionValue -= deltaTime / this.emotionTime;
              this.emotionValue = Math.max(0,this.emotionValue)
            }
            if(this.emotionValue <= 0){
              this._setIsReady()
            }
          }else{
            this._setIsReady()
          }
          this._updateEmotions();
          break;
        case 'transition':
          if(this._nextEmotion){
            if(this._nextEmotionValue < this._nextIntensity){
              this._nextEmotionValue += deltaTime / this._nextEmotionTime;
              this.emotionValue = Math.min(this.intensity,this.emotionValue)
            }
            if(this.emotionValue > 0){
              this.emotionValue -=deltaTime / this._nextEmotionTime
            }else{
              this.emotionValue = this._nextEmotionValue
              this.emotionTime = this._nextEmotionTime
              this.emotionPlaying = this._nextEmotion
              this.intensity = this._nextIntensity
              this.continuous = this._nextIsContinuous
              this.mode = 'animating'
              this._removeNextEmotion()
            }

          }else{
            if(this.emotionPlaying){
              this.mode = 'animating'
            }
          }
          this._updateEmotions();
      }
    }, 1000/30);
  }

    _updateEmotions(){
    if(!this.emotionPlaying) return
    this.vrmEmotion.forEach(vrm => {
        if(this._nextEmotion){
          vrm.expressionManager?.setValue(this._nextEmotion, this._nextEmotionValue)
        }
        vrm.expressionManager?.setValue(this.emotionPlaying, this.emotionValue)
        vrm.expressionManager?.update()
    });
  }
}
