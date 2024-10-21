import * as THREE from "three";
import { mergeGeometry } from "./merge-geometry.js";
import { MToonMaterial } from "@pixiv/three-vrm";
import TextureImageDataRenderer from "./textureImageDataRenderer.js";

function createContext({ width, height, transparent }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "white";
  if (transparent) 
    context.globalAlpha = 0;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = 1;
  return context;
}
function getTextureImage(material, textureName) {

  // material can come in arrays or single values, in case of ccoming in array take the first one
  material = material.length == null ? material : material[0];
  return material[textureName] && material[textureName].image;
}
function getTexture(material, textureName) {
  material = material.length == null ? material : material[0];
  const newTexture = material[textureName] && material[textureName].clone();
  return newTexture;
}
// function getMaterialVRMData(material) {
//   material = material.length == null ? material : material[0];
//   return material.userData?.vrmMaterialProperties;
// }
function lerp(t, min, max, newMin, newMax) {
  const progress = (t - min) / (max - min);
  return newMin + progress * (newMax - newMin);
}

export const createTextureAtlas = async ({ transparentColor, meshes, atlasSize = 4096, mtoon=true, transparentMaterial=false, transparentTexture = false, twoSidedMaterial = false }) => {
  // detect whether we are in node or the browser
  const isNode = typeof window === 'undefined';
  // if we are in node, call createTextureAtlasNode
  if (isNode) {
    return await createTextureAtlasNode({ meshes, atlasSize, mtoon, transparentMaterial, transparentTexture });
  } else {
    return await createTextureAtlasBrowser({ backColor: transparentColor, meshes, atlasSize, mtoon, transparentMaterial, transparentTexture, twoSidedMaterial });
    //return await createTextureAtlasBrowser({ meshes, atlasSize });
  }
};

export const createTextureAtlasNode = async ({ meshes, atlasSize, mtoon, transparentMaterial, transparentTexture }) => {
  const ATLAS_SIZE_PX = atlasSize;
  const IMAGE_NAMES = ["diffuse"];
  const bakeObjects = [];
  // for each mesh in meshes
  meshes.forEach((mesh) => {
    const material = mesh.material;
    // check if bakeObjects objects that contain the material property with value of mesh.material
    let bakeObject = bakeObjects.find((bakeObject) => bakeObject.material === material);
    if (!bakeObject)
      bakeObjects.push({ material, mesh });
    else {
      const { dest } = mergeGeometry({ meshes: [bakeObject.mesh, mesh] });
      bakeObject.mesh.geometry = dest;
    }
  });
  
  const contexts = Object.fromEntries(IMAGE_NAMES.map((name) => [name, createContext({ width: ATLAS_SIZE_PX, height: ATLAS_SIZE_PX , transparent: transparentTexture})]));
  const numTiles = Math.floor(Math.sqrt(meshes.length) + 1);
  const tileSize = ATLAS_SIZE_PX / numTiles;
  const originalUVs = new Map(bakeObjects.map((bakeObject, i) => {
    const min = new THREE.Vector2(i % numTiles, Math.floor(i / numTiles)).multiplyScalar(1 / numTiles);
    const max = new THREE.Vector2(min.x + 1 / numTiles, min.y + 1 / numTiles);
    return [bakeObject.mesh, { min, max }];
  }));
  const imageToMaterialMapping = {
    diffuse: ["map"],
    normal: ["normalMap"],
    orm: ["ormMap", "aoMap", "roughnessMap", "metalnessMap"]
  };
  const uvBoundsMin = [];
  const uvBoundsMax = [];
  bakeObjects.forEach((bakeObject) => {
    const { min, max } = originalUVs.get(bakeObject.mesh);
    uvBoundsMax.push(max);
    uvBoundsMin.push(min);
  });
  // find the largest x and y in the Vector2 array uvBoundsMax
  const maxUv = new THREE.Vector2(Math.max(...uvBoundsMax.map((uv) => uv.x)), Math.max(...uvBoundsMax.map((uv) => uv.y)));
  // find the smallest x and y in the Vector2 array uvBoundsMin
  const minUv = new THREE.Vector2(Math.min(...uvBoundsMin.map((uv) => uv.x)), Math.min(...uvBoundsMin.map((uv) => uv.y)));
  const xScaleFactor = 1 / (maxUv.x - minUv.x);
  const yScaleFactor = 1 / (maxUv.y - minUv.y);
  const xTileSize = tileSize * xScaleFactor;
  const yTileSize = tileSize * yScaleFactor;
  const uvs = new Map(bakeObjects.map((bakeObject) => {
    let { min, max } = originalUVs.get(bakeObject.mesh);
    min.x = min.x * xScaleFactor;
    min.y = min.y * yScaleFactor;
    max.x = max.x * xScaleFactor;
    max.y = max.y * yScaleFactor;
    return [bakeObject.mesh, { min, max }];
  }));
  bakeObjects.forEach((bakeObject) => {
    const { material, mesh } = bakeObject;
    const { min, max } = uvs.get(mesh);
    IMAGE_NAMES.forEach((name) => {
      const context = contexts[name];
      context.globalCompositeOperation = "source-over";
      // iterate through imageToMaterialMapping[name] and find the first image that is not null
      let image = getTextureImage(material, imageToMaterialMapping[name].find((textureName) => getTextureImage(material, textureName)));
      if (image !== '' && image !== undefined) {
        try {
          const imageData = new Uint8ClampedArray(image.data);
          const arr = new ImageData(imageData, xTileSize, yTileSize);
          const tempcanvas = document.createElement("canvas");
          tempcanvas.width = xTileSize;
          tempcanvas.height = yTileSize;
          const tempctx = tempcanvas.getContext("2d");

          tempctx.putImageData(arr, 0, 0);
          tempctx.save();
          // draw tempctx onto context
          context.drawImage(tempcanvas, min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX, xTileSize, yTileSize);
        }
        catch (error) {
          console.error('error', error);
        }
      }
      else {
        context.fillStyle = name === 'diffuse' ? `#${material.color.clone().getHexString()}` : name === 'normal' ? '#8080ff' : name === 'orm' ?
          `#${(new THREE.Color(material.aoMapIntensity, material.roughness, material.metalness)).getHexString()}` : '#7F7F7F';
        context.fillRect(min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX, xTileSize, yTileSize);
      }
    });
    const geometry = mesh.geometry;
    const uv = geometry.attributes.uv;
    if (uv) {
      for (let i = 0; i < uv.array.length; i += 2) {
        uv.array[i] = lerp(uv.array[i], 0, 1, min.x, max.x);
        uv.array[i + 1] = lerp(uv.array[i + 1], 0, 1, min.y, max.y);
      }
    }
    const uv2 = geometry.attributes.uv2;
    if (uv2) {
      for (let i = 0; i < uv2.array.length; i += 2) {
        uv2.array[i] = lerp(uv2.array[i], 0, 1, min.x, max.x);
        uv2.array[i + 1] = lerp(uv2.array[i + 1], 0, 1, min.y, max.y);
      }
    }
    else {
      geometry.attributes.uv2 = geometry.attributes.uv;
    }
  });

  // Create textures from canvases
  const textures = Object.fromEntries(await Promise.all(IMAGE_NAMES.map(async (name) => {
    const texture = new THREE.Texture(contexts[name].canvas);
    texture.flipY = false;
    return [name, texture];
  })));

  return { bakeObjects, textures, uvs };
};

export const createTextureAtlasBrowser = async ({ backColor, meshes, atlasSize, mtoon, transparentMaterial, transparentTexture, twoSidedMaterial }) => {
  const ATLAS_SIZE_PX = atlasSize;
  const IMAGE_NAMES = mtoon ? ["diffuse"] : ["diffuse", "orm", "normal"];// not using normal texture for now
  const bakeObjects = [];
  // save if there is vrm data
  let vrmMaterial = null;

  // save material color from here

  meshes.forEach((mesh) => {

    mesh = mesh.clone();

    const material = mesh.material.length == null ? mesh.material : mesh.material[0];
    // use the vrmData of the first material, and call it atlas if it exists
    if (mtoon && vrmMaterial == null && material.type == "ShaderMaterial") {
      vrmMaterial = material.clone();
    }
    // check if bakeObjects objects that contain the material property with value of mesh.material
    let bakeObject = bakeObjects.find((bakeObject) => {
      bakeObject.material === material;
    });
    if (!bakeObject) {
      bakeObjects.push({ material, mesh });
    }
    else {
      const { dest } = mergeGeometry({ meshes: [bakeObject.mesh, mesh] });
      bakeObject.mesh.geometry = dest;
    }
  });

  // create the canvas to draw textures
  //transparent: (name == "diffuse" && drawTransparent)
  const contexts = Object.fromEntries(
    IMAGE_NAMES.map((name) => [name, createContext({ width: ATLAS_SIZE_PX, height: ATLAS_SIZE_PX, transparent:transparentTexture && name == "diffuse" })])
  );

  const numTiles = Math.floor(Math.sqrt(meshes.length) + 1);
  const tileSize = ATLAS_SIZE_PX / numTiles;

  // get the min/max of the uvs of each mesh
  const originalUVs = new Map(
    bakeObjects.map((bakeObject, i) => {
      const min = new THREE.Vector2(i % numTiles, Math.floor(i / numTiles)).multiplyScalar(1 / numTiles);
      const max = new THREE.Vector2(min.x + 1 / numTiles, min.y + 1 / numTiles);
      return [bakeObject.mesh, { min, max }];
    })
  );


  const imageToMaterialMapping = {
    diffuse: ["map"],
    normal: ["normalMap"],
    orm: ["ormMap", "aoMap", "roughnessMap", "metalnessMap"]
  }

  // uvs
  const uvBoundsMin = [];
  const uvBoundsMax = [];

  bakeObjects.forEach((bakeObject) => {
    const { min, max } = originalUVs.get(bakeObject.mesh);
    uvBoundsMax.push(max);
    uvBoundsMin.push(min);
  });

  // find the largest x and y in the Vector2 array uvBoundsMax
  const maxUv = new THREE.Vector2(
    Math.max(...uvBoundsMax.map((uv) => uv.x)),
    Math.max(...uvBoundsMax.map((uv) => uv.y))
  );

  // find the smallest x and y in the Vector2 array uvBoundsMin
  const minUv = new THREE.Vector2(
    Math.min(...uvBoundsMin.map((uv) => uv.x)),
    Math.min(...uvBoundsMin.map((uv) => uv.y))
  );

  const xScaleFactor = 1 / (maxUv.x - minUv.x);
  const yScaleFactor = 1 / (maxUv.y - minUv.y);

  const xTileSize = tileSize * xScaleFactor;
  const yTileSize = tileSize * yScaleFactor;

  const uvs = new Map(
    bakeObjects.map((bakeObject) => {
      let { min, max } = originalUVs.get(bakeObject.mesh);
      min.x = min.x * xScaleFactor;
      min.y = min.y * yScaleFactor;
      max.x = max.x * xScaleFactor;
      max.y = max.y * yScaleFactor;
      return [bakeObject.mesh, { min, max }];
    })
  );


  let usesNormal = false;
  const textureImageDataRenderer = new TextureImageDataRenderer(ATLAS_SIZE_PX, ATLAS_SIZE_PX);
  bakeObjects.forEach((bakeObject) => {
    const { material, mesh } = bakeObject;
    const { min, max } = uvs.get(mesh);
    IMAGE_NAMES.forEach((name) => {
      const context = contexts[name];
      //context.globalAlpha = transparent ? 0.2 : 1;
      context.globalCompositeOperation = "source-over";

      // set white color base
      let clearColor;
      let multiplyColor = new THREE.Color(1, 1, 1);
      switch (name) {
        case 'diffuse':
          clearColor = material.color || backColor;
          if (material.uniforms?.litFactor){
            multiplyColor = material.uniforms.litFactor.value;
          }
          else{
            multiplyColor = material.color;
          }
          break;
        case 'normal':
          clearColor = new THREE.Color(0x8080FF);
          break;
        case 'orm':
          clearColor = new THREE.Color(0, material.roughness, material.metalness);
          break;
        default:
          clearColor = new THREE.Color(1, 1, 1);
          break;
      }
      // iterate through imageToMaterialMapping[name] and find the first image that is not null
      let texture = getTexture(material, imageToMaterialMapping[name].find((textureName) => getTextureImage(material, textureName)));
      if (usesNormal == false && name == 'normal' && texture != null){
        usesNormal = true;
      }
      const imgData = textureImageDataRenderer.render(texture, multiplyColor, clearColor, ATLAS_SIZE_PX, ATLAS_SIZE_PX, name == 'diffuse' && transparentTexture, name != 'normal');
      createImageBitmap(imgData)// bmp is trasnaprent
        .then((bmp) => context.drawImage(bmp, min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX, xTileSize, yTileSize));
    });

    const geometry = mesh.geometry.clone();
    mesh.geometry = geometry;

    const uv = geometry.attributes.uv.clone();
    geometry.attributes.uv = uv;

    if (uv) {
      for (let i = 0; i < geometry.attributes.uv.array.length; i += 2) {
        uv.array[i] = (uv.array[i] % 1 + 1) % 1;
        uv.array[i + 1] = (uv.array[i + 1] % 1 + 1) % 1;

        // Apply lerp using the adjusted UV values
        uv.array[i] = lerp(uv.array[i], 0, 1, min.x, max.x);
        uv.array[i + 1] = lerp(uv.array[i + 1], 0, 1, min.y, max.y);
      }
    }
    //geometry.setAttribute( 'uv', uv.array);
    //geometry.attributes.uv =
    //mesh.geom
    const uv2 = geometry.attributes.uv2;
    if (uv2) {
      for (let i = 0; i < uv2.array.length; i += 2) {
        uv2.array[i] = (uv2.array[i] % 1 + 1) % 1;
        uv2.array[i + 1] = (uv2.array[i + 1] % 1 + 1) % 1;

        uv2.array[i] = lerp(uv2.array[i], 0, 1, min.x, max.x);
        uv2.array[i + 1] = lerp(uv2.array[i + 1], 0, 1, min.y, max.y);
      }
    } else {
      geometry.attributes.uv2 = geometry.attributes.uv;
    }
    // const context = contexts['orm'];

    // // meshBufferGeometry is a THREE.BufferGeometry
    // const meshBufferGeometry = mesh.geometry;
  });
  textureImageDataRenderer.destroy();
  // Create textures from canvases
  const textures = Object.fromEntries(
    await Promise.all(
      IMAGE_NAMES.map(async (name) => {
        const texture = new THREE.Texture(contexts[name].canvas)
        texture.flipY = false;
        //const matName = (mtoon ? "mtoon_" : "standard") + (transparentMaterial ? "transp_":"opaque_");
        //texture.name = matName + name;
        return [name, texture];
      })
    )
  );
  const side = twoSidedMaterial ? THREE.DoubleSide : THREE.FrontSide;
  let material;
  const materialPostName = transparentMaterial ? "transparent":"opaque"
  if (mtoon){
    // xxx set textures and colors
    // save material as standard material
    material = new THREE.MeshStandardMaterial({
      map: textures["diffuse"],
      transparent: transparentMaterial,
      side: side,
    });

    // make sure to avoid in transparent material alphatest


    // but also store a vrm material that will hold the extension information
    if (vrmMaterial == null){
      vrmMaterial = new MToonMaterial();
    }
    vrmMaterial.side = side;
    vrmMaterial.uniforms.map = textures["diffuse"];
    vrmMaterial.uniforms.shadeMultiplyTexture = textures["diffuse"];
    vrmMaterial.transparent = transparentMaterial;
    if (transparentTexture && !transparentMaterial){
      material.alphaTest = 0.5;
      vrmMaterial.alphaTest = 0.5;
    }
    
    material.userData.vrmMaterial = vrmMaterial;

    // uniform color is not defined, remove or check why
    material.userData.shadeTexture = textures["uniformColor"];
    material.name = "mToon_" + materialPostName;
    material.map.name = material.name;
  }
  else{
    material = new THREE.MeshStandardMaterial({
      map: textures["diffuse"],
      roughnessMap: textures["orm"],
      metalnessMap:  textures["orm"],
      normalMap: usesNormal ? textures["normal"]:null,
      transparent: transparentMaterial,
      side:side
    });

    // make sure to avoid in transparent material alphatest
    if (transparentTexture && !transparentMaterial){  
      material.alphaTest = 0.5;
    }
    material.name = "standard_" + materialPostName;

    if (material.roughnessMap != null)
      material.roughnessMap.name = material.name + "_orm";
    if (material.normalMap != null)
      material.normalMap.name = material.name + "_normal";
  }
  // xxxreturn material with textures, dont return uvs nor textures
  return { bakeObjects, material };
};