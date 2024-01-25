import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { addModelData } from "./utils";
import { getMixamoAnimation } from './loadMixamoAnimation';
import { getAsArray, getFileNameWithoutExtension } from './utils';

// make a class that hold all the informarion
const fbxLoader = new FBXLoader();
const gltfLoader = new GLTFLoader();
const interpolationTime = 0.2;

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

class AnimationControl {
  constructor(animationManager, scene, vrm, animations, curIdx, lastIdx){
    this.mixer = new THREE.AnimationMixer(scene);
    this.actions = [];
    this.to = null;
    this.from = null;
    this.vrm = vrm;
    this.animationManager = animationManager;
    this.mixamoModel = null;

    this.fadeOutActions = null;
    this.newAnimationWeight = 1;

    this.neckBone = vrm?.humanoid?.humanBones?.neck;
    this.spineBone = vrm?.humanoid?.humanBones?.spine;


    this.setAnimations(animations);

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

  setMouseLookEnabled(mouseLookEnabled){
    this.setAnimations(this.animations, this.mixamoModel, mouseLookEnabled);
  }

  setAnimations(animations, mixamoModel, mouseLookEnabled = null){
    mouseLookEnabled = mouseLookEnabled == null ? this.animationManager.mouseLookEnabled : mouseLookEnabled;
    this.animations = animations;
    //this.mixer.stopAllAction();
    if (mixamoModel != null){
      if (this.vrm != null){
        const mixamoAnimation = getMixamoAnimation(animations, mixamoModel , this.vrm);
        if (mixamoAnimation){
          animations = [mixamoAnimation]
          this.mixamoModel = mixamoModel;
        }
      }
    } else{
      const cloneAnims = [];
      animations.forEach(animation => {
        cloneAnims.push(animation.clone());
      });
      animations = cloneAnims;
    }
    // modify animations
    if (mouseLookEnabled){
      animations[0].tracks.map((track, index) => {
        if(track.name === "neck.quaternion" || track.name === "spine.quaternion"){
          animations[0].tracks.splice(index, 1)
        }
      })
    }
    
    this.fadeOutActions = this.actions;
    
    this.actions = [];
    this.newAnimationWeight = 0;
    for (let i =0; i < animations.length;i++){
      this.actions.push(this.mixer.clipAction(animations[i]));
    }
    this.actions[0].weight = 0;
    this.actions[0].play();
  }

  update(weightIn,weightOut){
    if (this.fadeOutActions != null){
      this.newAnimationWeight += 1/5;
      this.fadeOutActions.forEach(action => {
        action.weight = 1 - this.newAnimationWeight;
      });

      if (this.newAnimationWeight >= 1){
        this.newAnimationWeight = 1;
        this.fadeOutActions.forEach(action => {
          action.weight = 0;
          action.stop();
        });
        this.fadeOutActions = null;
      }

      this.actions.forEach(action => {
        action.weight = this.newAnimationWeight;
      });
      
    }

    if (this.from != null) {
      this.from.weight = weightOut;
    }
    if (this.to != null) {
      this.to.weight = weightIn;
    }

    this.mixer.update(1/30);
  }

  reset() {
    this.mixer.setTime(0);
    this.to.paused = true;
  }

  resume() {
    this.to.paused = false;
  }

  dispose(){
    this.animationManager.disposeAnimation(this);
    //console.log("todo dispose animation control")
  }
}

export class AnimationManager{
  constructor (){
    this.animationPaths = null;
    this.lastAnimID = null;
    this.mainControl = null;
    this.animationControl  = null;
    this.animations = null;

    this.scale = 1;

    this.curLoadAnim = 0;
    this.currentAnimationName = "";
    
    this.weightIn = NaN; // note: can't set null, because of check `null < 1` will result `true`.
    this.weightOut = NaN;
    this.lastAnimID = -1;
    this.curAnimID = 0;
    this.animationControls = [];
    this.started = false;
    this.mouseLookEnabled = false;

    this.mixamoModel = null;
    this.mixamoAnimations = null;

    setInterval(() => {
      this.update();
    }, 1000/30);
  }

  enableMouseLook(enable){
    this.mouseLookEnabled = enable;
    this.animationControls.forEach(animControls => {
      animControls.setMouseLookEnabled(enable);
    });
  }
  
  setScale (scale){
    this.scale = scale;
  }

  async loadAnimation(paths, isfbx = true, pathBase = "", name = ""){
    const path = pathBase + (pathBase != "" ? "/":"") + getAsArray(paths)[0];
    name = name == "" ? getFileNameWithoutExtension(path) : name;
    this.currentAnimationName = name;
    const loader = isfbx ? fbxLoader : gltfLoader;
    const animationModel = await loader.loadAsync(path);
    // if we have mixamo animations store the model
    animationModel.scale.set(this.scale,this.scale,this.scale)
    this._scaleOffsetHips(animationModel.animations);
    const clip = THREE.AnimationClip.findByName( animationModel.animations, 'mixamo.com' );
    
    if (clip != null){
      this.mixamoModel = animationModel.clone();
      this.mixamoAnimations =   animationModel.animations;
    }
    // if no mixamo animation is present, just save the animations
    else{
      this.mixamoModel = null
      this.animations = animationModel.animations;
    }
    
    if (this.mainControl == null){
      this.curAnimID = 0;
      this.lastAnimID = -1;
      this.mainControl = new AnimationControl(this, animationModel, null, animationModel.animations, this.curAnimID, this.lastAnimID)
      this.animationControls.push(this.mainControl)
    }
    else{
      //cons
      this.animationControls.forEach(animationControl => {
        animationControl.setAnimations(animationModel.animations, this.mixamoModel, this.mouseLookEnabled)
      });
    }
  
  }

  getCurrentAnimationName(){
    return this.currentAnimationName;
  }

  clearCurrentAnimations(){
    this.animationPaths = null;
    this.animationControls = [];
    this.mainControl = null;
  }

  storeAnimationPaths(pathArray, pathBase){
    const paths = getAsArray(pathArray);   
    this.animationPaths = paths.map(path => `${pathBase}/${path}`);
  }

  loadNextAnimation(){
    if (this.curLoadAnim == this.animationPaths.length-1)
      this.curLoadAnim = 0;
    else
      this.curLoadAnim++;
    this.loadAnimation(this.animationPaths[this.curLoadAnim])
  }

  loadPreviousAnimation(){
    if (this.curLoadAnim == 0)
      this.curLoadAnim = this.animationPaths.length-1;
    else
      this.curLoadAnim--;
    this.loadAnimation(this.animationPaths[this.curLoadAnim])
  }

  enableScreenshot() {
    this.animationControls.forEach(control => {
      control.reset()
    }); 
  }

  disableScreenshot() {
    this.animationControls.forEach(control => {
      control.resume()
    }); 
  }

  _scaleOffsetHips(animations){
    animations.forEach(anim => {
      for (let i =0; i < anim.tracks.length; i++){
        const track = anim.tracks[i];
        if (track.name.includes(".position")){
          for (let j = 0; j < track.values.length/3 ; j++){
            const base = j*3;
            track.values[base] /= this.scale;
            track.values[base + 1] /= this.scale;
            track.values[base + 2] /= this.scale;
          }
        }
      }
    });
  }

  addVRM(vrm){
    if (this.mainControl == null){
      console.log("No animations preloaded");
      return;
    }
    let animations = null;
    if (this.mixamoModel != null){
      animations = [getMixamoAnimation(this.mixamoAnimations, this.mixamoModel.clone() ,vrm)]
      if (this.animations == null)
        this.animations = animations;
    }
    else{
      animations = this.animations;
    }
    //const animation = 
    if (!animations) {
      console.warn("no animations were preloaded, ignoring");
      return
    }
    const animationControl = new AnimationControl(this, vrm.scene, vrm, animations, this.curAnimID, this.lastAnimID)
    this.animationControls.push(animationControl);
    //this.animationControls.push({ vrm: vrm, animationControl: animationControl });

    //addModelData(vrm , {animationControl});
    if (this.started === false){
      this.started = true;
      this.animRandomizer(animations[this.curAnimID].duration);
    }
  }

  removeVRM(vrmToRemove) {
    const index = this.animationControls.findIndex((control) => control.vrm === vrmToRemove);

    if (index !== -1) {
        const removedControl = this.animationControls.splice(index, 1)[0];
        // Dispose of any resources associated with the removed AnimationControl
        removedControl.dispose();
    }
  }
  
  getFromActionTime(){
    return this.mainControl.actions[this.lastAnimID].time;
  }

  getToActionTime(){
    return this.mainControl ? this.mainControl.actions[this.curAnimID].time : 0.1;
  }

  getWeightIn(){
    return this.weightIn;
  }

  getWeightOut(){
    return this.weightOut;
  }
  
  disposeAnimation(targetAnimControl){
    if (targetAnimControl != null){
      const ind = this.animationControls.indexOf(targetAnimControl);
      if (ind != -1)
        this.animationControls.splice(ind,1);
    }
  }

  dispose(){
    this.animationControls.forEach(animControl => {
      animControl.dispose()
    });
  }

  animRandomizer(yieldTime){
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

  update(){
    if (this.mainControl) {
      this.animationControls.forEach(animControl => {
        animControl.update(this.weightIn,this.weightOut);
      });

      if (this.weightIn < 1) {
        this.weightIn += 1/(30*interpolationTime);
      }
      else this.weightIn = 1;  
  
      if (this.weightOut > 0) this.weightOut -= 1/(30*interpolationTime);
      else this.weightOut = 0;
    }
  }
}