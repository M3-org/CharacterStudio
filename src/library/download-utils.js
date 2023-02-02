import { Group, MeshStandardMaterial, Color } from "three"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter"
import { cloneSkeleton, combine } from "./merge-geometry"
import { getAvatarData } from "./utils"
import VRMExporter from "./VRMExporter"


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
function getOptimizedGLB(avatarToDownload, atlasSize){
    const avatarToDownloadClone = cloneAvatarModel(avatarToDownload)
    return combine({
      transparentColor: new Color(1,1,1),
      avatar: avatarToDownloadClone,
      atlasSize,
    })
}

export async function getGLBBlobData(avatarToDownload, atlasSize  = 4096, optimized = true){
  const model = await getOptimizedGLB(avatarToDownload, atlasSize)
  const glb = await parseGLB(model);
  return new Blob([glb], { type: 'model/gltf-binary' });
}

async function getGLBData(avatarToDownload, atlasSize  = 4096, optimized = true){
  if (optimized){
    const model = await getOptimizedGLB(avatarToDownload, atlasSize)
    return parseGLB(model); //returns a promise
  }
  else{
    const model = getUnopotimizedGLB(avatarToDownload)
    return parseGLB(model);
  }
}
async function getVRMData(avatarToDownload, avatar, atlasSize  = 4096){

  const vrmModel = await getOptimizedGLB(avatarToDownload, atlasSize);
  return parseVRM(vrmModel,avatar) 
}

export async function downloadVRM(avatarToDownload, avatar, fileName = "", atlasSize  = 4096){
  const downloadFileName = `${
    fileName && fileName !== "" ? fileName : "AvatarCreatorModel"
  }`
  getVRMData(avatarToDownload, avatar, atlasSize).then((vrm)=>{
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

function parseVRM (glbModel, avatar){
  return new Promise((resolve) => {
    const exporter = new VRMExporter()
    const vrmData = {
      ...getVRMBaseData(avatar),
      ...getAvatarData(glbModel, "CharacterCreator"),
    }
    exporter.parse(vrmData, glbModel, (vrm) => {
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