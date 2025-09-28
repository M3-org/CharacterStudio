import * as THREE from "three"
import { Group, MeshStandardMaterial, Object3D,Color, Skeleton, SkinnedMesh } from "three"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter"
import { cloneSkeleton, combine, combineNoAtlas } from "./merge-geometry"
import VRMExporter from "./VRMExporter"
import VRMExporterv0 from "./VRMExporterv0"
import { findChildrenByType } from "./utils"
import { VRMHumanBoneName, VRMExpression, VRMExpressionPresetName, VRMExpressionManager, VRMExpressionMorphTargetBind, VRMMeta, VRMSpringBoneJointSettings, VRMSpringBoneColliderGroup} from "@pixiv/three-vrm";
import { doesMeshHaveMorphTargetBoundToManager } from './utils';
import { CommercialUsageType, GetMetadataFromAvatar } from "./vrmMetaUtils"
import { avatarData } from "./characterManager"
import { DownloadOptionsManifest } from "./CharacterManifestData"


function cloneAvatarModel (model:Object3D){
  
    const clone = model.clone()
    /*
      NOTE: After avatar clone, the origIndexBuffer/BufferAttribute in userData will lost many infos:
      From: BufferAttribute {isBufferAttribute: true, name: '', array: Uint32Array(21438), itemSize: 1, count: 21438, …}
      To:   Object          {itemSize: 1, type: 'Uint32Array',  array: Array(21438), normalized: false}
      Especailly notics the change of `array` type, and lost of `count` property, will cause errors later.
      So have to reassign `userData.origIndexBuffer` after avatar clone.
    */
    const origIndexBuffers:any[] = []
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
function getUnopotimizedGLB (model:Object3D){

    const modelClone = cloneAvatarModel(model)
    let skeleton:Skeleton = null!
    const skinnedMeshes:SkinnedMesh[] = []

    modelClone.traverse((child) => {
      if (!skeleton && (child as any).isSkinnedMesh) {
        skeleton = cloneSkeleton(child as SkinnedMesh)
      }
      let c = child as SkinnedMesh
      if (c.isSkinnedMesh) {
        c.geometry = c.geometry.clone()
        c.skeleton = skeleton
        skinnedMeshes.push(c)
        if (Array.isArray(c.material)) {
          const materials = c.material
          c.material = new MeshStandardMaterial();
          (c.material as MeshStandardMaterial).map = (materials[0] as MeshStandardMaterial).map
        }
        if (child.userData.origIndexBuffer) {
          c.geometry.setIndex(child.userData.origIndexBuffer)
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


export async function getVRMBlobData(model:Group, avatar:Record<string, avatarData>, options:Partial<DownloadOptionsManifest>){
  const finalModel = await getOptimizedGLB(model, avatar, options)
  const vrm = await parseVRM(finalModel, avatar, options);
  // save it as glb now
  return new Blob([vrm as any], { type: 'model/gltf-binary' });
}


export function downloadVRMWithAvatar(model:Object3D, avatar:Record<string, avatarData>, fileName:string, options:Partial<DownloadOptionsManifest>){
  return new Promise<void>(async (resolve, reject) => {
    const downloadFileName = `${
      fileName && fileName !== "" ? fileName : "AvatarCreatorModel"
    }`
    getVRMData(model, avatar, options).then((vrm)=>{
      saveArrayBuffer(vrm, `${downloadFileName}.vrm`)
      resolve();
    })
  });
}

async function getVRMData(model:THREE.Object3D, avatar:Record<string, avatarData>, options:Partial<DownloadOptionsManifest>={}){
  const vrmModel = await getOptimizedGLB(model,avatar, options);
  return parseVRM(vrmModel,avatar,options) 
}

function getOptimizedGLB(model:THREE.Object3D, avatar:Record<string,avatarData>, options:Partial<DownloadOptionsManifest>={}){
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


export async function downloadGLB(model:Object3D, fileName = "", options:Partial<DownloadOptionsManifest>={}){
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

function parseGLB (glbModel:Object3D ,options:{binary?:boolean}={}){
  return new Promise<ArrayBuffer | { [key: string]: any }>((resolve) => {
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
          binary: options.binary == undefined ? true: !!options.binary,
          //@ts-ignore: not in types
          forcePowerOfTwoTextures: false,
          maxTextureSize: 1024,
        },
      )
  })
}


function getGroupSpringBones (avatar:Record<string, avatarData>) {
  const finalSpringBones:{
    name:string, 
    settings:any, 
    bone:Object3D, 
    colliderGroups:any,
    center:any
  }[] = [];
  

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
  const groupSpringBones:{
    bones:{
      name:string, 
      bone:Object3D, 
    }[]
    settings:VRMSpringBoneJointSettings,
    center:any,
    colliderGroups:VRMSpringBoneColliderGroup[],
    name:string}[] = [];

    // create a group for each root bone
    finalSpringBones.forEach(springBone => {
      const parent = finalSpringBones.find(bone => bone.name == springBone.bone.parent?.name)
      if(parent == null){
        // current spring bone is a root bone
        groupSpringBones.push({
          bones:[springBone],
          settings:springBone.settings,
          center:springBone.center,
          colliderGroups:springBone.colliderGroups,
          name:springBone.bone.name
        });
        return;
      }
    })

    finalSpringBones.map((springBone) => {
      const group = groupSpringBones.find(group => group.bones.find(bone => bone.name == springBone.bone.parent?.name) != null);
      if(group != null){
        group.bones.push({
          name:springBone.name,
          bone:springBone.bone
        });
      }
    })

  return groupSpringBones;
}

function getRootBones (avatar:Record<string, avatarData>) {
  const finalSpringBones:{
    name:string, 
    settings:any, 
    bone:Object3D, 
    colliderGroups:any,
    center:any
  }[] = [];
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
  const rootSpringBones:{
    name:string, 
    settings:any, 
    bone:Object3D, 
    colliderGroups:any,
    center:any
  }[] = [];
  finalSpringBones.forEach(springBone => {
    for (const boneName of Object.keys(VRMHumanBoneName)) {
      if(springBone.bone.parent?.name == VRMHumanBoneName[boneName as keyof typeof VRMHumanBoneName]){
        rootSpringBones.push(springBone);
        break;
      }else {

        // in the array finalSpringBones, only pick the bones with a parent that is not in the array
        if(finalSpringBones.find(bone => bone.name == springBone.bone.parent?.name) == null){
          rootSpringBones.push(springBone);
          break;
        }
      }
    }
  });
  return rootSpringBones;
}

type boneName = typeof VRMHumanBoneName[keyof typeof VRMHumanBoneName]

function getHumanoidByBoneNames(skinnedMesh:THREE.SkinnedMesh){
  const humanBones:Record<boneName,{node:THREE.Bone}> = {} as any
  skinnedMesh.skeleton.bones.map((bone)=>{
    for (const boneName in Object.values(VRMHumanBoneName)) {
      if (boneName === bone.name){
        humanBones[bone.name as boneName] ={node : bone};
        break;
      }
    }
  })
  return humanBones
}

export function getAvatarData (avatarModel:THREE.Object3D, vrmMeta:VRMMeta, options:Pick<DownloadOptionsManifest,'mergeAppliedMorphs'>){

  const skinnedMeshes = findChildrenByType(avatarModel, "SkinnedMesh") as THREE.SkinnedMesh[];

  return{
    humanBones:getHumanoidByBoneNames(skinnedMeshes[0]),
    materials : avatarModel.userData.atlasMaterial,
    meta : getVRMMeta( vrmMeta),
    ...(options.mergeAppliedMorphs?{expressionManager:getRebindedVRMExpressionManager(avatarModel)}:{}),
  }

}

function getVRMMeta(vrmMeta:VRMMeta){
  vrmMeta = vrmMeta||{}

  const defaults:VRMMeta = {
    authors:["DrifterStudio"],
    metaVersion:vrmMeta.metaVersion||"0",
    version:vrmMeta.version||"v0",
    name:'DrifterStudio Avatar',
    licenseUrl:"https://vrm.dev/licenses/1.0/",
    commercialUsage: CommercialUsageType.personalNonProfit,
    contactInformation: "https://drifter-studio.com/", 
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


function parseVRM (glbModel:Object3D, avatar:Record<string,avatarData>, options:Partial<DownloadOptionsManifest>={}){
  const {
    screenshot = undefined, 
    isVrm0 = false,
    vrmMeta = null,
    scale = 1,
    vrmName = "CharacterCreator"
  } = options

  const metadataMerged = GetMetadataFromAvatar(avatar, vrmMeta, vrmName);

  return new Promise<ArrayBufferLike>(async (resolve) => {
    /**
     * Because vrm1 Exporter is broken, always default to vrm0 exporter;
     */
    const isOutputVRM0 = options.outputVRM0 ?? options.isVrm0 ?? true;
    const exporter = isOutputVRM0 ? new VRMExporterv0() :  new VRMExporter()
    const vrmData = {
      ...getVRMBaseData(avatar),
      ...getAvatarData(glbModel, metadataMerged as unknown as VRMMeta,options),
    }

    let skinnedMesh:SkinnedMesh = null!;
    glbModel.traverse(child => {
      if ((child as SkinnedMesh).isSkinnedMesh) skinnedMesh = child as SkinnedMesh;
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
    


    // @TODO: change springBone selection logic for VRM1
    const rootSpringBones = isOutputVRM0?getGroupSpringBones(avatar):getRootBones(avatar);
    // XXX collider bones should be taken from springBone.colliderBones
    // const colliderBones = [];
    
    if(isOutputVRM0){
      // VRM 0.0
      (exporter as VRMExporterv0).parse(vrmData, glbModel, screenshot, rootSpringBones as any, !!options.ktxCompression, scale, (vrm:ArrayBufferLike) => {
        resolve(vrm)
      })
    }else{
      // VRM 1.0 has a different amount of parameters
      (exporter as VRMExporter).parse(vrmData, glbModel, screenshot, (vrm:ArrayBufferLike) => {
        resolve(vrm)
      })
    }
  })
}

function save(blob:any, filename:string) {
  const link = document.createElement("a")
  link.style.display = "none"
  document.body.appendChild(link)

  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

function saveString(text:string, filename:string) {
  save(new Blob([text], { type: "text/plain" }), filename)
}
function saveArrayBuffer(buffer:ArrayBufferLike, filename:string) {
  save(getArrayBuffer(buffer), filename)
}
function getArrayBuffer(buffer:ArrayBufferLike) {
  return new Blob([buffer as any], { type: "application/octet-stream" })
}
function getVRMBaseData(avatar:Record<string, avatarData>) {
  // to do, merge data from all vrms, not to get only the first one
  for (const prop in avatar) {
    if (avatar[prop].vrm) {
      return avatar[prop].vrm
    }
  }
}

/**
 * Rebinds the BlendShapes to a new VRMExpressionManager. Used before exporting the VRM.
 */
function getRebindedVRMExpressionManager(avatarModel: THREE.Object3D) {
  const expressionManager = new VRMExpressionManager();
  // Get old expression manager or a new default one if it doesnt exist
  let oldExpressionManager = avatarModel.userData
    .expressionManagerToClone as VRMExpressionManager;

  if (!oldExpressionManager) {
    oldExpressionManager = new VRMExpressionManager();
    for (const exp of Object.values(VRMExpressionPresetName)) {
      const expression = new VRMExpression(exp);
      oldExpressionManager.registerExpression(expression);
    }
  }
  // Copy the old expression manager
  expressionManager.copy(oldExpressionManager);
  // Remove reference to the old expression manager
  avatarModel.userData.expressionManagerToClone = null;

  for (const child of avatarModel.children) {
    if (
      !(child as THREE.Mesh).isMesh &&
      !(child as THREE.SkinnedMesh).isSkinnedMesh
    )
      continue;

    if (!(child as THREE.Mesh).morphTargetDictionary) continue;

    const changedDictionaries = child.userData.bindMorphs as {
      new: {
        [key: string]: {
          index: number;
          primitives: number[];
        };
      };
      old: {
        [key: string]: {
          index: number;
          primitives: number[];
        };
      };
    };

    // If the child has no changed dictionaries, skip
    if (!changedDictionaries) continue;

    // If the child has no blendshape that is in the expression manager, skip
    const hasBlendshape = doesMeshHaveMorphTargetBoundToManager(
      child as THREE.Mesh,
      changedDictionaries.old
    );
    if (!hasBlendshape) {
      console.log(child.name, 'no blendshape in manager:', changedDictionaries.old);
      continue;
    }

    /**
     * Get Weight from previous bind
     */
    const getPrevBoundWeight = (
      binds: VRMExpressionMorphTargetBind[],
      indexToLookFor: number
    ) => {
      return binds.find((bind) => bind.index == indexToLookFor)?.weight || 0;
    };

    const VRMExpressionNames = Object.entries(VRMExpressionPresetName).flat();
    // List of expressions keys that can be removed
    const expressionsToUnBind = Object.keys(changedDictionaries.old).filter(
      (key) => VRMExpressionNames.includes(key)
    );

    // Iterate through all old expressions
    for (const item of Object.keys(oldExpressionManager.expressionMap)) {
      const expression = oldExpressionManager.expressionMap[item];
      if (!expression) continue;
      const prevBounds = (expression as any)
        ._binds as VRMExpressionMorphTargetBind[];
      if (!prevBounds || prevBounds.length == 0) {
        // No binds, remove the expression
        expressionManager.unregisterExpression(expression);
        continue;
      }

      // Go through all blendshapes bound to old expressions
      for (const morph of expressionsToUnBind) {
        const blendShapeKeyEntry =
          changedDictionaries.new[morph] ||
          changedDictionaries.new[morph.toLowerCase()];
        const blendShapeKeyEntryOld =
          changedDictionaries.old[morph] ||
          changedDictionaries.old[morph.toLowerCase()];

        if (blendShapeKeyEntry) {
          // Get all meshes that are bound to the expression
          const meshes: THREE.Mesh[] = [];
          avatarModel.traverse((o) => {
            if (
              !(o as THREE.Mesh).isMesh &&
              !(o as THREE.SkinnedMesh).isSkinnedMesh
            )
              return;
            if (blendShapeKeyEntry.primitives.includes(o.id)) {
              meshes.push(o as THREE.Mesh);
            }
          });
          // Unregister the old expression
          expressionManager.unregisterExpression(expression);
          // remove all binds from the old expression
          (expression as any)._binds = [];
          // get weight from previous bind
          const weight = getPrevBoundWeight(
            prevBounds,
            blendShapeKeyEntryOld.index
          );
          // Create a new expression with the same name
          const newExpression = new VRMExpression(expression.expressionName);
          // Copy the old expression (no binds)
          newExpression.copy(expression);
          // Add the new bind
          console.log("adding bind", expression.expressionName);
          newExpression.addBind(
            new VRMExpressionMorphTargetBind({
              index: blendShapeKeyEntry.index,
              weight: weight,
              primitives: meshes,
            })
          );
          console.log("result expression", newExpression);
          // Register the new expression
          expressionManager.registerExpression(newExpression);
        } else {
          expressionManager.unregisterExpression(expression);
        }
      }
    }

    /**
     * Rebind the new blendshape to the expression manager
     */
    for(const expression of expressionManager.expressions){
      const blendshapeNames = getBlendshapeNameByBindsForVRMExpression(expression)
      const defaultBlendshape = blendshapeNames[0][0];
      
      const oldBounds = (expression as any)._binds as VRMExpressionMorphTargetBind[];

      if(!changedDictionaries.new[defaultBlendshape]) continue;
      const newBindIndex = changedDictionaries.new[defaultBlendshape].index
      const jsonBinds:{
          index:number,
          weight:number,
          primitives:THREE.SkinnedMesh[]
        }[] = []
      oldBounds.map((bind)=>{
        let alreadyBound = jsonBinds.find((b)=>b.index == newBindIndex)
        if(alreadyBound?.primitives.map((p)=>p.id).includes(child.id)){
          // already bound, skip
          return
        }else if (alreadyBound){
            alreadyBound.primitives.push(child as THREE.SkinnedMesh)
        }else{
          jsonBinds.push({
            index:newBindIndex,
            weight:bind.weight,
            primitives:[child as THREE.SkinnedMesh]
          })
        }
        
      })

      const vrmBinds = jsonBinds.map((bind)=>{
        return new VRMExpressionMorphTargetBind(bind)
      })
      
      if(expression.userData.processed){
         //@ts-ignore
        expression._binds.push(...vrmBinds)
      }else{
        expression.userData.processed = true;
        //@ts-ignore
        expression._binds = vrmBinds
      }
    }

  }

  return expressionManager;
}

/**
 * Get list of blendshape Names for each mesh in each bind of the expression
 */
function getBlendshapeNameByBindsForVRMExpression(expression:VRMExpression){

  const binds = (expression as any)._binds as VRMExpressionMorphTargetBind[];
  if(!binds) return []
  /**
   * For eaech bind, go over the primitives and get the morphTargetDictionary
   * and get the name of the morph target that is bound to the bind index
   */

  const blendshapes = binds.map((bind) => {
    let blendshapeNames:string[] = []
    bind.primitives.forEach((p)=>{
      const morph = Object.entries(p.morphTargetDictionary!).find(([key,value])=>value==bind.index)
      if(morph){
        blendshapeNames.push(morph[0])
      }
    })

    return blendshapeNames
  })
  return blendshapes

}