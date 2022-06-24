import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Sky } from "three/examples/jsm/objects/Sky";

export function findChild({ candidates, predicate }) {
  if (!candidates.length) {
    return null;
  }

  const candidate = candidates.shift();
  if (predicate(candidate)) return candidate;

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

export const loadGLTF = (function () {
  const loader = new GLTFLoader();
  return function loadGLTF(url) {
    return new Promise(function (resolve, reject) {
      loader.load(url, resolve, null, reject);
    });
  };
})();

export const loadGLTFCached = (function () {
  const cache = new Map();
  return function loadGLTFCached(url) {
    const cached = cache.get(url);
    if (cached) {
      return cached;
    } else {
      const promise = loadGLTF(url).then(
        (gltf) => {
          return gltf;
        },
        (error) => {
          console.error(`Failed to load ${url}`, error);
          cache.delete(url);
          return null;
        }
      );
      cache.set(url, promise);
      return promise;
    }
  };
})();

export function forEachMaterial(object3D, fn) {
  if (!object3D.material) return;

  if (Array.isArray(object3D.material)) {
    object3D.material.forEach(fn);
  } else {
    fn(object3D.material);
  }
}

export function generateEnvironmentMap(sky, renderer) {
  const skyScene = new THREE.Scene();
  skyScene.add(sky);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const renderTarget = pmremGenerator.fromScene(skyScene);
  pmremGenerator.dispose();

  skyScene.remove(sky);

  return renderTarget.texture;
}

export function createSky() {
  const sky = new Sky();
  sky.scale.setScalar(450000);

  const uniforms = sky.material.uniforms;
  uniforms["turbidity"].value = 1.5;
  uniforms["rayleigh"].value = 1.5;
  uniforms["mieCoefficient"].value = 0.005;
  uniforms["mieDirectionalG"].value = 0.7;

  const inclination = 0.7;
  const azimuth = 0.55;
  const theta = Math.PI * (inclination - 0.5);
  const phi = 2 * Math.PI * (azimuth - 0.5);

  uniforms["sunPosition"].value.set(10, 20, 5);

  return sky;
}

export function generateWave() {
  return new Promise((resolve) => {
    const center = 30;
    const amplitude = 15;
    const height = 200;
    const halfHeight = height / 2;
    const quarterHeight = height / 4;

    const canvas = document.createElement("canvas");
    canvas.width = center + amplitude;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(center, 0);
    ctx.quadraticCurveTo(center + amplitude, quarterHeight, center, halfHeight);
    ctx.quadraticCurveTo(center - amplitude, quarterHeight * 3, center, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    ctx.fill();

    canvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob));
    });
  });
}

export function isThumbnailMode() {
  return new URLSearchParams(location.search).get("thumbnail") !== null;
}
