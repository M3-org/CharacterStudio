import { Group, MeshStandardMaterial, Color } from "three"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter"
import { cloneSkeleton, combine, combineNoAtlas } from "./merge-geometry"
import { getAvatarData } from "./utils"
import VRMExporter from "./VRMExporter"
import VRMExporterv0 from "./VRMExporterv0"
import { VRMHumanBoneName } from "@pixiv/three-vrm";


function cloneAvatarModel (model){
  
    const clone = model.clone()
    /*
      NOTE: After avatar clone, the origIndexBuffer/BufferAttribute in userData will lost many infos:
      From: BufferAttribute {isBufferAttribute: true, name: '', array: Uint32Array(21438), itemSize: 1, count: 21438, …}
      To:   Object          {itemSize: 1, type: 'Uint32Array',  array: Array(21438), normalized: false}
      Especailly notics the change of `array` type, and lost of `count` property, will cause errors later.
      So have to reassign `userData.origIndexBuffer` after avatar clone.
    */
    const origIndexBuffers = []
    model.traverse((child) => {
      if (child.userData.origIndexBuffer)
        origIndexBuffers.push(child.userData.origIndexBuffer)
    })
    clone.traverse((child) => {
      if (child.userData.origIndexBuffer)
        child.userData.origIndexBuffer = origIndexBuffers.shift()
    })
    return clone;
}
function getUnopotimizedGLB (model){

    const modelClone = cloneAvatarModel(model)
    let skeleton
    const skinnedMeshes = []

    modelClone.traverse((child) => {
      if (!skeleton && child.isSkinnedMesh) {
        skeleton = cloneSkeleton(child)
      }
      if (child.isSkinnedMesh) {
        child.geometry = child.geometry.clone()
        child.skeleton = skeleton
        skinnedMeshes.push(child)
        if (Array.isArray(child.material)) {
          const materials = child.material
          child.material = new MeshStandardMaterial()
          child.material.map = materials[0].map
        }
        if (child.userData.origIndexBuffer) {
          child.geometry.setIndex(child.userData.origIndexBuffer)
        }
      }
    })

    const unoptimizedGLB = new Group()
    skinnedMeshes.forEach((skinnedMesh) => {
      unoptimizedGLB.add(skinnedMesh)
    })
    unoptimizedGLB.add(skeleton.bones[0])

    return unoptimizedGLB;
}


export async function getGLBBlobData(model, options){
  const {optimized = true} = options;
  const finalModel = await (optimized ? 
     getOptimizedGLB(model, options) :
     getUnopotimizedGLB(model))
  const glb = await parseGLB(finalModel);
  return new Blob([glb], { type: 'model/gltf-binary' });
}

export async function getVRMBlobData(model, avatar, options){
  const finalModel = await getOptimizedGLB(model, options)
  const vrm = await parseVRM(finalModel, avatar, options);
  // save it as glb now
  return new Blob([vrm], { type: 'model/gltf-binary' });
}

// returns a promise with the parsed data
async function getGLBData(model, options){
  if (optimized){
    const finalModel = await getOptimizedGLB(model, options)
    return parseGLB(finalModel); 
  }
  else{
    const finalModel = getUnopotimizedGLB(model)
    return parseGLB(finalModel);
  }
} 




/**
 * Downloads a VRM model with specified options.
 *
 * @param {Object} model - The 3D model object.
 * @param {Object} vrmData - The VRM data for the model.
 * @param {string} fileName - The name of the file to be downloaded.
 * @param {Object} options - Additional options for the download.
 * @param {Object} options.screenshot - An optional screenshot for the model.
 * @param {number} options.mToonAtlasSize - Atlas size for opaque parts when using MToon material.
 * @param {number} options.mToonAtlasSizeTransp - Atlas size for transparent parts when using MToon material.
 * @param {number} options.stdAtlasSize - Atlas size for opaque parts when using standard materials.
 * @param {number} options.stdAtlasSizeTransp - Atlas size for transparent parts when using standard materials.
 * @param {boolean} options.exportMtoonAtlas - Whether to export the MToon material atlas.
 * @param {boolean} options.exportStdAtlas - Whether to export the standard material atlas.
 * @param {number} options.scale - Scaling factor for the model.
 * @param {boolean} options.isVrm0 - Whether the VRM version is 0 (true) or 1 (false).
 * @param {Object} options.vrmMeta - Additional metadata for the VRM model.
 * @param {boolean} options.createTextureAtlas - Whether to create a texture atlas.
 * @param {boolean} options.optimized - Whether to optimize the VRM model.
 */
export async function downloadVRM(model,vrmData,fileName, options){


    const avatar = {_optimized:{vrm:vrmData}}
    downloadVRMWithAvatar(model, avatar, fileName, options)
}

export async function downloadVRMWithAvatar(model, avatar, fileName, options){
  const downloadFileName = `${
    fileName && fileName !== "" ? fileName : "AvatarCreatorModel"
  }`
  getVRMData(model, avatar, options).then((vrm)=>{
    saveArrayBuffer(vrm, `${downloadFileName}.vrm`)
  })
}

async function getVRMData(model, avatar, options){
  const vrmModel = await getOptimizedGLB(model, options);
  return parseVRM(vrmModel,avatar,options) 
}



function getOptimizedGLB(model, options){
  const modelClone = cloneAvatarModel(model)
  const { createTextureAtlas } = options;
  if (createTextureAtlas){
    return combine(modelClone, options);
  }
  else{
    console.log("no atlas");
    return combineNoAtlas(modelClone,options)
  }
}


export async function downloadGLB(model, fileName = "", options){
  const downloadFileName = `${
    fileName && fileName !== "" ? fileName : "AvatarCreatorModel"
  }`

  const {optimized = true} = options;

  const finalModel = optimized ?
    await getOptimizedGLB(model, options):
    getUnopotimizedGLB(model)

  parseGLB(finalModel)
    .then((result) => {
      if (result instanceof ArrayBuffer) {
        saveArrayBuffer(result, `${downloadFileName}.glb`)
      } else {
        const output = JSON.stringify(result, null, 2)
        saveString(output, `${downloadFileName}.gltf`)
      }
    })
}

function parseGLB (glbModel){
  return new Promise((resolve) => {
    const exporter =  new GLTFExporter();
    return exporter.parse(
        glbModel,
        (result) => {
          resolve(result)
        },
        (error) => {
          console.error("Error parsing", error)
        },
        {
          trs: false,
          onlyVisible: false,
          truncateDrawRange: true,
          binary: true,
          forcePowerOfTwoTextures: false,
          maxTextureSize: 1024 || Infinity,
        },
      )
  })
}

function parseVRM (glbModel, avatar, options){
  const {
    screenshot = null, 
    isVrm0 = false, 
    vrmMeta = null
  } = options

  return new Promise((resolve) => {
    const exporter = isVrm0 ? new VRMExporterv0() :  new VRMExporter()



    const vrmData = {
      ...getVRMBaseData(avatar),
      ...getAvatarData(glbModel, "CharacterCreator", vrmMeta),
    }
    let skinnedMesh;
    glbModel.traverse(child => {
      if (child.isSkinnedMesh) skinnedMesh = child;
    })
    const reverseBonesXZ = () => {
      for (let i = 0; i < skinnedMesh.skeleton.bones.length;i++){
        const bone = skinnedMesh.skeleton.bones[i];
        bone.position.x *= -1;
        bone.position.z *= -1;
      }

      skinnedMesh.skeleton.bones.forEach(bone => {
        bone.updateMatrix();
        bone.updateMatrixWorld();
      })
      skinnedMesh.skeleton.calculateInverses();
      skinnedMesh.skeleton.computeBoneTexture();
      skinnedMesh.skeleton.update();
    }
    reverseBonesXZ();
    
    const headBone = skinnedMesh.skeleton.bones.filter(bone => bone.name === 'head')[0];

    const finalSpringBones = [];
    //const springBonesData = [];
    
    // add non repeating spring bones
    for(const trait in avatar){
      if (avatar[trait]?.vrm?.springBoneManager!= null){
          const joints = avatar[trait].vrm.springBoneManager.joints;
          for (const item of joints) {
            const doesNameExist = finalSpringBones.some(boneData => boneData.name === item.bone.name);
            if (!doesNameExist) {
              finalSpringBones.push({
                name:item.bone.name, 
                settings:item.settings, 
                bone:item.bone, 
                colliderGroups:item.colliderGroups,
                center:item.center
              }); 
            }

          }
      }
      
    }

    //get only the root bone of the last array
    const rootSpringBones = [];
    finalSpringBones.forEach(springBone => {
      for (const boneName in VRMHumanBoneName) {
        if(springBone.bone.parent.name == VRMHumanBoneName[boneName]){
          rootSpringBones.push(springBone);
          break;
        }
      }
    });
    
    // XXX collider bones should be taken from springBone.colliderBones
    const colliderBones = [];

    exporter.parse(vrmData, glbModel, screenshot, rootSpringBones, colliderBones, (vrm) => {
      resolve(vrm)
    })
  })
}

function save(blob, filename) {
  const link = document.createElement("a")
  link.style.display = "none"
  document.body.appendChild(link)

  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

function saveString(text, filename) {
  save(new Blob([text], { type: "text/plain" }), filename)
}
function saveArrayBuffer(buffer, filename) {
  save(getArrayBuffer(buffer), filename)
}
function getArrayBuffer(buffer) {
  return new Blob([buffer], { type: "application/octet-stream" })
}
function getVRMBaseData(avatar) {
  // to do, merge data from all vrms, not to get only the first one
  for (const prop in avatar) {
    if (avatar[prop].vrm) {
      return avatar[prop].vrm
    }
  }
}