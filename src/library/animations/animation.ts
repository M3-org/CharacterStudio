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
  vrmanimation = anim.animations[0];
}
export const startAnimation = async (gltf: any):Promise<void> => {
  if (!vrmanimation) return
  // important to do* check mixers and remove those that are no longer active in the scene
  mixer = new AnimationMixer(gltf.scene);
  mixers.push(mixer)
  const time = mixers.length > 0 ? mixers[0].time : 0;
  // temporary comment, to check mesh cull
  mixer.clipAction(vrmanimation).play();
  mixer.setTime(time);
}

const update = () => {
  setInterval(() => {
    mixers.forEach((mixer) => {
      mixer.update(1/30);
    });
  }, 1000/30);
}
update()