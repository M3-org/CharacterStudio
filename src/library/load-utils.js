import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

export const loadVRM = async(url) => {
    const gltfLoader = new GLTFLoader()
    gltfLoader.crossOrigin = 'anonymous';
    gltfLoader.register((parser) => {
      //return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true, helperRoot:vrmHelperRoot})
      return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true})
    })
    // rotate?
    
    const vrm = await gltfLoader.loadAsync(url);
    URL.revokeObjectURL(url);
    return vrm;
}

export const addVRMToScene = (vrm, scene) => {
  const vrmData = vrm.userData.vrm;
  console.log(vrmData);

  if (vrm && scene){
    console.log("add to scene")
    scene.add(vrm.scene)
  }
}
   