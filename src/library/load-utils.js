import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { renameVRMBones } from "../library/utils"

export const loadVRM = async(url) => {
    const gltfLoader = new GLTFLoader()
    gltfLoader.crossOrigin = 'anonymous';
    gltfLoader.register((parser) => {
      //return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true, helperRoot:vrmHelperRoot})
      return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true})
    })
    // rotate?
    
    const vrm = await gltfLoader.loadAsync(url);
    console.log(vrm);
    if (vrm.userData?.vrmMeta?.metaVersion === '0'){
      vrm.scene.rotation.y = Math.PI;
      vrm.scene.traverse((child)=>{
        if (child.isSkinnedMesh) {
          child.userData.isVRM0 = true;
          for (let i =0; i < child.skeleton.bones.length;i++){
            child.skeleton.bones[i].userData.vrm0RestPosition = { ... child.skeleton.bones[i].position }
          }
        }
      })
    }
    URL.revokeObjectURL(url);
    return vrm;
}

export const addVRMToScene = (vrm, scene) => {
  const vrmData = vrm.userData.vrm;
  renameVRMBones(vrmData);
  console.log(vrmData);

  if (vrm && scene){
    console.log("add to scene")
    scene.attach(vrm.scene)

    
  }
}
   