import { VRM, VRMExpressionPresetName } from "@pixiv/three-vrm";
import { Clock } from "three";


type EmotionKeys = keyof typeof VRMExpressionPresetName
export type EmotionValues = typeof VRMExpressionPresetName[EmotionKeys]

export class EmotionManager {

  vrmEmotion: VRM[];
  mode: 'ready'|'animating'|'stopping'|'transition';
  clock: Clock;
  continuous: boolean = false;
  emotionPlaying: EmotionValues|null =null;
  emotionValue: number = 0;
  intensity: number = 1;
  // time for the emotion to go from 0 to 1 (divide by two if you want fast in and out)
  emotionTime: number = 0.6;
  isTakingScreenShot: boolean;

  // For transitioning to the next emotion from the current one;
  nextEmotion: EmotionValues|null = null;
  nextEmotionTime: number = 0;
  nextEmotionValue: number = 0;
  nextIntensity: number = 1;
  nextIsContinuous: boolean = false;

  constructor( ) {
    this.vrmEmotion = [];
    this.mode = 'ready';
    
    this.clock = new Clock();
    
    this.isTakingScreenShot = false;
    
    this.update()
  }

  get availableEmotions(){
    const keys = Object.keys(VRMExpressionPresetName).map((t)=>t.toLowerCase()) as EmotionValues[]
    const available:EmotionValues[] = []
    for(const vrm of this.vrmEmotion){
      for(const key of keys){
        if(available.includes(key)) continue
        const express =vrm.expressionManager?.getExpression(key)

        if(express && (express as any)._binds.length > 0){
          available.push(key)
        }
      }
    }
    return available
  }

  enableRandomEmotions(){
    setInterval(() => {
      if (this.isTakingScreenShot) {
        return;
      }
      if (this.mode === 'ready'){
        const emos = ['happy','sad']
        const randomEmotion  = emos[Math.floor(Math.random() * emos.length)] as EmotionValues
        this.playEmotion(randomEmotion)
        // setTimeout(() => {
        //   this.playEmotion('sad')
        // },300)
      }
    },3000)
  }

  addVRM(vrm:VRM){
    if(!vrm.expressionManager) return
    this.vrmEmotion.push(vrm)
  }

  hasEmotion(emotion: EmotionValues){
    return this.availableEmotions.some(emo => emo === emotion)
  }

  removeVRM(vrm:VRM) {
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

  playEmotion(emotion: EmotionValues, time?: number, continuous?:boolean, intensity:number = 1){
    if (!this.hasEmotion(emotion)) {
      console.warn(`Emotion ${emotion} not available`)
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
      this.nextEmotion = emotion
      this.nextEmotionTime = time || this.emotionTime 
      this.nextEmotionValue = 0
      this.nextIntensity = intensity_
      this.nextIsContinuous = continuous || false
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

  private setIsReady(){
    this.emotionValue = 0
    this.intensity = 1
    this.emotionPlaying = null
    this.continuous = false
    this.mode = 'ready'
  }

  private removeNextEmotion(){
    this.nextEmotion = null
    this.nextIntensity = 1
    this.nextEmotionValue = 0
    this.nextEmotionTime = 0
    this.nextIsContinuous = false
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
            this.setIsReady()
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
              this.setIsReady()
            }
          }else{
            this.setIsReady()
          }
          this._updateEmotions();
          break;
        case 'transition':
          if(this.nextEmotion){
            if(this.nextEmotionValue < this.nextIntensity){
              this.nextEmotionValue += deltaTime / this.nextEmotionTime;
              this.emotionValue = Math.min(this.nextIntensity,this.emotionValue)
            }
            if(this.emotionValue > 0){
              this.emotionValue -=deltaTime / this.nextEmotionTime
            }else{
              this.emotionValue = this.nextEmotionValue
              this.emotionTime = this.nextEmotionTime
              this.emotionPlaying = this.nextEmotion
              this.intensity = this.nextIntensity
              this.continuous = this.nextIsContinuous
              this.mode = 'animating'
              this.removeNextEmotion()
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

  private _updateEmotions(){
    if(!this.emotionPlaying) return
    this.vrmEmotion.forEach(vrm => {
        if(this.nextEmotion){
          vrm.expressionManager?.setValue(this.nextEmotion!, this.nextEmotionValue)
        }
        vrm.expressionManager?.setValue(this.emotionPlaying!, this.emotionValue)
        vrm.expressionManager?.update()
    });
  }
}
