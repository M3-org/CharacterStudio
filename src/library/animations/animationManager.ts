import { AnimationMixer, Euler, Quaternion, AnimationClip, AnimationAction, QuaternionKeyframeTrack, Group, VectorKeyframeTrack, Vector3} from 'three'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { sceneService } from '../../services/scene'
import { VRM } from '@pixiv/three-vrm'

// make a class that hold all the informarion
const fbxLoader = new FBXLoader();
const gltfLoader = new GLTFLoader();
const interpolationTime = 1;

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

class AnimationControl {
  mixer:AnimationMixer 
  actions:Array<AnimationAction>
  to:AnimationAction
  from:AnimationAction

  constructor(animationMaster: AnimationManager, scene:Group, animations: Array<AnimationClip>, curIdx:number, lastIdx:number){
    this.mixer = new AnimationMixer(scene);
    this.actions = [];
    for (let i =0; i < animations.length;i++){
      this.actions.push(this.mixer.clipAction(animations[i]));
    }

    this.to = this.actions[curIdx]
    
    if (lastIdx != -1){
      this.from = this.actions[lastIdx];
      this.from.reset();
      this.from.time = animationMaster.getFromActionTime();
      this.from.play();

      this.to.weight = animationMaster.getWeightIn();
      this.from.weight = animationMaster.getWeightOut();
    }

    this.actions[curIdx].reset();
    this.actions[curIdx].time = animationMaster.getToActionTime();
    this.actions[curIdx].play();
  }

  dispose(){
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

  constructor (){

    this.lastAnimID = -1;
    this.curAnimID = 0;
    this.animationControls = [];

    this.update();
  }
  async loadAnimations(path:string):Promise<void>{
    const loader = path.endsWith('.fbx') ? fbxLoader : gltfLoader;
    const anim = await loader.loadAsync(path);
    this.animations = anim.animations;
  }

  startAnimation(vrm: VRM):void{
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

  dispose():void{
    this.animationControls.forEach(animControl => {
      animControl.dispose()
    });
    console.log("todo dispose animations")
  }

  disposeAnimation(targetAnimControl:AnimationControl):void{
    if (targetAnimControl != null){
      const ind = this.animationControls.indexOf(targetAnimControl);
      if (ind != -1)
        this.animationControls.splice(ind,1);
    }
  }

  animRandomizer(yieldTime):void{
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
      this.animRandomizer(this.animations[this.curAnimID].duration);
    }, (yieldTime * 1000));
  }

  update(){
    setInterval(() => {
      if (this.weightIn < 1) this.weightIn += 1/(30*interpolationTime);
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
    }, 1000/30);
  }
}






const cleanupMixers = () => {
  let i = animControls.length;
  while (i--) {
      if (animControls[i] == null)
        animControls.splice
  }
}

export const startAnimation = async (gltf: any):Promise<void> => {
  //return;
  if (!animations) return
  // important to do* check mixers and remove those that are no longer active in the scene
  cleanupMixers();
  
  mixer = new AnimationMixer(gltf.scene);
  
  //console.log(gltf.scene);
  mixers.push(mixer)

  const actions = [];
  for (let i =0; i < animations.length;i++){
    actions.push(mixer.clipAction(animations[i]));
  }


  const animControl = {mixer:mixer, actions:actions, to:actions[curAnimID], from:null};
  

  //console.log(animControls)

  sceneService.addModelData(gltf , {animControl});
  
  if (lastAnimID != -1){
    //animControl.to = actions[curAnimID];
    animControl.from = actions[lastAnimID];
    animControl.from.reset();
    animControl.from.time = animControls[0].actions[lastAnimID].time;
    animControl.from.play();

    animControl.to.weight = weightIn;
    animControl.from.weight = weightOut;
  }

  

  actions[curAnimID].reset();
  actions[curAnimID].time = animControls.length > 0 ? animControls[0].actions[curAnimID].time : 0.1;
  actions[curAnimID].play();
  
  animControls.push(animControl);
  
 
  if (!started){
    started = true;
    animRandomizer(animations[curAnimID].duration);
    //curAction = animations[curAnimID];
  }
}

export const disposeAnimation = (targetAnimControl:any) => {
  if (targetAnimControl != null){
    //console.log(targetAnimControl);
    const ind = animControls.indexOf(targetAnimControl);
    //console.log(ind)
    if (ind != -1)
      animControls.splice(ind,1);
  }
}


const setMixamoAnimation = (animation:AnimationClip) => {
  console.log(animation);
  const clip = animation.clone();
  const newTracks = [];
  for (let i =0; i < clip.tracks.length;i++){
    const track = clip.tracks[i];
    if(track instanceof QuaternionKeyframeTrack){
      const boneName = track.name.replace('.quaternion','').substring(9); // remove mixamorig and .quaternion
      console.log(boneName);
      const armModif = boneName.startsWith('Right') ? -1 : 1;
      v3_2.set(1,1,1);
      switch (boneName) {
        case "Hips":
          newTracks.push(ModifyRotations(track, v3.setX(-0.74),v3_2));
          break;
        case "LeftUpLeg":
        case "RightUpLeg":
          newTracks.push(ModifyRotations(track, v3.set(-1.263,0,-180),v3_2));
          break;
        case "LeftLeg":
        case "RightLeg":
          newTracks.push(ModifyRotations(track, v3.setX(4.517),v3_2.setX(-1)));
          break;
        case "LeftFoot":
        case "RightFoot":
          newTracks.push(ModifyRotations(track, v3.setX(-54.816),v3_2.setX(-1)));
          break;
        case "LeftToeBase":
        case "RightToeBase":
          newTracks.push(ModifyRotations(track, v3.setX(-39),v3_2));
          break;
        case "Spine":
          newTracks.push(ModifyRotations(track, v3.setX(9.195),v3_2));
          break;
        case "Spine2":
          newTracks.push(ModifyRotations(track, v3.setX(-1.477),v3_2));
          break;
        case "LeftShoulder":
        case "RightShoulder":
          //done
          newTracks.push(ModifyRotations(track, v3.set(-96.97, 2.83 * armModif, 101.88 * armModif),v3_2.set(1,1,1),true));
          //console.log(track)
          break;
        case "LeftArm":
        case "RighttArm":
          newTracks.push(ModifyRotations(track, v3.set(2.774, 0.584 * armModif, -11.9 * armModif),v3_2.set(0,0,0)));
          //newTracks.push(ModifyRotations(track, v3.set(2.774, 0.584 * armModif, -11.9 * armModif),v3_2,true));
          break;
        case "LeftHandThumb1":
        case "RightHandThumb1":
          newTracks.push(ModifyRotations(track, v3.set(-30.038, 0.089 * armModif, -26.521 * armModif),v3_2));
          break;
        case "LeftHandThumb2":
        case "RightHandThumb2":
          newTracks.push(ModifyRotations(track, v3.setY(-0.119 * armModif),v3_2));
          break;
        case "LeftHandThumb3":
        case "RightHandThumb3":
          newTracks.push(ModifyRotations(track, v3.setY(-0.085 * armModif),v3_2));
          break;
        default:
          //newTracks.push(track);
      }
    }
  }
  clip.tracks = newTracks;
  console.log(clip);
  return clip;
}
