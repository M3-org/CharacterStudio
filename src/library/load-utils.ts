import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import {  GLTF, GLTFLoader, GLTFReference } from "three/examples/jsm/loaders/GLTFLoader"
import { getAsArray, renameVRMBones,getUniqueId } from "../library/utils"
import { findChildByName } from '../library/utils';
import { Mesh, Object3D, PropertyBinding,Scene,SkinnedMesh } from 'three';

export function combineURLs(baseURL:string, relativeURL:string) {
  return relativeURL && baseURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL ? baseURL: relativeURL;
}

export const loadVRM = async(url:string) => {
    const gltfLoader = new GLTFLoader()
    gltfLoader.crossOrigin = 'anonymous';
    gltfLoader.register((parser) => {
      return new VRMLoaderPlugin(parser, {autoUpdateHumanBones: true})
    })
    
    const vrm = await gltfLoader.loadAsync(url);
    if (vrm.userData?.vrmMeta?.metaVersion === '0'){
      vrm.scene.rotation.y = Math.PI;
      vrm.scene.traverse((child)=>{
        if ((child as Mesh).isMesh) {
          child.userData.isVRM0 = true;
          if ((child as SkinnedMesh).isSkinnedMesh){
            for (let i =0; i < (child as SkinnedMesh).skeleton.bones.length;i++){
              (child as SkinnedMesh).skeleton.bones[i].userData.vrm0RestPosition = { ... (child as SkinnedMesh).skeleton.bones[i].position }
            }
          }
        }
      })
    }
    return vrm;
}

export const renameMorphTargets = (gltf:GLTF) => {
  const json = gltf.parser.json
  const meshesJson = json.meshes;
  const associations = gltf.parser.associations

  gltf.scene.traverse((child) => {
    if(child instanceof SkinnedMesh){
      if(child.morphTargetDictionary){
        let hasEditedMorphs = false
        const associationValues = associations.get(child) as GLTFReference & {primitives?:number};
        if(typeof associationValues == 'undefined') return;

        const meshIndex = associationValues!.meshes||0;
        const primitivesIndex = associationValues!.primitives||0;
        const meshJson = meshesJson[meshIndex]

        const primitives = meshJson?.primitives[primitivesIndex]

        if(primitives?.extras?.targetNames){
          const targetNames = primitives.extras.targetNames;
          for (let i = 0; i < targetNames.length; i++){
            // console.log('assigning morphTargetDictionary',targetNames[i])
            child.morphTargetDictionary![targetNames[i]] = i;
            hasEditedMorphs = true;
          }
        }

        if(hasEditedMorphs){
          for(const key in child.morphTargetDictionary){
            if (!isNaN(Number.parseInt(key)) && /^\d+$/.test(key)) {
              delete child.morphTargetDictionary[key]
            }
          }
        }
      }
    }
  })
}
export const addVRMToScene = (vrm:VRM, scene:Scene) => {
  const vrmData = (vrm as any).userData.vrm;
  renameVRMBones(vrmData);

  if (vrm && scene){
    scene.attach(vrm.scene)
  }
}

export const saveVRMCollidersToUserData = (gltf:GLTF) => {
  if (gltf.parser.json.extensions?.VRM){
    saveVRM0Colliders(gltf);
  }
  else if (gltf.parser.json.extensions?.VRMC_vrm){
    saveVRM1Colliders(gltf)
  }
  else{
    console.warn("No valid vrm file was provided")
  }
}

const saveVRM0Colliders = (gltf:GLTF) => {
  const json = gltf.parser.json
  const scene = gltf.scene;
  const nodes = json.nodes;
  const colliderGroups = json.extensions?.VRM?.secondaryAnimation?.colliderGroups;

  const namesUsed:any = [];
  const objectSceneNames = nodes.map((node:any) => uniqueNames(node.name, namesUsed));

  if (colliderGroups != null){
    colliderGroups.forEach((colliderGroup:Record<string,any>) => {
      const nodeName = objectSceneNames[colliderGroup.node]
      const nodeObject = findChildByName(scene, nodeName);
      if (nodeObject != null){
        const colliders = colliderGroup.colliders;
        
        // match to be like vrm 1
        nodeObject.userData.VRMcolliders = colliders.map((collider:any) => (
          {sphere:{
            radius:collider.radius,
            offset:[collider.offset.x,collider.offset.y, collider.offset.z]
          }}));
      }
      // add a unique id so we dont duplicat them later when merging different colliders
      if(nodeObject){
        nodeObject.userData.VRMcollidersID = getUniqueId();
      }
    });
  }
}

const saveVRM1Colliders = (gltf:GLTF) => {
  const json = gltf.parser.json
  const scene = gltf.scene
  const nodes = json.nodes;
  const colliderGroups = json.extensions?.VRMC_springBone?.colliderGroups;
  const colliders = json.extensions?.VRMC_springBone?.colliders;
  // save to vrm data

  const namesUsed:string[] = [];
  const objectSceneNames = nodes.map((node:any) => uniqueNames(node.name, namesUsed));

  if (colliderGroups != null){

    colliderGroups.forEach((colliderGroup:any) => {
      const collidersIndices = getAsArray(colliderGroup.colliders);
      let currentNodeIndex = -1;
      let currentNode:any|null = null;
      collidersIndices.forEach(index => {
        if (currentNodeIndex != colliders[index].node){
          currentNodeIndex = colliders[index].node;
          const nodeName = objectSceneNames[currentNodeIndex]
          currentNode = findChildByName(scene, nodeName);
          currentNode.userData.VRMcolliders = [];
        }
        if (currentNode != null){
          const colliderShape = colliders[index].shape;
          for (const shapeType in colliderShape){
            const shape = colliderShape[shapeType];
            if (shape?.offset){
              shape.offset[0] = -shape.offset[0];
            }
          }
          currentNode.userData.VRMcollidersID = getUniqueId();
          currentNode.userData.VRMcolliders.push(colliderShape)
        }
        else {
          console.error("no node with name " + objectSceneNames[currentNodeIndex] + " was found")
        }
        
      });
    });
  }
}

/**
 * Get the Bones with colliders in userData; these would be from the traits in "colliderTraits" in the manifest
 * @param {VRM} vrm 
 * @returns {Array<THREE.Object3D>} an array of objects with the shape of the colliders
 */
export const getNodesWithColliders = (vrm:VRM)=>{
  const nodes:Object3D[] = [];
  vrm.scene.traverse((child)=>{
    if (child.userData?.VRMcolliders && child.userData.VRMcolliders.length > 0){
      nodes.push(child);
    }
  })
  return nodes;
}

// code from gltf loader, follows the same process of renaming
const uniqueNames = (originalName:string, namesUsed:Record<string,any>) => {
  const sanitizedName = PropertyBinding.sanitizeNodeName(originalName || '');
  if (sanitizedName in namesUsed) {
      return sanitizedName + '_' + (++namesUsed[sanitizedName]);
  } else {
    namesUsed[sanitizedName] = 0;
      return sanitizedName;
  }
}