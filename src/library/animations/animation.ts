import { Update } from '@mui/icons-material'
import {AnimationMixer } from 'three'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

let mixers: any = []
let animation, timer, mixer
export const loadAnimation = async (path: any) => {
  const loader = new GLTFLoader()
  const animGltf = await loader.loadAsync(path)
  animation = animGltf.animations[0]
}
export const startAnimation = async (gltf: any) => {
  if (!animation) return
  mixers.forEach(mixer => {
    mixer.setTime(0)
  })
  mixer = new AnimationMixer(gltf.scene);
  mixers.push(mixer)
  mixer.clipAction(animation).play();
}

const update = () => {
  timer = setInterval(() => {
    mixers.forEach((mixer) => {
      mixer.update(1/30);
    });
  }, 1000/30);
}
update()