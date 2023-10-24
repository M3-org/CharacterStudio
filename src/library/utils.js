import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { Buffer } from "buffer";
import html2canvas from "html2canvas";
import VRMExporter from "./VRMExporter";
import { CullHiddenFaces } from './cull-mesh.js';
import { combine } from "./merge-geometry";
import { VRMLoaderPlugin } from "@pixiv/three-vrm"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { VRMHumanBoneName, VRMHumanBoneParentMap } from "@pixiv/three-vrm";

export function getAsArray(target) {
  if (target == null) return []
  return Array.isArray(target) ? target : [target]
}

export async function prepareModel(templateInfo){
  // check the local storage for a JSON of the model
  // if it exists, load it

  // if it doesn't exist, fetch the first trait for each category from the server
  // grab the first trait for each category
  const traits = templateInfo.traits.map((category) => {
    return category.traits[0]
  })

  const returnedTraits = await Promise.all(traits.map((trait) => {
    return loadModel(trait)
  }));
}

export function getFileNameWithoutExtension(filePath) {
  // Get the base file name without the extension
  const baseFileName = filePath.replace(/^.*[\\/]/, '').split('.').slice(0, -1).join('.');

  return baseFileName;
}

export function getRandomObjectKey (obj) {
  const arr = Object.keys(obj);
  return obj[arr[Math.floor(Math.random() * arr.length)]];
}
export function getRandomArrayValue (arr){
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function loadModel(file, onProgress) {
  const gltfLoader = new GLTFLoader()
  gltfLoader.register((parser) => {
    return new VRMLoaderPlugin(parser)
  })
  return gltfLoader.loadAsync(file, onProgress).then((model) => {
    const vrm = model.userData.vrm
    renameVRMBones(vrm)

    vrm.scene?.traverse((child) => {
      child.frustumCulled = false
    })
    return vrm
  })
}

export const cullHiddenMeshes = (avatar) => {
  const models = []
  for (const property in avatar) {
    const vrm = avatar[property].vrm
    if (vrm) {
      const cullLayer = vrm.data.cullingLayer
      if (cullLayer >= 0) { 
        vrm.data.cullingMeshes.map((mesh)=>{
          mesh.userData.cullLayer = cullLayer
          mesh.userData.cullDistance = vrm.data.cullingDistance
          mesh.userData.maxCullDistance = vrm.data.maxCullingDistance
          models.push(mesh)
        })
      }
    }
  }
  CullHiddenFaces(models)
}

export async function getModelFromScene(avatarScene, format = 'glb', skinColor = new THREE.Color(1, 1, 1), scale = 1) {
  if (format && format === 'glb') {
    const exporter = new GLTFExporter();
    const options = {
      trs: false,
      onlyVisible: true,
      truncateDrawRange: true,
      binary: true,
      forcePowerOfTwoTextures: false,
      maxTextureSize: 1024 || Infinity
    };

    const avatar = await combine({ transparentColor: skinColor, avatar: avatarScene, scale:scale });

    const glb = await new Promise((resolve) => exporter.parse(avatar, resolve, (error) => console.error("Error getting model", error), options));
    return new Blob([glb], { type: 'model/gltf-binary' });
  } else if (format && format === 'vrm') {
    const exporter = new VRMExporter();
    const vrm = await new Promise((resolve) => exporter.parse(avatarScene, resolve));
    return new Blob([vrm], { type: 'model/gltf-binary' });
  } else {
    return console.error("Invalid format");
  }
}

export async function getScreenShot(elementId, delay = 0) {
  await new Promise(resolve => setTimeout(resolve, delay));
  return await getScreenShotByElementId(elementId);
}

export async function getCroppedScreenshot(elementId, posX, posY, width, height, debug = false){
  const snapShotElement = document.getElementById(elementId);
  return await html2canvas(snapShotElement).then(async function (canvas) {

    var dataURL = canvas.toDataURL("image/jpeg", 1.0);

    const tempcanvas = document.createElement("canvas");
    tempcanvas.width = width;
    tempcanvas.height = height;
    const tempctx = tempcanvas.getContext("2d");

    let image = new Image();
    image.src = dataURL;

    await tempctx.drawImage(canvas, posX, posY, width, height, 0,0, width, height)

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

async function getScreenShotByElementId(id) {

  const snapShotElement = document.getElementById(id);
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
    await tempctx.drawImage(canvas, 500, 100, 256, 256, 0,0, 256, 256)

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
function createSpecifiedImage(ctx){
  const context = createContext(256,256);
  const imageData = ctx.getImageData(left, top, width, height);
  const arr = new ImageData(imageData, xTileSize, yTileSize);
  const tempcanvas = document.createElement("canvas");
  tempcanvas.width = xTileSize;
  tempcanvas.height = yTileSize;
  const tempctx = tempcanvas.getContext("2d");

  tempctx.putImageData(arr, 0, 0);
  tempctx.save();
  // draw tempctx onto context
  context.drawImage(tempcanvas, min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX, xTileSize, yTileSize);

}

function createContext({ width, height }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  return context;
}

export async function getSkinColor(scene, targets) {
  for (const target of targets) {
    const object = scene.getObjectByName(target);
    if (object != null) {
      if (object.isGroup) {
        const child = object.children[0];
        const mat = child.material.length ? child.material[0] : child.material;
        if (mat.uniforms != null) {
          return mat.uniforms.litFactor.value;
        }
      }
      else {
        const mat = object.material.length ? object.material[0] : object.material;
        if (mat.uniforms != null) {
          return mat.uniforms.litFactor.value;
        }
      }
    }
  }
}

export async function setMaterialColor(scene, value, target) {
  const object = scene.getObjectByName(target);
  const randColor = value;
  const skinShade = new THREE.Color(randColor).convertLinearToSRGB();
  const mat = object.material.length ? object.material[0] : object.material;
  mat.uniforms.litFactor.value.set(skinShade);
  const hslSkin = { h: 0, s: 0, l: 0 };
  skinShade.getHSL(hslSkin);
}

//make sure to remove this data when downloading, as this data is only required while in edit mode
export function addModelData(model, data) {
  if (model.data == null)
    model.data = data;

  else
    model.data = { ...model.data, ...data };
}
function getModelProperty(model, property) {
  if (model.data == null)
    return;

  return model.data[property];
}

export function disposeVRM(vrm) {
  const model = vrm.scene;
  const animationControl = (getModelProperty(vrm, "animationControl"));
  if (animationControl)
    animationControl.dispose();

  model.traverse((o) => {
    if (o.geometry) {
      o.geometry.dispose();
    }

    if (o.material) {
      if (o.material.length) {
        for (let i = 0; i < o.material.length; ++i) {
          o.material[i].dispose();
        }
      }
      else {
        o.material.dispose();
      }
    }
  });

  if (model.parent) {
    model.parent.remove(model);
  }
}
export const createFaceNormals = (geometry) => {
  const pos = geometry.attributes.position;
  const idx = geometry.index;

  const tri = new THREE.Triangle(); // for re-use
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(); // for re-use

  const faceNormals = [];

  //set foreach vertex
  for (let f = 0; f < (idx.array.length / 3); f++) {
    const idxBase = f * 3;
    a.fromBufferAttribute(pos, idx.getX(idxBase + 0));
    b.fromBufferAttribute(pos, idx.getX(idxBase + 1));
    c.fromBufferAttribute(pos, idx.getX(idxBase + 2));
    tri.set(a, b, c);
    faceNormals.push(tri.getNormal(new THREE.Vector3()));
  }
  geometry.userData.faceNormals = faceNormals;
};
export const createBoneDirection = (skinMesh) => {
  const geometry = skinMesh.geometry;

  const pos = geometry.attributes.position.array;
  //console.log(geometry)
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
export const renameVRMBones = (vrm) => {
  const bones = vrm.humanoid.humanBones;
  for (let boneName in VRMHumanBoneName) {
    boneName = boneName.charAt(0).toLowerCase() + boneName.slice(1)
    if (bones[boneName]?.node){
      bones[boneName].node.name = boneName;
    }
    else{
      bones[boneName] = {
        node:new THREE.Bone()
      }
      bones[boneName].node.name = boneName;
    }
  }
  for (const boneName in bones) {
    const parentBoneName = VRMHumanBoneParentMap[boneName]
    if (parentBoneName)
      bones[parentBoneName].node.add(bones[boneName].node)
  }
};

export function findChild({ candidates, predicate }) {
    if (!candidates.length) {
        return null;
    }
    const candidate = candidates.shift();
    if (predicate(candidate))
        return candidate;
    candidates = candidates.concat(candidate.children);
    return findChild({ candidates, predicate });
}
export function findChildByName(root, name) {
    return findChild({
        candidates: [root],
        predicate: (o) => o.name === name,
    });
}
export function findChildByType(root, type) {
    return findChild({
        candidates: [root],
        predicate: (o) => o.type === type,
    });
}
function findChildren({ candidates, predicate, results = [] }) {
    if (!candidates.length) {
        return results;
    }
    const candidate = candidates.shift();
    if (predicate(candidate)) {
        results.push(candidate);
    }
    candidates = candidates.concat(candidate.children);
    return findChildren({ candidates, predicate, results });
}
export function findChildrenByType(root, type) {
    return findChildren({
        candidates: [root],
        predicate: (o) => o.type === type,
    });
}
export function getAvatarData (avatarModel, modelName, vrmMeta){
  const skinnedMeshes = findChildrenByType(avatarModel, "SkinnedMesh")
  return{
    humanBones:getHumanoidByBoneNames(skinnedMeshes[0]),
    materials : [avatarModel.userData.atlasMaterial],
    meta : getVRMMeta(modelName, vrmMeta)
  }

}


function getVRMMeta(name, vrmMeta){
  vrmMeta = vrmMeta||{}

  const defaults = {
    authors:["CharacterCreator"],
    metaVersion:"1",
    version:"v1",
    name:name,
    licenseUrl:"https://vrm.dev/licenses/1.0/",
    commercialUssageName: "personalNonProfit",
    contactInformation: "https://webaverse.com/", 
    allowExcessivelyViolentUsage:false,
    allowExcessivelySexualUsage:false,
    allowPoliticalOrReligiousUsage:false,
    allowAntisocialOrHateUsage:false,
    creditNotation:"required",
    allowRedistribution:false,
    modification:"prohibited"
  }

  return { ...defaults, ...vrmMeta };
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
function getHumanoidByBoneNames(skinnedMesh){
  const humanBones = {}
  skinnedMesh.skeleton.bones.map((bone)=>{
    for (const boneName in VRMHumanBoneName) {
      if (VRMHumanBoneName[boneName] === bone.name){
        humanBones[bone.name] ={node : bone};
        break;
      }
    }
  })
  return humanBones
}
function traverseWithDepth({ object3D, depth = 0, callback, result }) {
    result.push(callback(object3D, depth));
    const children = object3D.children;
    for (let i = 0; i < children.length; i++) {
        traverseWithDepth({ object3D: children[i], depth: depth + 1, callback, result });
    }
    return result;
}
const describe = (function () {
    const prefix = "  ";
    return function describe(object3D, indentation) {
        const description = `${object3D.type} | ${object3D.name} | ${JSON.stringify(object3D.userData)}`;
        let firstBone = "";
        if (object3D.type === "SkinnedMesh") {
            firstBone = "\n"
                .concat(prefix.repeat(indentation))
                .concat("First bone id: ")
                .concat(object3D.skeleton.bones[0].uuid);
        }
        let boneId = "";
        if (object3D.type === "Bone") {
            boneId = "\n".concat(prefix.repeat(indentation)).concat("Bone id: ").concat(object3D.uuid);
        }
        return prefix.repeat(indentation).concat(description).concat(firstBone).concat(boneId);
    };
})();
export function describeObject3D(root) {
    return traverseWithDepth({ object3D: root, callback: describe, result: [] }).join("\n");
}
