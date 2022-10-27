import {AnimationMixer, Euler, Quaternion, AnimationClip, QuaternionKeyframeTrack, VectorKeyframeTrack, Vector3} from 'three'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

const mixers: any = []
let vrmanimation, mixer
export const loadAnimation = async (path: string):Promise<void>=> {
  const loader = new GLTFLoader()
  const animGltf = await loader.loadAsync(path)
  vrmanimation = createVRMAnimation(animGltf.animations[0]);
}
export const startAnimation = async (gltf: any):Promise<void> => {
  if (!vrmanimation) return
  // check mixers and remove those that are no longer active in the scene
  mixer = new AnimationMixer(gltf.scene);
  mixers.push(mixer)
  const time = mixers.length > 0 ? mixers[0].time : 0;
  mixer.clipAction(vrmanimation).play();
  mixer.setTime(time);
}
const createVRMAnimation = (animation: AnimationClip) =>{

  const clip = animation.clone();
  const newTracks = [];
  for (let i =0; i < clip.tracks.length;i++){
    const track = clip.tracks[i];
    if(track instanceof QuaternionKeyframeTrack){
      let mult = 1;
      if (track.name.startsWith("leftUpperArm.") || track.name.startsWith("leftUpperArm.")){
        mult = -1;
      }
      
      for (let i =0; i < track.values.length; i +=4){
        const origQuat = new Quaternion(
          Math.abs(track.values[0 + i]) < 0.0001 ? 0:track.values[0 + i],
          Math.abs(track.values[1 + i]) < 0.0001 ? 0:track.values[1 + i],
          Math.abs(track.values[2 + i]) < 0.0001 ? 0:track.values[2 + i],
          Math.abs(track.values[3 + i]) < 0.0001 ? 0:track.values[3 + i]
          );
        const eul = new Euler().setFromQuaternion(origQuat);
        const quatArr = new Quaternion().setFromEuler(new Euler(eul.z*mult,eul.y,eul.x*mult)).toArray();

        for (let j =0; j < quatArr.length;j++){
          track.values[i+j] = quatArr[j];
        }
      }
      newTracks.push(track);
    }
  }
  clip.tracks = newTracks;
  return clip;
}

const update = () => {
  setInterval(() => {
    mixers.forEach((mixer) => {
      mixer.update(1/30);
    });
  }, 1000/30);
}
update()