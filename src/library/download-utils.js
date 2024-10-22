import { Group, MeshStandardMaterial, Color } from "three"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter"
import { cloneSkeleton, combine, combineNoAtlas } from "./merge-geometry"
import VRMExporter from "./VRMExporter"
import VRMExporterv0 from "./VRMExporterv0"
import { findChildrenByType } from "./utils"
import { VRMHumanBoneName, VRMExpression, VRMExpressionPresetName, VRMExpressionManager, VRMExpressionMorphTargetBind} from "@pixiv/three-vrm";
import { doesMeshHaveMorphTargetBoundToManager } from './utils';
import { GetMetadataFromAvatar } from "./vrmMetaUtils"


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
 * @param {Object} vrmData - The VRM initial loaded data for the model.
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
 * @param {boolean} options.ktxCompression - Whether to use ktx2 type texture compression.
 */
export async function downloadVRM(model,vrmData,fileName, options){


    const avatar = {_optimized:{vrm:vrmData}}
    downloadVRMWithAvatar(model, avatar, fileName, options)
}

export function downloadVRMWithAvatar(model, avatar, fileName, options){
  return new Promise(async (resolve, reject) => {
    const downloadFileName = `${
      fileName && fileName !== "" ? fileName : "AvatarCreatorModel"
    }`
    getVRMData(model, avatar, options).then((vrm)=>{
      saveArrayBuffer(vrm, `${downloadFileName}.vrm`)
      resolve();
    })
  });
}

async function getVRMData(model, avatar, options){
  const vrmModel = await getOptimizedGLB(model,avatar, options);
  return parseVRM(vrmModel,avatar,options) 
}

function getOptimizedGLB(model, avatar, options){
  const modelClone = cloneAvatarModel(model)
  // default for now ?
  options.mergeAppliedMorphs = true;
  const { createTextureAtlas = true } = options;
  if (createTextureAtlas){
    return combine(modelClone, avatar, options);
  }
  else{
    console.log("no atlas");
    return combineNoAtlas(modelClone,avatar, options)
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

function getRootBones (avatar) {
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
  return rootSpringBones;
}

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

function getAvatarData (avatarModel, vrmMeta, options){
  const skinnedMeshes = findChildrenByType(avatarModel, "SkinnedMesh")
  return{
    humanBones:getHumanoidByBoneNames(skinnedMeshes[0]),
    materials : avatarModel.userData.atlasMaterial,
    meta : getVRMMeta( vrmMeta),
    ...(options.mergeAppliedMorphs?{expressionManager:getRebindedVRMExpressionManager(avatarModel)}:{}),
  }
}

function getVRMMeta( vrmMeta){
  vrmMeta = vrmMeta||{}

  const defaults = {
    authors:["CharacterStudio"],
    metaVersion:"1",
    version:"v1",
    name:"CharacterCreator",
    licenseUrl:"https://vrm.dev/licenses/1.0/",
    commercialUssageName: "personalNonProfit",
    contactInformation: "https://m3org.com/", 
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

function parseVRM (glbModel, avatar, options){
  const {
    screenshot = null, 
    isVrm0 = false, 
    vrmMeta = null,
    scale = 1,
    vrmName = "CharacterCreator"
  } = options

  const metadataMerged = GetMetadataFromAvatar(avatar, vrmMeta, vrmName);



  return new Promise(async (resolve) => {
    const exporter = isVrm0 ? new VRMExporterv0() :  new VRMExporter()
    const vrmData = {
      ...getVRMBaseData(avatar),
      ...getAvatarData(glbModel, metadataMerged,options),
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

    
    const rootSpringBones = getRootBones(avatar);
    // XXX collider bones should be taken from springBone.colliderBones
    const colliderBones = [];

    exporter.parse(vrmData, glbModel, screenshot, rootSpringBones, options.ktxCompression, scale, (vrm) => {
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


/**
 * Rebinds the BlendShapes to a new VRMExpressionManager. Used before exporting the VRM.
 * @param {THREE.Object3D} avatarModel - The avatar model.
 */
function getRebindedVRMExpressionManager(avatarModel){
  const expressionManager = new VRMExpressionManager();
  // Get old expression manager or a new default one if it doesnt exist
  /**
   * @type {THREE.VRMExpressionManager|undefined}
   */
  let oldExpressionManager = avatarModel.userData.expressionManagerToClone;
  if(!oldExpressionManager){
      oldExpressionManager = new VRMExpressionManager();
      for(const exp of Object.values(VRMExpressionPresetName)){
        const expression = new VRMExpression(exp)
        oldExpressionManager.registerExpression(expression)
      }
  }
  // Copy the old expression manager
  expressionManager.copy(oldExpressionManager);
  // Remove reference to the old expression manager
  avatarModel.userData.expressionManagerToClone = null

  for(const child of avatarModel.children){
    if(!child.isMesh && !child.isSkinnedMesh) continue;

    if(!child.morphTargetDictionary) continue

    /**
     * @type {{
     * new:{[key:string]:{
     *   index:number,
     *   primitives:number[]
     *}},
     * old:{[key:string]:{
     *   index:number,
     *   primitives:number[]
     *}}
     *}}
     */
    const changedDictionaries = child.userData.bindMorphs

    // If the child has no changed dictionaries, skip
    if(!changedDictionaries) continue

    // If the child has no blendshape that is in the expression manager, skip
    const hasBlendshape = doesMeshHaveMorphTargetBoundToManager(child, changedDictionaries.old)
    if(!hasBlendshape) continue

    /**
     * Get Weight from previous bind
     * @param {Object[]} binds
     * @param {number} indexToLookFor
     */
    const getPrevBoundWeight = (binds,indexToLookFor) => {
      return binds.find((bind) => bind.index == indexToLookFor)?.weight||0
    }

    const VRMExpressionNames = Object.entries(VRMExpressionPresetName).flat()
    // List of expressions keys that can be removed
    const expressionsToUnBind = Object.keys(changedDictionaries.old).filter((key) => VRMExpressionNames.includes(key));

    // Iterate through all old expressions
    for(const item of Object.keys(oldExpressionManager.expressionMap)){
      const expression = oldExpressionManager.expressionMap[item];
      if(!expression) continue 
      const prevBounds = expression._binds
      if(!prevBounds || prevBounds.length==0) {
        // No binds, remove the expression
        expressionManager.unregisterExpression(expression)
        continue
      }

      // Go through all blendshapes bound to old expressions
      for(const morph of expressionsToUnBind){
        const blendShapeKeyEntry = changedDictionaries.new[morph] || changedDictionaries.new[morph.toLowerCase()]
        const blendShapeKeyEntryOld = changedDictionaries.old[morph] || changedDictionaries.old[morph.toLowerCase()]
        if(blendShapeKeyEntry){
          // Get all meshes that are bound to the expression
          const meshes = []
          avatarModel.traverse((o)=>{
            if(!o.isMesh && !o.isSkinnedMesh) return
            if(blendShapeKeyEntry.primitives.includes(o.id)){
              meshes.push(o)
            }
          })
          // Unregister the old expression
          expressionManager.unregisterExpression(expression)
          // remove all binds from the old expression
          expression._binds = []
          // get weight from previous bind
          const weight = getPrevBoundWeight(prevBounds,blendShapeKeyEntryOld.index);
          // Create a new expression with the same name
          const newExpression = new VRMExpression(expression.expressionName)
          // Copy the old expression (no binds)
          newExpression.copy(expression)
          // Add the new bind
          console.log('adding bind',expression.expressionName)
          newExpression.addBind(new VRMExpressionMorphTargetBind({
            index:blendShapeKeyEntry.index,
            weight:weight,
            primitives:meshes
          }))

          // Register the new expression
          expressionManager.registerExpression(newExpression)
        }else{
          expressionManager.unregisterExpression(expression)
        }
      }

    }

  }
  return expressionManager
}