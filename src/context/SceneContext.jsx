import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMLoaderPlugin } from "@pixiv/three-vrm"
import { renameVRMBones, createFaceNormals, createBoneDirection } from "../library/utils";

const loader = new GLTFLoader();
loader.register((parser) => {
  return new VRMLoaderPlugin(parser);
});

export async function loadModel(file, onProgress) {
  return loader.loadAsync(file, onProgress).then((model) => {
    
    const vrm = model.userData.vrm;
    renameVRMBones(vrm);

    model.scene.traverse((node) => {
      if (node.isMesh) {
        node.material.map.encoding = THREE.sRGBEncoding;
      }
    });

    vrm.scene?.traverse((child)=>{
  
      child.frustumCulled = false
  
      if (child.isMesh){
        createFaceNormals(child.geometry)
        if (child.isSkinnedMesh)
          createBoneDirection(child);
    }
  });
    return vrm;
  });
}