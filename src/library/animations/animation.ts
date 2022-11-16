import {AnimationMixer, Euler, Quaternion, AnimationClip, QuaternionKeyframeTrack, VectorKeyframeTrack, Vector3, Vector3} from 'three'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"

const mixers: any = []
const origQuat = new Quaternion();
const eul = new Euler();
let quatArr = [];
const v3 = new Vector3();
const v3_2 = new Vector3(1,1,1)

let mixer, animations, curAnimID, lastAnimID, started, weightIn, weightOut, globalTimer, curAction, lastAction;
const interpolationTime = 1;
const animControls = [];
export const loadAnimation = async (path: string):Promise<void>=> {
  let loader;
  if (path.endsWith('.fbx')){
    loader = new FBXLoader();
    
  }
  if (path.endsWith('.glb')||path.endsWith('.gltf')){
    loader = new GLTFLoader()
  }

  globalTimer = 0;
  started = false;
  lastAnimID = -1;
  curAnimID = 0;
  const anim = await loader.loadAsync(path);

  animations = anim.animations;
  //console.log (animations[3])
}

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

const animRandomizer = (yieldTime) => {
  setTimeout(() => {
    lastAnimID = curAnimID;
    curAnimID = getRandomInt(animations.length);
    if (curAnimID != lastAnimID){
      
      animControls.forEach(animControl => {

        animControl.from = animControl.actions[lastAnimID];
        animControl.to = animControl.actions[curAnimID];

        weightIn = 0;
        weightOut = 1;
        
        animControl.to.play();
        animControl.to.reset();

        //globalTimer = 0;
        
      })
      //lastAction = animControls[0].from;
      //curAction = animControls[0].from;
    }
    animRandomizer(animations[curAnimID].duration + 0.2);
  }, (yieldTime * 1000) - (interpolationTime/2) * 1000);
  setTimeout(() => {
    //lastAction = null;
  },(yieldTime * 1000) - (interpolationTime/2) * 1000);
  // todo check if substracting dont go below 0
}

const cleanupMixers = () => {
  let i = animControls.length;
  while (i--) {
      if (animControls[i] == null)
        animControls.splice
  }
}

export const startAnimation = async (gltf: any):Promise<void> => {
  if (!animations) return
  // important to do* check mixers and remove those that are no longer active in the scene
  cleanupMixers();
  
  mixer = new AnimationMixer(gltf.scene);
  
  console.log(gltf.scene);
  mixers.push(mixer)

  const actions = [];
  for (let i =0; i < animations.length;i++){
    actions.push(mixer.clipAction(animations[i]));
  }


  const animControl = {mixer:mixer, actions:actions, to:actions[curAnimID], from:null};
  animControls.push(animControl);

  gltf.scene.userData.animControl = animControl;
  
  if (lastAnimID != -1){
    //animControl.to = actions[curAnimID];
    animControl.from = actions[lastAnimID];
    animControl.from.reset();
    animControl.from.play();
    animControl.from.time = animControls[0].actions[lastAnimID].time;


    animControl.to.weight = weightIn;
    animControl.from.weight = weightOut;
  }

  actions[curAnimID].play();
  actions[curAnimID].reset();
  actions[curAnimID].time = animControls[0].actions[curAnimID].time;
  

  if (!started){
    started = true;
    animRandomizer(animations[curAnimID].duration);
    //curAction = animations[curAnimID];
  }
}

export const disposeAnimation = (model:any) => {
  if (model.userData.animControl != null){
    //model.userData.animControl.actions.forEach(action => {
      //action.stop();
    //});
    animControls.splice(animControls.indexOf(model.userData.animControl),1);
  }
}

const ModifyRotations = (track : QuaternionKeyframeTrack, modifyValue: Vector3, multValue: Vector3, debug? : boolean):QuaternionKeyframeTrack => {
  
  // convert to radians
  modifyValue.set(
    modifyValue.x * 0.01745,
    modifyValue.y * 0.01745,
    modifyValue.z * 0.01745
  )

  // modify all values 

  if (debug){
  console.log("BEFORE")
  const testQuat = new Quaternion(
    0.6240792870521545,
    0.4254472553730011,
    -0.3775902986526489,
    0.535672664642334)

    const testEuler = new Euler().setFromQuaternion(testQuat);
    console.log(testEuler.x/0.01745);
    console.log(testEuler.y/0.01745);
    console.log(testEuler.z/0.01745);

    //const lastQuat = testQuat.setFromEuler()
  }

  for (let i =0; i < track.values.length; i +=4){
    origQuat.set(
      Math.abs(track.values[0 + i]) < 0.0001 ? 0:track.values[0 + i],
      Math.abs(track.values[1 + i]) < 0.0001 ? 0:track.values[1 + i],
      Math.abs(track.values[2 + i]) < 0.0001 ? 0:track.values[2 + i],
      Math.abs(track.values[3 + i]) < 0.0001 ? 0:track.values[3 + i]
      );
    
    eul.setFromQuaternion(origQuat);
    if (debug){
      console.log("QUAT ORIG")
      console.log(origQuat.x);
      console.log(origQuat.y);
      console.log(origQuat.z);
      console.log(origQuat.w);
      console.log("VALUES ORIG")
      
      console.log(eul.x/0.01745);
      console.log(eul.y/0.01745);
      console.log(eul.z/0.01745);

      // console.log("MODIF VALUES")
      // console.log(modifyValue.x);
      // console.log(modifyValue.y);
      // console.log(modifyValue.z);
      //eul.set(0,0,0)
    }
    eul.set((eul.x + modifyValue.x) * multValue.x , (eul.y + modifyValue.y) * multValue.y  , (eul.z + modifyValue.z) * multValue.z  )

    
    if (debug){
      // console.log("VALUES")
      // console.log(eul.x);
      // console.log(eul.y);
      // console.log(eul.z);
      //eul.set(0,0,0)
    }
    quatArr = origQuat.setFromEuler(eul).toArray();

    for (let j =0; j < quatArr.length;j++){
      track.values[i+j] = quatArr[j];
    }
  }
  return track;
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

const update = () => {
  setInterval(() => {
    if (weightIn < 1)weightIn += 1/(30*interpolationTime);
    else weightIn = 1;  

    if (weightOut > 0) weightOut -= 1/(30*interpolationTime);
    else weightOut = 0;
      
    globalTimer += 1/30;
    animControls.forEach(animControl => {
      animControl.mixer.update(1/30);

      if (animControl.from != null){
        animControl.from.weight = weightOut;
      }
      if (animControl.to != null){
        animControl.to.weight = weightIn;
      }
    });
  }, 1000/30);
}
update()