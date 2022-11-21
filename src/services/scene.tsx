import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import { Buffer } from "buffer";
import html2canvas from "html2canvas";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm"
import VRMExporter from "../library/VRM/VRMExporter";
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, SAH } from 'three-mesh-bvh';
import { LottieLoader } from "three/examples/jsm/loaders/LottieLoader";
import {DisplayMeshIfVisible, CullHiddenFaces} from '../library/cull-mesh.js'
import { combine } from "../library/mesh-combination";

import { OfflineShareTwoTone, Output } from "@mui/icons-material";
import { disposeAnimation } from "../library/animations/animation";
// import { renameMecanimBones } from "./bonesRename";

function getArrayBuffer (buffer) { return new Blob([buffer], { type: "application/octet-stream" }); }

let scene = null;

let avatarModel = null;

let skinColor = new THREE.Color(1,1,1);

let avatarTemplateInfo = null;

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const lottieLoader =  new LottieLoader();
const textureLoader = new THREE.TextureLoader();

const setAvatarModel = (newAvatar: VRM) => {
  avatarModel = newAvatar;
}

const getAvatarModel = () => avatarModel;

const setScene = (newScene: any) => {
  scene = newScene;
}
const getScene = () => scene;

let traits = {};

const setTraits = (newTraits: any) => {
  traits = newTraits;
  cullHiddenMeshes();
}


const setAvatarTemplateInfo = (newAvatarTemplateInfo:any) =>{
  avatarTemplateInfo = newAvatarTemplateInfo;
}

const cullHiddenMeshes = () => {
  if (avatarTemplateInfo){
    const models = [];
    for (const property in traits) {
      const model = traits[property].model;
      
      if (model){
        console.log(model);
        model.traverse((child)=>{
          if (child.isMesh){
            child.userData.cullLayer = 1;
            models.push(child);
          }
        })
      }
    }
    const targets = avatarTemplateInfo.cullingModel;
    if (targets){
      console.log(avatarTemplateInfo)
      console.log(targets)
      console.log(scene)
      for (let i =0; i < targets.length; i++){
        const obj = scene.getObjectByName(targets[i])
        if (obj != null){
          
          if (obj.isMesh){
            obj.userData.cullLayer = 0;
            models.push(obj);
            //DisplayMeshIfVisible(obj, traitModel);
          }
          if (obj.isGroup){
            obj.traverse((child) => {
              if (child.parent === obj && child.isMesh){
                child.userData.cullLayer = 0;
                models.push(child);
                //DisplayMeshIfVisible(child, traitModel);
              }
            })
          }
        }
        else{
          console.warn(targets[i] + " not found");
        }
      }
      console.log(models)
      CullHiddenFaces(models);
    }
  }
}

// const createScene = () => {
//   scene = new THREE.Scene();
// }

const getTraits = () => traits;

async function loadTexture(location:string):Promise<THREE.Texture>{
  const txt = textureLoader.load(location);
  console.log(txt);
  return txt;
}

async function loadLottie(file:string, quality?:number, playAnimation?:boolean, onProgress?: (event: ProgressEvent) => void):Promise<THREE.Mesh>{
  lottieLoader.setQuality( quality || 2 );
  return lottieLoader.loadAsync(file, onProgress).then((lot) => {
      playAnimation ? lot.animation.play():{};
      const geometry = new THREE.CircleGeometry( 0.75, 32 );

      // assign same uvs in lightmaps as main uvs
      geometry.setAttribute("uv2", geometry.getAttribute('uv'));

      const material = new THREE.MeshBasicMaterial( { map: lot, lightMap: lot, lightMapIntensity:2, side:THREE.BackSide, alphaTest: 0.5});
      const mesh = new THREE.Mesh( geometry, material );
      
      return mesh;
  })
}



async function getModelFromScene(format = 'glb') {
  console.log(format)
  if (format && format === 'glb') {
    const exporter = new GLTFExporter()
    const options = {
      trs: false,
      onlyVisible: true,
      truncateDrawRange: true,
      binary: true,
      forcePowerOfTwoTextures: false,
      maxTextureSize: 1024 || Infinity
    }
    console.log("Scene is", scene);

    //temporary remove data, maybe we should make it in a different way to avoid this?
    // const data = avatarModel.scene.userData.data;
    // avatarModel.scene.userData.data = null;
    // const cloneAvatar = avatarModel.scene.clone()
    // avatarModel.scene.userData.data = data;
    
    const avatar = await combine({ transparentColor:skinColor, avatar:avatarModel.scene.clone() });
    
    const glb: any = await new Promise((resolve) => exporter.parse(avatar, resolve, (error) => console.error("Error getting model", error), options))
    console.log("after")
    return new Blob([glb], { type: 'model/gltf-binary' })
  } else if (format && format === 'vrm') {
    const exporter = new VRMExporter();
    const vrm: any = await new Promise((resolve) => exporter.parse(scene, resolve))
    return new Blob([vrm], { type: 'model/gltf-binary' })
  } else {
    return console.error("Invalid format");
  }
}

async function getScreenShot() {
  return await getScreenShotByElementId("editor-scene")
}

async function getScreenShotByElementId(id) {
  let snapShotElement = document.getElementById(id);
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

async function saveScreenShotByElementId(id: string) {
  setTimeout(() => {
    setTimeout(() => {
      getScreenShotByElementId(id).then((screenshot) => {
        const link = document.createElement("a");
        link.style.display = "none";
        document.body.appendChild(link);
        function save(blob, filename) {
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
        }
        function saveArrayBuffer(buffer) {
          save(new Blob([buffer], { type: "image/json" }), "screenshot.jpg");
        }
        saveArrayBuffer(screenshot);
      });
    }, 600);
  }, 600);
}

async function getObjectValue(target: any, scene: any, value: any) {
  if (target && scene) {
    const object = scene.getObjectByName(target);
    return object.material.color;
  }
}

async function getMesh(name: any, scene: any) {
  const object = scene.getObjectByName(name);
  return object;
}

async function getSkinColor(scene:any, targets: any){
  if (scene) {
    for (const target of targets) {
      const object = scene.getObjectByName(target);
      if (object != null){
        if(object.isGroup){
          const child = object.children[0]
          const mat = child.material.length ? child.material[0]:child.material;
          if (mat.uniforms != null){
            setSkinColor(mat.uniforms.litFactor.value);
            break;
          }
        }
        else{
          const mat = object.material.length ? object.material[0]:object.material;
          if (mat.uniforms != null){
            setSkinColor(mat.uniforms.litFactor.value);
            break;
          }
        }
      }
    }
  }
}
async function setMaterialColor(scene: any, value: any, target: any) {
  if (scene && value) {
    const object = scene.getObjectByName(target);
    if (object != null){
      const randColor = value;
      const skinShade = new THREE.Color(randColor).convertLinearToSRGB();
      const mat =  object.material.length ? object.material[0] : object.material;
      mat.uniforms.litFactor.value.set(skinShade)
      const hslSkin = { h: 0, s: 0, l: 0 };
      skinShade.getHSL(hslSkin);

      mat.uniforms.shadeColorFactor.value.setRGB(skinShade.r,skinShade.g*0.8,skinShade.b*0.8)
    }
  }
}
function setSkinColor(color:any){
  skinColor = new THREE.Color(color)
}

const loader = new GLTFLoader();
loader.register((parser) => {
  return new VRMLoaderPlugin(parser);
});
//loadAsync(url: string, onProgress?: (event: ProgressEvent) => void): Promise<GLTF>;

async function loadModel(file: any, onProgress?: (event: ProgressEvent) => void):Promise<VRM> {
  return loader.loadAsync(file, onProgress).then((model) => {
    const vrm = model.userData.vrm;
    // setup for vrm
    //renameVRMBones(vrm);
    renameVRMBones(vrm);
    setupModel(vrm.scene);
    return vrm;
  });
}

//make sure to remove this data when downloading, as this data is only required while in edit mode
function addModelData(model:any, data:any){
  if (model.data == null)
    model.data = data;
  else
    model.data = {...model.data, ...data};
}
function removeModelData(model:any, props?:Array<string>){
  if (model.data == null)
    return;

  if (props){
    props.forEach(prop => {
      if (model.data[prop]!= null)
        model.data[prop] = null;
    });
  }
  else{
    model.data = null;
  }
}

function getModelProperty(model:any, property:string):any{
  if (model.data == null)
    return;

  return model.data[property];
}

function disposeVRM (vrm: any) {
  const model = vrm.scene;
  disposeAnimation(getModelProperty(model, "animControl"));
  
  model.traverse((o)=>{
    
    if (o.geometry) {
      o.geometry.dispose()            
    }

    if (o.material) {
        if (o.material.length) {
            for (let i = 0; i < o.material.length; ++i) {
                o.material[i].dispose()                            
            }
        }
        else {
            o.material.dispose()                     
        }
    }
  })
  model.parent.remove(model);
  
}



// create face normals
// let pos = this.face.geometry.attributes.position;
// let idx = this.face.geometry.index;

// let tri = new THREE.Triangle(); // for re-use
// let a = new THREE.Vector3(), 
//     b = new THREE.Vector3(), 
//     c = new THREE.Vector3(); // for re-use

// for( let f = 0; f < 2; f++ ){
//     let idxBase = f * 3;
//     a.fromBufferAttribute( pos, idx.getX( idxBase + 0 ) );
//     b.fromBufferAttribute( pos, idx.getX( idxBase + 1 ) );
//     c.fromBufferAttribute( pos, idx.getX( idxBase + 2 ) );
//     tri.set( a, b, c );
//     tri.getNormal( copytoavector3 );
//     //otherstuff
// }

const renameVRMBones = (vrm) =>{
  const bones = vrm.firstPerson.humanoid.humanBones;
  for (const boneName in bones) {
    //console.log(boneName);
    bones[boneName].node.name = boneName;
  } 
}

function setupModel(model: THREE.Object3D):void{
  model?.traverse((child:any)=>{
    child.frustumCulled = false
    if (child.isMesh){
      //child.userData.origIndexBuffer = child.geometry.index;
      if (child.geometry.boundsTree == null)
            child.geometry.computeBoundsTree({strategy:SAH});
            
      if (child.material.length > 1){
        child.material[0].uniforms.litFactor.value = child.material[0].uniforms.litFactor.value.convertLinearToSRGB();
        child.material[0].uniforms.shadeColorFactor.value = child.material[0].uniforms.shadeColorFactor.value.convertLinearToSRGB();
      }
  }});
}

async function getMorphValue(key: any, scene: any, target: any) {
  if (key && scene) {
    const mesh = scene.getObjectByName(target);
    const index = mesh.morphTargetDictionary[key];
    if (index !== undefined) {
      return mesh.morphTargetInfluences[index];
    }
  }
}



async function updateMorphValue(
  key: any,
  value: any,
  scene: any,
  targets: any
) {
  if (key && targets && value) {
    targets.map((target: any) => {
      const mesh = scene.getObjectByName(target);
      const index = mesh.morphTargetDictionary[key];
      if (index !== undefined) {
        mesh.morphTargetInfluences[index] = value;
      }
    });
  }
}

async function updatePose(name: any, value: any, axis: any, scene: any) {
  var bone = scene.getObjectByName(name);
  if (bone instanceof THREE.Bone) {
    switch (axis) {
      case "x":
        bone.rotation.x = value;
        break;
      case "y":
        bone.rotation.y = value;
        break;
      case "z":
        bone.rotation.z = value;
        break;
      default:
    }
    return value;
  }
}

async function download(
  model: any,
  fileName: any,
  format: any,
  screenshot: any,
  atlasSize:number = 4096
) {
  // We can use the SaveAs() from file-saver, but as I reviewed a few solutions for saving files,
  // this approach is more cross browser/version tested then the other solutions and doesn't require a plugin.
  const link = document.createElement("a");
  link.style.display = "none";
  document.body.appendChild(link);
  function save(blob, filename) {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }

  function saveString(text, filename) {
    save(new Blob([text], { type: "text/plain" }), filename);
  }

  function saveArrayBuffer(buffer, filename) {
    save(getArrayBuffer(buffer), filename);
  }

  // Specifying the name of the downloadable model
  const downloadFileName = `${
    fileName && fileName !== "" ? fileName : "AvatarCreatorModel"
  }`;

  if (format && format === "glb") {
    const exporter = new GLTFExporter();
    const options = {
      trs: false,
      onlyVisible: false,
      truncateDrawRange: true,
      binary: true,
      forcePowerOfTwoTextures: false,
      maxTextureSize: 1024 || Infinity
    };
    console.log(skinColor);
    const avatar = await combine({ transparentColor:skinColor, avatar: avatarModel.scene.clone(), atlasSize });
    exporter.parse(
      avatar,
      function (result) {
        if (result instanceof ArrayBuffer) {
          saveArrayBuffer(result, `${downloadFileName}.glb`);
        } else {
          const output = JSON.stringify(result, null, 2);
          saveString(output, `${downloadFileName}.gltf`);
        }
      },
      (error) => { console.error("Error parsing", error)},
      options
    );
  } else if (format && format === "obj") {
    const exporter = new OBJExporter();
    saveArrayBuffer(exporter.parse(model.scene), `${downloadFileName}.obj`);
  } else if (format && format === "vrm") {
    const exporter = new VRMExporter();
    console.log("working...")
    const clonedScene = model.scene.clone();
    const avatar = await combine({transparentColor:skinColor, avatar: clonedScene, atlasSize });  
    console.log(avatar);
    var scene = model.scene;
    var clonedSecondary;
    scene.traverse((child) =>{
      if(child.name == 'secondary'){
        clonedSecondary = child.clone();  
      }
    })

    avatar.add(clonedSecondary);
    // change material array to the single atlas material
    model.materials = [avatar.userData.atlasMaterial];
    exporter.parse(model, avatar, (vrm : ArrayBuffer) => {
      saveArrayBuffer(vrm, `${downloadFileName}.vrm`);
    });
    console.log("finished")
  }
}

export const sceneService = {
  loadTexture,
  loadLottie,
  loadModel,
  updatePose,
  updateMorphValue,
  getMorphValue,
  download,
  getMesh,
  setMaterialColor,
  getObjectValue,
  saveScreenShotByElementId,
  getScreenShot,
  getScreenShotByElementId,
  getModelFromScene,
  setScene,
  getScene,
  getTraits,
  setTraits,
  setAvatarModel,
  getAvatarModel,
  setSkinColor,
  disposeVRM,
  getSkinColor,
  addModelData,
  setAvatarTemplateInfo
};