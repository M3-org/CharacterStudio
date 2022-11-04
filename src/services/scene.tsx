import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import { Buffer } from "buffer";
import html2canvas from "html2canvas";
import { VRM } from "@pixiv/three-vrm";
import VRMExporter from "../library/VRM/VRMExporter";
import { LottieLoader } from "three/examples/jsm/loaders/LottieLoader";

import { combine } from "../library/mesh-combination";
// import VRMExporter from "../library/VRM/vrm-exporter";

function getArrayBuffer (buffer) { return new Blob([buffer], { type: "application/octet-stream" }); }

let scene = null;

let model = null;

let skinColor = new THREE.Color(1,1,1);

const lottieLoader =  new LottieLoader();
const textureLoader = new THREE.TextureLoader();

const setModel = (newModel: any) => {
  model = newModel;
}

const setScene = (newScene: any) => {
  scene = newScene;
}
const getScene = () => scene;

let traits = {};

const setTraits = (newTraits: any) => {
  traits = newTraits;
}

const getTraits = () => traits;

async function loadTexture(location:string):THREE.Texture{
  const txt = textureLoader.load(location);
  console.log(txt);
  return txt;
}

async function loadLottieBase(location:string, quality:number, scene:any, playAnimation:boolean, progress: (progress:any) => any, onloaded:(txt:THREE.Texture) => any){
  lottieLoader.setQuality( quality );
    lottieLoader.load( location, function ( texture ) {
      playAnimation ? texture.animation.play():{};
      const geometry = new THREE.CircleGeometry( 0.75, 32 );
      geometry.setAttribute("uv2", geometry.getAttribute('uv'));
      const material = new THREE.MeshBasicMaterial( { map: texture, lightMap: texture, lightMapIntensity:2, side:THREE.BackSide, alphaTest: 0.5});
      const mesh = new THREE.Mesh( geometry, material );
      mesh.rotation.x = Math.PI / 2;
      scene.add( mesh );
      onloaded?onloaded(texture):{}
      return texture;
  }, (prog)=>{progress?progress(prog):{}}, (error) => console.error(error));
}


async function getModelFromScene(format = 'glb') {
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
    const avatar = await combine({ transparentColor:skinColor, avatar: model.scene.clone()});
    const glb: any = await new Promise((resolve) => exporter.parse(avatar, resolve, (error) => console.error("Error getting model", error), options))
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
async function getSkinColor(scene: any, targets: any){
  if (scene) {
    for (const target of targets) {
      const object = scene.getObjectByName(target);
      if (object != null){
        const mat = object.material.length ? object.material[0]:object.material;
        if (mat.uniforms != null){
          setSkinColor(mat.uniforms.color.value);
          break;
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
      object.material[0].uniforms.color.value.set(skinShade)
    }
  }
}
function setSkinColor(color:any){
  skinColor = new THREE.Color(color)
}

async function loadModel(file: any, type: any) {
  if (type && type === "glb" && file) {
    const loader = new GLTFLoader();
    return loader.loadAsync(file, (e) => {
      console.log(e.loaded)
    }).then((gltf) => {
      VRM.from( gltf ).then( ( model ) => {
      return model;
      });
    });
  }

  if (type && type === "vrm" && file) {
    const loader = new GLTFLoader();
    return loader.loadAsync(file).then((model) => {
      VRM.from(model).then((vrm) => {
        console.log("VRM Model: ", vrm);
      });
      
      return model;
    });
  }
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
      var mesh = scene.getObjectByName(target);
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
    //combine here
    const avatar = await combine({ transparentColor:skinColor, avatar: model.scene.clone(), atlasSize });

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
  loadLottieBase,
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
  setModel,
  setSkinColor,
  getSkinColor
};