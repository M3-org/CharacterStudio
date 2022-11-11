import { debug } from 'console'
import {AnimationMixer, Euler, Quaternion, AnimationClip, QuaternionKeyframeTrack, VectorKeyframeTrack, Vector3} from 'three'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"

const mixers: any = []
let vrmanimation, mixer
export const loadAnimation = async (path: string):Promise<void>=> {
  let loader;
  if (path.endsWith('.fbx')){
    loader = new FBXLoader();
    
  }
  if (path.endsWith('.glb')||path.endsWith('.gltf')){
    loader = new GLTFLoader()
  }
  const anim = await loader.loadAsync(path);
  console.log(anim)
  //console.log(animGltf);

  //console.log(anim)

  //vrmanimation = createVRMAnimation2(anim.animations[0]);
  vrmanimation = anim.animations[0];
}
export const startAnimation = async (gltf: any):Promise<void> => {
  if (!vrmanimation) return
  // important to do* check mixers and remove those that are no longer active in the scene
  mixer = new AnimationMixer(gltf.scene);
  mixers.push(mixer)
  const time = mixers.length > 0 ? mixers[0].time : 0;
  // temporary comment, to check mesh cull
  console.log("a;klsmd")
  console.log(gltf.scene);
  console.log(vrmanimation)
  mixer.clipAction(vrmanimation).play();
  mixer.setTime(time);
}
const createVRMAnimation = (animation: AnimationClip) =>{
  const clip = animation.clone();
  const newTracks = [];
  for (let i =0; i < clip.tracks.length;i++){
    const track = clip.tracks[i];
    if (!track.name.endsWith(".position")){
      // for (let i =0; i < track.values.length; i ++){   
      //   track.values[i] *= 100;
      // }
      newTracks.push(track);
    }
    
    //console.log(track)
  }
  clip.tracks = newTracks;
  return clip;
}
const createVRMAnimation2 = (animation: AnimationClip) =>{

  const clip = animation.clone();
  const newTracks = [];
  for (let i =0; i < clip.tracks.length;i++){
    const track = clip.tracks[i];
    // console.log(track.name)
    // if(track instanceof QuaternionKeyframeTrack){
    //   console.log(track)
    //   for (let i =0; i < track.values.length; i +=4){
    //     const origQuat = new Quaternion(
    //       Math.abs(track.values[0 + i]) < 0.0001 ? 0:track.values[0 + i],
    //       Math.abs(track.values[1 + i]) < 0.0001 ? 0:track.values[1 + i],
    //       Math.abs(track.values[2 + i]) < 0.0001 ? 0:track.values[2 + i],
    //       Math.abs(track.values[3 + i]) < 0.0001 ? 0:track.values[3 + i]
    //       );
    //     const eul = new Euler().setFromQuaternion(origQuat);
    //     const quatArr = new Quaternion().setFromEuler(new Euler(eul.z,eul.y,eul.x)).toArray();

    //     for (let j =0; j < quatArr.length;j++){
    //       track.values[i+j] = quatArr[j];
    //     }
    //   }
    // }

    const modifier = new Vector3(0,0,0);
    // if (track.name.startsWith("mixamorigLeftShoulder"))
    //   modifier.setZ(1.57);
    // if (track.name.startsWith("mixamorigRightShoulder"))
    //   modifier.setZ(-1.57);

    if (track.name.startsWith("mixamorigLeftUpLeg") || track.name.startsWith("mixamorigRightUpLeg"))
      modifier.setZ(3.14159);

    if (track.name.startsWith("mixamorigLeftLeg") || track.name.startsWith("mixamorigRightLeg"))
      modifier.setX(0.77);

    // if (track.name.startsWith("L_Foot") || track.name.startsWith("R_Foot"))
    //   modifier.set(-1.57,3.14159,0);

    // if (track.name.startsWith("Bust1") || track.name.startsWith("R_Boost1"))
    //   modifier.set(1.57,0,0);

    // if (!track.name.endsWith(".position"))
    //   newTracks.push(track);
    
    // if (track.name.startsWith("L_UpperArm")){
    //   console.log(track);
    // }
      
    if (track.name.endsWith(".quaternion")){
      for (let k =0; k < track.values.length; k +=4){
        const origQuat = new Quaternion(
          Math.abs(track.values[0 + k]) < 0.0001 ? 0:track.values[0 + k],
          Math.abs(track.values[1 + k]) < 0.0001 ? 0:track.values[1 + k],
          Math.abs(track.values[2 + k]) < 0.0001 ? 0:track.values[2 + k],
          Math.abs(track.values[3 + k]) < 0.0001 ? 0:track.values[3 + k]
        );
      
        const eul = new Euler().setFromQuaternion(origQuat);
        
        //const quatArr = origQuat.invert().toArray();
        // for (let j =0; j < quatArr.length;j++){
        //   track.values[k+j] = quatArr[j];
        // }

        const quatArr = new Quaternion().setFromEuler(new Euler(eul.x + modifier.x , -eul.y + modifier.y,eul.z + modifier.z)).toArray();
        for (let j =0; j < quatArr.length;j++){
          track.values[k+j] = quatArr[j];
        }
      }
      newTracks.push(track);
    }
  }
  clip.tracks = newTracks;
  return clip;
}
// const createVRMAnimation = (animation: AnimationClip) =>{

//   const clip = animation.clone();
//   const newTracks = [];
//   for (let i =0; i < clip.tracks.length;i++){
//     const track = clip.tracks[i];
//     if(track instanceof QuaternionKeyframeTrack){
//       let mult = 1;
//       if (track.name.startsWith("leftUpperArm.") || track.name.startsWith("leftUpperArm.")){
//         mult = -1;
//       }
      
//       for (let i =0; i < track.values.length; i +=4){
//         const origQuat = new Quaternion(
//           Math.abs(track.values[0 + i]) < 0.0001 ? 0:track.values[0 + i],
//           Math.abs(track.values[1 + i]) < 0.0001 ? 0:track.values[1 + i],
//           Math.abs(track.values[2 + i]) < 0.0001 ? 0:track.values[2 + i],
//           Math.abs(track.values[3 + i]) < 0.0001 ? 0:track.values[3 + i]
//           );
//         const eul = new Euler().setFromQuaternion(origQuat);
//         const quatArr = new Quaternion().setFromEuler(new Euler(eul.z*mult,eul.y,eul.x*mult)).toArray();

//         for (let j =0; j < quatArr.length;j++){
//           track.values[i+j] = quatArr[j];
//         }
//       }
//       newTracks.push(track);
//     }
//   }
//   clip.tracks = newTracks;
//   return clip;
// }

const update = () => {
  setInterval(() => {
    mixers.forEach((mixer) => {
      mixer.update(1/30);
    });
  }, 1000/30);
}
update()