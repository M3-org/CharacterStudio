import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { Buffer } from "buffer";
import html2canvas from "html2canvas";
import VRMExporter from "./VRMExporter.js";
import { CullHiddenFaces, DisposeCullMesh } from './cull-mesh.js';
import { combine } from "./merge-geometry.js";
import { MToonMaterial, VRM, VRMExpressionBind, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { VRMHumanBoneName } from "@pixiv/three-vrm";
import { avatarData } from "./characterManager.js";

type AsArray<T> = T extends Array<infer U> ? U[] : T[];

export function getAsArray<T>(target: T): AsArray<T> {
  if (target == null || target == undefined) return [] as unknown as AsArray<T>
  return (Array.isArray(target) ? target : [target]) as AsArray<T>
}

export function addChildAtFirst(parent:THREE.Group, newChild:THREE.Object3D) {
  // Store the current children of the parent
  let currentChildren = parent.children.slice();

  // Clear all children from the parent
  currentChildren.forEach(child => parent.remove(child));

  // Add the new child at the first position
  parent.add(newChild);

  // Re-add the original children
  currentChildren.forEach(child => parent.add(child));
}

export async function setTextureToChildMeshes(scene:THREE.Group, url:string){
  const textureLoader = new THREE.TextureLoader();

  // Load the image as a texture
  const texture = await textureLoader.load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;

  // Traverse through the child meshes in the scene
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const materials = !Array.isArray(object.material) ? [object.material] : object.material
      // Assign the texture to the material
      for (let i = 0; i < materials.length; i++) {
        if (materials[i] instanceof THREE.ShaderMaterial) {
          if(!materials[i].name.includes("(Outline)")){
            console.log(materials[i].name);
            materials[i].uniforms.map.value = texture
            materials[i].uniforms.shadeMultiplyTexture.value = texture;
          }
        }
        else{
          materials[i].map = texture
          materials[i].emissiveMap = texture
        }
        materials[i].needsUpdate = true
      }
    }
  });
}

export function getFileNameWithoutExtension(filePath: string) {
  // Get the base file name without the extension
  const baseFileName = filePath.replace(/^.*[\\/]/, '').split('.').slice(0, -1).join('.');

  return baseFileName;
}

export function getRandomObjectKey (obj:Record<string,any>) {
  const arr = Object.keys(obj);
  return obj[arr[Math.floor(Math.random() * arr.length)]];
}
export function getRandomArrayValue (arr:any[]){
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function loadModel(file:string, onProgress: (progress: ProgressEvent) => void = () => {}) {
  const gltfLoader = new GLTFLoader()
  gltfLoader.register((parser) => {
    return new VRMLoaderPlugin(parser)
  })
  return gltfLoader.loadAsync(file, onProgress).then((model) => {
    const vrm = model.userData.vrm as VRM
    renameVRMBones(vrm)

    vrm.scene?.traverse((child) => {
      child.frustumCulled = false
    })
    return vrm
  })
}

export const cullHiddenMeshes = (avatar:Record<string,avatarData>) => {
  const models:(THREE.Mesh|THREE.SkinnedMesh)[] = []
  for (const property in avatar) {
    const typedProperty = property as keyof typeof avatar
    const vrm = avatar[typedProperty]?.vrm as VRM
    if (vrm) {
      const cullLayer = (vrm as any).data.cullingLayer
      if( vrm.scene.visible === false) continue
      if (cullLayer >= 0) { 
        (vrm as any).data.cullingMeshes.map((mesh:THREE.Mesh)=>{
          mesh.userData.cullLayer = cullLayer
          mesh.userData.cullDistance = (vrm as any).data.cullingDistance
          mesh.userData.maxCullDistance = (vrm as any).data.maxCullingDistance
          models.push(mesh)
        })
      }
    }
  }
  CullHiddenFaces(models as any[])
}

export function getMeshesSortedByMaterialArray(meshes:(THREE.Mesh | THREE.SkinnedMesh)[]){
  const stdMesh:(THREE.SkinnedMesh | THREE.Mesh)[] = [];
  const stdTranspMesh:(THREE.SkinnedMesh | THREE.Mesh)[] = [];
  const mToonMesh:(THREE.SkinnedMesh | THREE.Mesh)[] = [];
  const mToonTranspMesh:(THREE.SkinnedMesh | THREE.Mesh)[] = [];
  let requiresTransparency = false;

  meshes.forEach(mesh => {
    const mats = getAsArray(mesh.material);
    const mat = mats[0];
    
    if (mat.type == "ShaderMaterial"){
        if (mat.transparent == true){
          mToonTranspMesh.push(mesh);
          requiresTransparency = true;
        }
        else{
          mToonMesh.push(mesh);
          if ((mat as MToonMaterial).uniforms.alphaTest?.value != 0)
            requiresTransparency = true
        }
    }
    else{
        if (mat.transparent == true){
          stdTranspMesh.push(mesh);
          requiresTransparency = true;
        }
        else{
          stdMesh.push(mesh); 
          if (mat.alphaTest != 0)
            requiresTransparency = true;
        }
    }
  });
  return {stdMesh, stdTranspMesh, mToonMesh, mToonTranspMesh, requiresTransparency}
}

export function getMaterialsSortedByArray (meshes:THREE.Mesh[] | THREE.SkinnedMesh[]){
  const stdMats:THREE.Material[] = [];
  const stdCutoutpMats:THREE.Material[] = [];
  const stdTranspMats:THREE.Material[] = [];
  const mToonMats:THREE.ShaderMaterial[] = [];
  const mToonCutoutMats:THREE.ShaderMaterial[] = [];
  const mToonTranspMats:THREE.ShaderMaterial[] = [];

  meshes.forEach(mesh => {
    const mats = getAsArray(mesh.material);
    mats.forEach(mat => {
      if (mat.type == "ShaderMaterial"){
        const typedMat = mat as THREE.ShaderMaterial;
          if (mat.transparent == true)
            mToonTranspMats.push(typedMat);
          else if (typedMat.uniforms?.alphaTest.value != 0)
            mToonCutoutMats.push(typedMat);
          else
            mToonMats.push(typedMat);
      }
      else{
          if (mat.transparent == true)
            stdTranspMats.push(mat);
          else if (mat.alphaTest != 0)
            stdCutoutpMats.push(mat);
          else
            stdMats.push(mat);
              
      }
    });
  });


  return { stdMats, stdCutoutpMats, stdTranspMats , mToonMats, mToonCutoutMats , mToonTranspMats }
}

/**
 * @dev UNUSED ? To delete?
 * */
export async function getModelFromScene(modelScene:any,avatar:Record<string,avatarData>, format = 'glb', skinColor = new THREE.Color(1, 1, 1), scale = 1) {
  if (format && format === 'glb') {
    const exporter = new GLTFExporter();
    const options = {
      trs: false,
      onlyVisible: true,
      truncateDrawRange: true,
      binary: true,
      forcePowerOfTwoTextures: false,
      maxTextureSize: 1024 
    };

    const avatarCombined = await combine(modelScene,avatar,{ transparentColor: skinColor, scale:scale });

    const glb = await new Promise((resolve) => exporter.parse(avatarCombined, resolve, (error) => console.error("Error getting model", error), options));
    return new Blob([glb as any], { type: 'model/gltf-binary' });
  } else if (format && format === 'vrm') {
    const exporter = new VRMExporter();
    const vrm = await new Promise((resolve) => exporter.parse(modelScene, resolve));
    return new Blob([vrm  as any], { type: 'model/gltf-binary' });
  } else {
    return console.error("Invalid format");
  }
}

export async function getScreenShot(elementId:string, delay = 0) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return await getScreenShotByElementId(elementId);
}


export async function getCroppedScreenshot(elementId:string, posX:number, posY:number, width:number, height:number, debug = false){
  const snapShotElement = document.getElementById(elementId);
  if(!snapShotElement) throw new Error("Element not found: "+ elementId);
  
  return await html2canvas(snapShotElement).then(async function (canvas) {

    var dataURL = canvas.toDataURL("image/jpeg", 1.0);

    const tempcanvas = document.createElement("canvas");
    tempcanvas.width = width;
    tempcanvas.height = height;
    const tempctx = tempcanvas.getContext("2d");

    let image = new Image();
    image.src = dataURL;

    await tempctx?.drawImage(canvas, posX, posY, width, height, 0,0, width, height)

    var newdataurl = tempcanvas.toDataURL("image/jpeg", 1.0);
    const base64Data = Buffer.from(
      newdataurl.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );


    const blob = new Blob([base64Data], { type: "image/jpeg" });

    if (debug){
      const link = document.createElement("a")
      link.style.display = "none"
      document.body.appendChild(link)
      link.href = URL.createObjectURL(blob)
      link.download = "test.jpeg"
      link.click()
    }

    return blob;
  });
}

async function getScreenShotByElementId(id:string) {

  const snapShotElement = document.getElementById(id);
  if(!snapShotElement) throw new Error("Element not found: "+ id);
  return await html2canvas(snapShotElement).then(async function (canvas) {

    var dataURL = canvas.toDataURL("image/jpeg", 1.0);
    // const base64Data = Buffer.from(
    //   dataURL.replace(/^data:image\/\w+;base64,/, ""),
    //   "base64"
    // );

    const tempcanvas = document.createElement("canvas");
    tempcanvas.width = 256;
    tempcanvas.height = 256;
    const tempctx = tempcanvas.getContext("2d");

    let image = new Image();
    image.src = dataURL;

    //const ctx = canvas.getContext("2d")
    await tempctx?.drawImage(canvas, 500, 100, 256, 256, 0,0, 256, 256)

    var newdataurl = tempcanvas.toDataURL("image/jpeg", 1.0);
    const base64Data = Buffer.from(
      newdataurl.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );


    const blob = new Blob([base64Data], { type: "image/jpeg" });

    const link = document.createElement("a")
    link.style.display = "none"
    document.body.appendChild(link)
    link.href = URL.createObjectURL(blob)
    link.download = "test.jpeg"
    link.click()

    return blob;
  });
}


export async function getSkinColor(scene:THREE.Group, targets:string[]) {
  for (const target of targets) {
    const object = scene.getObjectByName(target);
    if (object != null) {
      if ('isGroup' in object && object.isGroup) {
        const child = object.children[0];
        //@ts-ignore
        const mat = child.material.length ? child.material[0] : child.material;
        if (mat.uniforms != null) {
          return mat.uniforms.litFactor.value;
        }
      }
      else {
        //@ts-ignore
        const mat = object.material.length ? object.material[0] : object.material;
        if (mat.uniforms != null) {
          return mat.uniforms.litFactor.value;
        }
      }
    }
  }
}

export async function setMaterialColor(scene:THREE.Scene, value:number, target:string) {
  const object = scene.getObjectByName(target);
  if(!object) return console.error("Object not found, target: ", target);
  const randColor = value;
  const skinShade = new THREE.Color(randColor).convertLinearToSRGB();
  if(!(object as any).material){
    console.error("Material not found in object: ", object);
    return;
  }
  const mat = (object as any).material.length ? (object as any).material[0] : (object as any).material;
  mat.uniforms.litFactor.value.set(skinShade);
  const hslSkin = { h: 0, s: 0, l: 0 };
  skinShade.getHSL(hslSkin);
}

//make sure to remove this data when downloading, as this data is only required while in edit mode
export function addModelData(model:VRM, data:Record<string,any>) {
  if ((model as any).data == null)
    (model as any).data = data;

  else
  (model as any).data = { ...(model as any).data, ...data };
}
function getModelProperty(model:THREE.Object3D, property:string) {
  if ((model as any).data == null)
    return;

  return (model as any).data[property];
}

function disposeData(vrm:THREE.Object3D){
  // const animationControl = (getModelProperty(vrm, "animationControl"));
  // if (animationControl)
  //   animationControl.dispose();
  const cullingMeshes = (getModelProperty(vrm, "cullingMeshes"))
  if (cullingMeshes){
    cullingMeshes.forEach((mesh:THREE.Mesh) => {
      DisposeCullMesh(mesh);
    });
    (vrm as any).data.cullingMeshes = null;
  }
}

export function getAtlasSize(value:number){
  switch (value){
    case 1:
      return 128;
    case 2:
      return 256;
    case 3:
      return 512;
    case 4:
      return 1024;
    case 5:
      return 2048;
    case 6:
      return 4096;
    case 7:
      return 8192;
    case 8:
      return 16384;
    default:
      return 4096;
  }
}

function disposeMesh(mesh:THREE.Mesh){
  if (mesh.isMesh){
    mesh.geometry.userData.faceNormals = null;
    
    mesh.geometry.dispose();
    if (mesh.parent) {
      mesh.parent.remove(mesh);
    }
    if (mesh.userData.cancelMesh){
      disposeMesh(mesh.userData.cancelMesh)
    }
  }
}


export function disposeVRM(vrm:VRM) {
  const model = (vrm as any).scene;
  disposeData(vrm as unknown as THREE.Object3D)

  model.traverse((o:THREE.Mesh|THREE.Group) => {
    if ('material' in o && !!o.material) {
      disposeMaterial(o.material as THREE.MeshStandardMaterial);
    }


    if ('geometry' in o && !!o.geometry) {
      DisposeCullMesh(o);
      o.geometry.dispose();
      'disposeBoundsTree' in o.geometry && (o.geometry as any).disposeBoundsTree();
    }
  });
  

  if (model.parent) {
    model.parent.remove(model);
  }

  VRMUtils.deepDispose( model );

  if (vrm.expressionManager){
    vrm.expressionManager.expressions.forEach(expression => {
      if ((expression as any)._binds){
        (expression as any)._binds.forEach((bind:VRMExpressionBind) => {
          if ('primitives' in bind && (bind as any).primitives){
            (bind.primitives as any[]).forEach((primitive:any) => {
              primitive.geometry.dispose();
              if (primitive.material)disposeMaterial(primitive.material);
            });
          }
        });
      }
    });
  }
  for (const prop in vrm){
    (vrm as any)[prop] = null;
  }
}

export const disposeMaterial = (material:THREE.MeshStandardMaterial|THREE.MeshStandardMaterial[]) =>{
  if ('length' in material){
    for (let i = 0; i < material.length; ++i) {
      disposeMaterial(material[i]);
    }
  }
  else{
    if (material.map?.dispose)material.map.dispose();
    if (material.normalMap?.dispose)material.normalMap.dispose();
    if ((material as any).ormMap?.dispose)(material as any).ormMap.dispose();
    if (material.aoMap?.dispose)material.aoMap.dispose();
    if (material.roughnessMap?.dispose)material.roughnessMap.dispose();
    if (material.metalnessMap?.dispose)material.metalnessMap.dispose();
    material.dispose();
  }
}

export const saveTextFile = (textContent:string, filename:string) => {
  const blob = new Blob([textContent], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename + ".txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const getVectorCameraPosition = (cameraPosition:number[]|string) => {

  let x,y,z = 0
  if (Array.isArray(cameraPosition)){
      x = cameraPosition[0]||0;
      y = cameraPosition[1]||0;
      z = cameraPosition[2]||0;
      
  }
  else if (typeof cameraPosition === 'string'){
      
      const positionString = cameraPosition.split('-');
      positionString.forEach(pos => {
          pos = pos.toLowerCase();
          switch (pos){
              case "left":
                  x = -1
                  break;
              case "right":
                  x = 1
                  break;
              case "bottom":
              case "down":
                  y = -1
                  break;
              case "top":
              case "up":
                  y = 1
                  break;
              case "back":
              case "backward":
                  z = -1
                  break;
              case "front":
              case "forward":
                  z = 1
                  break;
              default:
                  console.warn("unkown cameraPosition name: " + pos + " in: " + cameraPosition +". Please use left, right, bottom, top, back or front")
                  break;
          }
      });
  }
  return new THREE.Vector3(x,y,z);
}

export const createBoneDirection = (skinMesh:THREE.SkinnedMesh) => {
  const geometry = skinMesh.geometry;

  const pos = geometry.attributes.position.array;
  const normals = geometry.attributes.normal.array;

  // set by jumps of 4
  const bnIdx = geometry.attributes.skinIndex.array;
  const bnWeight = geometry.attributes.skinWeight.array;

  const boneDirections = [];

  const boneTargetPos = new THREE.Vector3(); // to reuse
  const vertexPosition = new THREE.Vector3(); // to reuse

  // bones arrangement:
  // 0 vertical (x,z) bone,
  // 1 horizontal (y,z) bone
  // 2 all sides (x,y,z) bone,
  const bonesArrange = [];
  for (let i = 0; i < skinMesh.skeleton.bones.length; i++) {
    if (skinMesh.skeleton.bones[i].name.includes("Shoulder")) {
      bonesArrange[i] = 3;
    }
    else if (skinMesh.skeleton.bones[i].name.includes("Arm") ||
      skinMesh.skeleton.bones[i].name.includes("Hand") ||
      skinMesh.skeleton.bones[i].name.includes("Index") ||
      skinMesh.skeleton.bones[i].name.includes("Little") ||
      skinMesh.skeleton.bones[i].name.includes("Middle") ||
      skinMesh.skeleton.bones[i].name.includes("Ring") ||
      skinMesh.skeleton.bones[i].name.includes("Thumb"))
      bonesArrange[i] = 1;

    // else if (skinMesh.skeleton.bones[i].name.includes("Foot") || 
    //       skinMesh.skeleton.bones[i].name.includes("Toes"))
    //   bonesArrange[i] = 3; 
    else if (skinMesh.skeleton.bones[i].name.includes("Foot") ||
      skinMesh.skeleton.bones[i].name.includes("Toes"))
      bonesArrange[i] = 3;

    else
      bonesArrange[i] = 0;
  }

  for (let f = 0; f < (bnIdx.length / 4); f++) {
    const idxBnBase = f * 4;
    // get the highest weight value
    let highIdx = bnIdx[idxBnBase];
    for (let i = 0; i < 4; i++) {
      if (bnWeight[highIdx] < bnWeight[idxBnBase + i]) {
        highIdx = bnIdx[idxBnBase + i];
      }
    }
    //console.log(highIdx)
    //once we have the highest value, we get the bone position to later get the direction
    // now get the vertex 
    const idxPosBase = f * 3;
    vertexPosition.set(
      pos[idxPosBase],
      pos[idxPosBase + 1],
      pos[idxPosBase + 2] //z
    );

    // get the position of the bones, but ignore y or z in some cases, as this will be dfined by the vertex positioning
    switch (bonesArrange[highIdx]) {
      case 0: // 0 vertical (x,z) bone,
        boneTargetPos.set(
          skinMesh.skeleton.bones[highIdx].getWorldPosition(new THREE.Vector3()).x,
          vertexPosition.y,
          skinMesh.skeleton.bones[highIdx].getWorldPosition(new THREE.Vector3()).z);
        break;
      case 1: // 1 horizontal (y,z) bone
        boneTargetPos.set(
          vertexPosition.x,
          //skinMesh.skeleton.bones[highIdx].getWorldPosition(new THREE.Vector3()).x,
          skinMesh.skeleton.bones[highIdx].getWorldPosition(new THREE.Vector3()).y,
          skinMesh.skeleton.bones[highIdx].getWorldPosition(new THREE.Vector3()).z);
        //vertexPosition.z);
        break;
      case 2: // 2 all sides (x,y,z) bone,
        boneTargetPos.set(
          skinMesh.skeleton.bones[highIdx].getWorldPosition(new THREE.Vector3()).x,
          skinMesh.skeleton.bones[highIdx].getWorldPosition(new THREE.Vector3()).y,
          skinMesh.skeleton.bones[highIdx].getWorldPosition(new THREE.Vector3()).z);

        break;
      case 3: //
        //nothing, the direction will be taken from vertex normals
        break;
      default:
        break;
    }

    // calculate the direction from  *boneTargetPos to *vertexPosition
    const dir = new THREE.Vector3();
    if (bonesArrange[highIdx] !== 3)
      dir.subVectors(vertexPosition, boneTargetPos).normalize();

    else
      dir.set(
        normals[idxPosBase],
        normals[idxPosBase + 1],
        normals[idxPosBase + 2]); //z

    //we have now the direction from the vertex to the bone
    boneDirections.push(dir);
  }
  geometry.userData.boneDirections = boneDirections;
};

export const getUniqueId = () => {
  const timestamp = new Date().getTime();

  const random = Math.random().toString(36).substr(2, 9); // Using base36 encoding

  const uniqueId = timestamp + '-' + random;

  return uniqueId;
}

export const renameVRMBones = (vrm:VRM) => {
  const bones = vrm.humanoid.humanBones;
  if(!bones['hips'].node.parent) throw new Error("Hips bone has no parent, make sure to define a parent bone for the hips bone");
  
  bones['hips'].node.parent.name = "rootBone";
  // // if user didnt define upprChest bone just make sure its not included
  if (bones['upperChest'] == null){
    // just check if the parent bone of 'neck' is 'chest', this would mean upperChest doesnt exist, 
    // but if its not, it means there is an intermediate bone, which should be upperChest, make sure to define it iof thats the case
    //@ts-ignore
    if (bones['neck'].node.parent != bones['chest']){
      // sometimes the user defines the upperchest bone as the chest bone, make sure this is not the case
      if (bones['neck']?.node.parent != bones['chest']!.node) {
        bones['upperChest'] = {node:bones['neck']!.node.parent!}
      }
      // if its the case, reassign bones
      else{
        if (bones['upperChest'] != null ){
          bones['upperChest'] = {node:bones['neck']!.node.parent}
          bones['chest'] = {node:bones['neck']!.node.parent.parent!}
        }
      }
    }
  }
  // same ase before, left and right shoulder are optional vrm bones, make sure that if they are missing they are not included
  if (bones ['leftShoulder'] == null){
    if (bones['leftUpperArm'].node.parent != bones['chest']?.node && 
      bones['leftUpperArm'].node.parent != bones['upperChest']?.node  && 
      bones['leftUpperArm'].node.parent != bones['spine']?.node  &&
      bones['leftUpperArm'].node.parent != bones['neck']?.node  &&
      bones['leftUpperArm'].node.parent != bones['head']?.node ){
    }{
      bones['leftShoulder'] = {node:bones['leftUpperArm'].node.parent!}
    }
  }

  if (bones ['rightShoulder'] == null){
    if (bones['rightUpperArm'].node.parent != bones['chest']?.node && 
      bones['rightUpperArm'].node.parent != bones['upperChest']?.node  && 
      bones['rightUpperArm'].node.parent != bones['spine']?.node  &&
      bones['rightUpperArm'].node.parent != bones['neck']?.node  &&
      bones['rightUpperArm'].node.parent != bones['head']?.node ){
    }{
      bones['rightShoulder'] = {node:bones['rightUpperArm'].node.parent!}
    }
  }
  // fix for when user set the root bone as hips bone instead of hips
  // if (bones["spine"].node.parent != bones["hips"].node){
  //   bones["hips"] = {node:bones['spine'].node.parent}
  // }
  // if (bones["hips"].node.parent != vrm.scene){
  //   vrm.scene.add(bones["hips"].node);
  //   console.log(bones["hips"].node);
  //   // = vrm.scene;
  // }

  for (let boneName in VRMHumanBoneName) {
    boneName = boneName.charAt(0).toLowerCase() + boneName.slice(1)
    if (bones[boneName as VRMHumanBoneName]?.node){
      bones[boneName as VRMHumanBoneName]!.node.name = boneName;
    }
    else{
      // bones[boneName] = {
      //   node:new THREE.Bone()
      // }
      // bones[boneName].node.name = boneName;
      // const parentBoneName = VRMHumanBoneParentMap[boneName]
      // if (parentBoneName){
      //   console.log("adds" +  boneName);
      //   // add instead of attach, so new node has the same position as parent
      //   bones[parentBoneName].node.add(bones[boneName].node)
      // }
    }
  }

  // for (const boneName in bones) {
  //   const parentBoneName = VRMHumanBoneParentMap[boneName]
  //   if (parentBoneName && bones[boneName].node.parent != bones[parentBoneName].node){
  //     bones[parentBoneName].node.attach(bones[boneName].node)
  //   }
  // }
  
  // const bonesArr = [];
  // for (const b in bones){
  //   bonesArr.push(bones[b].node);
  // }
  // const newSkeleton = new THREE.Skeleton(bonesArr);

  // console.log(newSkeleton);
  // vrm.scene.traverse((c)=>{
  //   if (c.isSkinnedMesh){
  //     const origSkeleton = c.skeleton;
  //     c.skeleton  = new THREE.Skeleton(origSkeleton.bones);
  //   }
  // })

};

export function findChild({ candidates, predicate }:{candidates:THREE.Object3D[], predicate:(o:THREE.Object3D)=>boolean}) {
    if (!candidates.length) {
        return null;
    }
    const candidate = candidates.shift();
    if(!candidate){
      return null
    }
    if (predicate(candidate))
        return candidate;
    candidates = candidates.concat(candidate.children);
    return findChild({ candidates, predicate });
}
export function findChildByName(root:THREE.Object3D, name:string) {
    return findChild({
        candidates: [root],
        predicate: (o) => o.name === name,
    });
}
export function findChildByType(root:THREE.Object3D, type:string) {
    return findChild({
        candidates: [root],
        predicate: (o) => o.type === type,
    });
}
function findChildren({ candidates, predicate, results = [] }:{candidates:THREE.Object3D[], predicate:(o:THREE.Object3D)=>boolean, results?:THREE.Object3D[]}) {
    if (!candidates.length) {
        return results;
    }
    const candidate = candidates.shift();
    if(!candidate){
      return results
    }
    if (predicate(candidate)) {
        results.push(candidate);
    }
    candidates = candidates.concat(candidate.children);
    return findChildren({ candidates, predicate, results });
}
export function findChildrenByType<T extends THREE.Object3D | THREE.SkinnedMesh | THREE.Mesh>(root:THREE.Object3D, types:string|string[]) {
  
  return findChildren({
    candidates: [root],
    predicate: (o) => getAsArray(types).includes(o.type),
  }) as T[];
}




// function getVRMDefaultLookAt(){
//   return {
//     offsetFromHeadBone:[0,0,0],
//     applier:{
//       rangeMapHorizontalInner:{
//         inputMaxValue:90,
//         inputSacle:62.1
//       },
//       rangeMapHorizontalOuter:{
//         inputMaxValue:90,
//         inputSacle:68.6
//       },
//       rangeMapVerticalDown:{
//         inputMaxValue:90,
//         inputSacle:57.9
//       },
//       rangeMapVerticalUp:{
//         inputMaxValue:90,
//         inputSacle:52.8
//       }
//     },
//     type:"bone"
//   }

// }

function traverseWithDepth({ object3D, depth = 0, callback, result }:{ object3D: THREE.Object3D, depth?: number, callback: (object3D: THREE.Object3D|THREE.SkinnedMesh|THREE.Bone, depth: number) => string, result: string[] } ){
    result.push(callback(object3D, depth));
    const children = object3D.children;
    for (let i = 0; i < children.length; i++) {
        traverseWithDepth({ object3D: children[i], depth: depth + 1, callback, result });
    }
    return result;
}
const describe = (function () {
    const prefix = "  ";
    return function describe(object3D:THREE.Object3D|THREE.SkinnedMesh|THREE.Bone, indentation:number) {

        const description = `${object3D.type} | ${object3D.name} | ${JSON.stringify(object3D.userData)}`;
        let firstBone = "";
        if (object3D.type === "SkinnedMesh") {
            firstBone = "\n"
                .concat(prefix.repeat(indentation))
                .concat("First bone id: ")
                .concat((object3D as THREE.SkinnedMesh).skeleton.bones[0].uuid);
        }
        let boneId = "";
        if (object3D.type === "Bone") {
            boneId = "\n".concat(prefix.repeat(indentation)).concat("Bone id: ").concat(object3D.uuid);
        }
        return prefix.repeat(indentation).concat(description).concat(firstBone).concat(boneId);
    };
})();
export function describeObject3D(root:THREE.Object3D|THREE.SkinnedMesh|THREE.Bone) {
    return traverseWithDepth({ object3D: root, callback: describe, result: [] }).join("\n");
}


/**
 * 
 * @param {THREE.Mesh} mesh 
 * @param {{[key:string]:{
 * index:number,
 * primitives:number[]
 *}}} oldDictionary 
 * @returns 
 */
export function doesMeshHaveMorphTargetBoundToManager(
  mesh: THREE.Mesh,
  oldDictionary: {
    [key: string]: {
      index: number;
      primitives: number[];
    };
  }
  ) {
    if (!mesh.morphTargetDictionary) return false;

    for (const key of Object.keys(mesh.morphTargetDictionary)) {
      if (oldDictionary[key]) {
        return true;
      }
    }
  return false;
}


export function createContext({ width, height, transparent }:{width:number, height:number, transparent:boolean}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if(!context) throw new Error("Could not create 2d context");
  context.fillStyle = "white";
  if (transparent) 
    context.globalAlpha = 0;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = 1;
  return context;
}