import { AnimationMixer, AnimationClip, AnimationAction, Group, Vector3, NumberKeyframeTrack, VectorKeyframeTrack} from 'three'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { sceneService } from '../../services/scene'
import { VRM } from '@pixiv/three-vrm'

// make a class that hold all the informarion
const fbxLoader = new FBXLoader();
const gltfLoader = new GLTFLoader();
const interpolationTime = 0.2;

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

class AnimationControl {
  mixer:AnimationMixer 
  actions:Array<AnimationAction>
  to:AnimationAction
  from:AnimationAction
  animationManager: AnimationManager

  constructor(animationManager: AnimationManager, scene:Group, animations: Array<AnimationClip>, curIdx:number, lastIdx:number){
    this.animationManager = animationManager;
    this.mixer = new AnimationMixer(scene);
    this.actions = [];
    for (let i =0; i < animations.length;i++){
      this.actions.push(this.mixer.clipAction(animations[i]));
    }

    this.to = this.actions[curIdx]
    
    if (lastIdx != -1){
      this.from = this.actions[lastIdx];
      this.from.reset();
      this.from.time = animationManager.getFromActionTime();
      this.from.play();

      this.to.weight = animationManager.getWeightIn();
      this.from.weight = animationManager.getWeightOut();
    }

    this.actions[curIdx].reset();
    this.actions[curIdx].time = animationManager.getToActionTime();
    this.actions[curIdx].play();
  }

  dispose(){
    this.animationManager.disposeAnimation(this);
    console.log("todo dispose animation control")
  }
}

export class AnimationManager{
  lastAnimID: number
  curAnimID: number
  mainControl: AnimationControl
  animationControls: Array<AnimationControl>
  animations: Array<AnimationClip>
  weightIn:number;
  weightOut:number;
  offset:Vector3;

  constructor (offset?:Array<number>){

    this.lastAnimID = -1;
    this.curAnimID = 0;
    this.animationControls = [];
    if (offset){
      this.offset = new Vector3(
        offset[0],
        offset[1],
        offset[2]
      );
    }
    this.update();
  }
  async loadAnimations(path:string):Promise<void>{
    const loader = path.endsWith('.fbx') ? fbxLoader : gltfLoader;
    const anim = await loader.loadAsync(path);
    // offset hips
    this.animations = anim.animations;
    if (this.offset)
      this.offsetHips();
  }

  offsetHips():void{
    this.animations.forEach(anim => {
      for (let i =0; i < anim.tracks.length; i++){
        const track = anim.tracks[i];
        if (track.name === "hips.position"){
          for (let j = 0; j < track.values.length/3 ; j++){
            const base = j*3;
            track.values[base] = track.values[base] + this.offset.x;
            track.values[base + 1] = track.values[base + 1] + this.offset.y;
            track.values[base + 2] = track.values[base + 2] + this.offset.z;
          }
        }
      }
    });
  }

  startAnimation(vrm: VRM):void{
    //return
    if (!this.animations) {
      console.warn("no animations were preloaded, ignoring");
      return
    }
    // important to do* check mixers and remove those that are no longer active in the scene
    //cleanupMixers();

    const animationControl = new AnimationControl(this, vrm.scene, this.animations, this.curAnimID, this.lastAnimID)
    this.animationControls.push(animationControl);

    sceneService.addModelData(vrm , {animationControl});

    if (this.mainControl == null){
      this.mainControl = animationControl;
      this.animRandomizer(this.animations[this.curAnimID].duration);
    }
  }
  
  getFromActionTime():number{
    return this.mainControl.actions[this.lastAnimID].time;
  }

  getToActionTime():number{
    return this.mainControl ? this.mainControl.actions[this.curAnimID].time : 0.1;
  }

  getWeightIn():number{
    return this.weightIn;
  }

  getWeightOut():number{
    return this.weightOut;
  }
  
  disposeAnimation(targetAnimControl:AnimationControl):void{
    if (targetAnimControl != null){
      const ind = this.animationControls.indexOf(targetAnimControl);
      if (ind != -1)
        this.animationControls.splice(ind,1);
    }
  }

  dispose():void{
    this.animationControls.forEach(animControl => {
      animControl.dispose()
    });
    console.log("todo dispose animations")
  }

  animRandomizer(yieldTime):void{
    const root = this.mainControl.mixer.getRoot();
    //if (root.parent)
      //console.log(root);
    // if (this.mainControl) {
    //   if (this.mainControl.mixer){
        
    //   }
    // }
    setTimeout(() => {
      this.lastAnimID = this.curAnimID;
      this.curAnimID = getRandomInt(this.animations.length);
      if (this.curAnimID != this.lastAnimID){
        
        this.animationControls.forEach(animControl => {
  
          animControl.from = animControl.actions[this.lastAnimID];
          animControl.to = animControl.actions[this.curAnimID];
  
          this.weightIn = 0;
          this.weightOut = 1;
          
          animControl.to.play();
          animControl.to.reset();
        })
      }
      this.animRandomizer(this.animations[this.curAnimID].duration - interpolationTime);
    }, (yieldTime * 1000));
  }

  update():void{
    setInterval(() => {
      if (this.mainControl){
        if (this.weightIn < 1){ 
          //if (this.mainControl.mixer.getRoot().parent)console.log(this.weightIn)
          this.weightIn += 1/(30*interpolationTime);
        }
        else this.weightIn = 1;  
    
        if (this.weightOut > 0) this.weightOut -= 1/(30*interpolationTime);
        else this.weightOut = 0;
          
        this.animationControls.forEach(animControl => {
          animControl.mixer.update(1/30);
    
          if (animControl.from != null){
            animControl.from.weight = this.weightOut;
          }
          if (animControl.to != null){
            animControl.to.weight = this.weightIn;
          }
        });
      }
    }, 1000/30);
  }
}
