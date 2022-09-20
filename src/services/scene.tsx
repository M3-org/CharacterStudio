import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter";
import { Buffer } from "buffer";
import html2canvas from "html2canvas";
import { VRM } from "@pixiv/three-vrm";
import VRMExporter from "../library/VRM/VRMExporter";
// import VRMExporter from "../library/VRM/vrm-exporter";

function getArrayBuffer (buffer) { return new Blob([buffer], { type: "application/octet-stream" }); }

let scene = null;

let model = null;

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

async function getModelFromScene(format = 'glb') {
  if (format && format === 'glb') {
    const exporter = new GLTFExporter()
    var options = {
      trs: false,
      onlyVisible: true,
      truncateDrawRange: true,
      binary: true,
      forcePowerOfTwoTextures: false,
      maxTextureSize: 1024 || Infinity
    }
    console.log("Scene is", scene);
    const glb: any = await new Promise((resolve) => exporter.parse(scene, resolve, (error) => console.error("Error getting model", error), options))
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

async function setMaterialColor(scene: any, value: any, target: any) {
  if (scene && value) {
    const object = scene.getObjectByName(target);
    const randColor = value;
    const skinShade = new THREE.Color(
      `rgb(${randColor},${randColor},${randColor})`
    );
    object.material[0].color.set(skinShade);
  }
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
    var mesh = scene.getObjectByName(target);
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
  screenshot: any
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
    var options = {
      trs: false,
      onlyVisible: false,
      truncateDrawRange: true,
      binary: true,
      forcePowerOfTwoTextures: false,
      maxTextureSize: 1024 || Infinity
    };
    exporter.parse(
      model.scene,
      function (result) {
        if (result instanceof ArrayBuffer) {
          console.log(result);
          saveArrayBuffer(result, `${downloadFileName}.glb`);
        } else {
          var output = JSON.stringify(result, null, 2);
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
    exporter.parse(model, (vrm : ArrayBuffer) => {
      saveArrayBuffer(vrm, `${downloadFileName}.vrm`);
    });
  }
}

export const sceneService = {
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
  setModel
};