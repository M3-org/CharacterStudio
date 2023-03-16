import { Group, MeshStandardMaterial, Color } from "three"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter"
import { cloneSkeleton, combine } from "./merge-geometry"
import { getAvatarData } from "./utils"
import VRMExporter from "./VRMExporter"
import VRMExporterv0 from "./VRMExporterv0"


function cloneAvatarModel (avatarToClone){
    const clone = avatarToClone.clone()
    /*
      NOTE: After avatar clone, the origIndexBuffer/BufferAttribute in userData will lost many infos:
      From: BufferAttribute {isBufferAttribute: true, name: '', array: Uint32Array(21438), itemSize: 1, count: 21438, …}
      To:   Object          {itemSize: 1, type: 'Uint32Array',  array: Array(21438), normalized: false}
      Especailly notics the change of `array` type, and lost of `count` property, will cause errors later.
      So have to reassign `userData.origIndexBuffer` after avatar clone.
    */
    const origIndexBuffers = []
    avatarToClone.traverse((child) => {
      if (child.userData.origIndexBuffer)
        origIndexBuffers.push(child.userData.origIndexBuffer)
    })
    clone.traverse((child) => {
      if (child.userData.origIndexBuffer)
        child.userData.origIndexBuffer = origIndexBuffers.shift()
    })
    return clone;
}
function getUnopotimizedGLB (avatarToDownload){

    const avatarToDownloadClone = cloneAvatarModel(avatarToDownload)
    let skeleton
    const skinnedMeshes = []

    avatarToDownloadClone.traverse((child) => {
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
function getOptimizedGLB(avatarToDownload, atlasSize, isVrm0 = false){
    const avatarToDownloadClone = cloneAvatarModel(avatarToDownload)
    return combine({
      transparentColor: new Color(1,1,1),
      avatar: avatarToDownloadClone,
      atlasSize,
    }, isVrm0)
}

export async function getGLBBlobData(avatarToDownload, atlasSize  = 4096, optimized = true){
  const model = await optimized ? 
    getOptimizedGLB(avatarToDownload, atlasSize) :
    getUnopotimizedGLB(avatarToDownload)
  const glb = await parseGLB(model);
  return new Blob([glb], { type: 'model/gltf-binary' });
}

export async function getVRMBlobData(avatarToDownload, avatar, atlasSize  = 4096, isVrm0 = false){
  const model = await getOptimizedGLB(avatarToDownload, atlasSize, isVrm0)
  const vrm = await parseVRM(model, avatar, isVrm0);
  // save it as glb now
  return new Blob([vrm], { type: 'model/gltf-binary' });
}

// returns a promise with the parsed data
async function getGLBData(avatarToDownload, atlasSize  = 4096, optimized = true){
  if (optimized){
    const model = await getOptimizedGLB(avatarToDownload, atlasSize)
    return parseGLB(model); 
  }
  else{
    const model = getUnopotimizedGLB(avatarToDownload)
    return parseGLB(model);
  }
} 
async function getVRMData(avatarToDownload, avatar, atlasSize  = 4096, isVrm0 = false){

  const vrmModel = await getOptimizedGLB(avatarToDownload, atlasSize, isVrm0);
  return parseVRM(vrmModel,avatar, isVrm0) 
}

export async function downloadVRM(avatarToDownload, avatar, fileName = "", atlasSize  = 4096, isVrm0 = false){
  const downloadFileName = `${
    fileName && fileName !== "" ? fileName : "AvatarCreatorModel"
  }`
  getVRMData(avatarToDownload, avatar, atlasSize, isVrm0).then((vrm)=>{
    saveArrayBuffer(vrm, `${downloadFileName}.vrm`)
  })
}
export async function downloadGLB(avatarToDownload,  optimized = true, fileName = "", atlasSize  = 4096){
  const downloadFileName = `${
    fileName && fileName !== "" ? fileName : "AvatarCreatorModel"
  }`

  //const data =await getGLBData(avatarToDownload,atlasSize, optimized);
  //console.log('data',data)
  getGLBData(avatarToDownload,atlasSize, optimized)
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

function parseVRM (glbModel, avatar, isVrm0 = false){
  return new Promise((resolve) => {
    const exporter = isVrm0 ? new VRMExporterv0() :  new VRMExporter()
    const vrmData = {
      ...getVRMBaseData(avatar),
      ...getAvatarData(glbModel, "CharacterCreator"),
    }

    let skinnedMesh;
    glbModel.traverse(child => {
      if (child.isSkinnedMesh) skinnedMesh = child;
    })

    const reverseBonesXZ = () => {
      skinnedMesh.skeleton.bones.forEach(bone => {
        if (bone.name !== 'root') {
          bone.position.x *= -1;
          bone.position.z *= -1;
        }
      })
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

    const rootSpringBones = [];
    const processSpringBones = () => {
      headBone.children.forEach(hairTypeGroup => {
        // debugger
        // if (hairTypeGroup.name === 'leftEye' || hairTypeGroup.name === 'rightEye' || hairTypeGroup.name === 'Jaw') return;
        // if (hairTypeGroup.name !== 'hair_buns_root') return; // test: temp: only export Hair5/hair_option_1 springBones.
        if (!hairTypeGroup.name.startsWith('hair_')) return;
        const nameParts = hairTypeGroup.name.split('_');
        const hairId = nameParts[1];
        if (hairId === avatar.head.traitInfo.id) { // note: only export the hairTypeGroup of current selected hair.
          hairTypeGroup.children.forEach(strandRoot => {
            // rootSpringBones.push(strandRoot);
            // rootSpringBones.push(strandRoot.children[0]);
            strandRoot.children.forEach(rootSpringBone => {
              rootSpringBones.push(rootSpringBone);
            })
          });
        }
      });
    }
    processSpringBones();

    const colliderBones = [];
    const processColliderBones = () => {
      colliderBones.push(headBone);
    }
    processColliderBones();

    // debugger
    exporter.parse(vrmData, glbModel, rootSpringBones, colliderBones, (vrm) => {
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