import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { Buffer } from "buffer";
import html2canvas from "html2canvas";
import VRMExporter from "./VRMExporter";
import { CullHiddenFaces } from './cull-mesh.js';
import { combine } from "./merge-geometry";

export const cullHiddenMeshes = (avatar, scene, avatarTemplateSpec) => {
  const models = [];
  for (const property in avatar) {
    const vrm = avatar[property].vrm;
    if (vrm) {
      const cullLayer = vrm.data.cullingLayer;
      if (cullLayer >= 0) { 
        vrm.scene.traverse((child) => {
          if (child.isMesh) {
            child.userData.cullLayer = cullLayer;
            child.userData.cullDistance = vrm.data.cullingDistance;
            models.push(child);
          }
        });
      }
    }
  }
  const targets = avatarTemplateSpec.cullingModel;
  if (targets) {
    for (let i = 0; i < targets.length; i++) {
      const obj = scene.getObjectByName(targets[i]);
      if (obj != null) {

        if (obj.isMesh) {
          obj.userData.cullLayer = 0;
          models.push(obj);
          //DisplayMeshIfVisible(obj, traitModel);
        }
        if (obj.isGroup) {
          obj.traverse((child) => {
            if (child.parent === obj && child.isMesh) {
              child.userData.cullLayer = 0;
              models.push(child);
              //DisplayMeshIfVisible(child, traitModel);
            }
          });
        }
      }
      else {
        console.warn(targets[i] + " not found");
      }
    }
    CullHiddenFaces(models);
  }
};

export async function getModelFromScene(avatarScene, format = 'glb', skinColor = new THREE.Color(1, 1, 1)) {
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

    const avatar = await combine({ transparentColor: skinColor, avatar: avatarScene });

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

async function getScreenShotByElementId(id) {
  const snapShotElement = document.getElementById(id);
  return await html2canvas(snapShotElement).then(async function (canvas) {
    var dataURL = canvas.toDataURL("image/jpeg", 1.0);
    const base64Data = Buffer.from(
      dataURL.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const blob = new Blob([base64Data], { type: "image/jpeg" });
    return blob;
  });
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
        console.log("wrong index value");
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
  for (const boneName in bones) {
    bones[boneName].node.name = boneName;
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
