import * as THREE from "three";
import { createCanvas, createImageData } from 'canvas';
import { mergeGeometry } from "./merge-geometry.js";
import { GetImageData } from "./renderToTexture.js";
import debugConfig from "./debug-config.js";

function createContext({ width, height }) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    console.log(context);
    return context;
}
function getTextureImage(material, textureName, isUniform = false) {
    // material can come in arrays or single values, in case of ccoming in array take the first one
    material = material.length == null ? material : material[0];
    if (isUniform){
      console.log(material)
      if (material.uniforms == null)
        return null && null;
      return material.uniforms[textureName] && material.uniforms[textureName].image;
    }
    return material[textureName] && material[textureName].image;
}
function getMaterialVRMData(material){
  material = material.length == null ? material : material[0];
  return material.userData?.vrmMaterialProperties;
}
function lerp(t, min, max, newMin, newMax) {
    const progress = (t - min) / (max - min);
    return newMin + progress * (newMax - newMin);
}

export const createTextureAtlas = async ({ meshes, atlasSize = 4096 }) => {
    // detect whether we are in node or the browser
    const isNode = typeof window === 'undefined';
    // if we are in node, call createTextureAtlasNode
    if (isNode) {
        return await createTextureAtlasNode({ meshes, atlasSize });
    } else {
        return await createTextureAtlasBrowser({ meshes, atlasSize });
    }
};

export const createTextureAtlasNode = async ({ meshes, atlasSize = 4096 }) => {
  //console.log()
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
            const { source, dest } = mergeGeometry({ meshes: [bakeObject.mesh, mesh] });
            bakeObject.mesh.geometry = dest;
        }
    });
    const contexts = Object.fromEntries(IMAGE_NAMES.map((name) => [name, createContext({ width: ATLAS_SIZE_PX, height: ATLAS_SIZE_PX })]));
    if (typeof window !== "undefined" && debugConfig.debugCanvases) {
      const previous = document.getElementById("debug-canvases");
      if (previous) {
        previous.parentNode.removeChild(previous);
      }
      const domElement = document.createElement("div");
      domElement.style.zIndex = "9999";
      domElement.style.position = "absolute";
      domElement.setAttribute("id", "debug-canvases");
      document.body.append(domElement);
      IMAGE_NAMES.map((name) => {
        const title = document.createElement("h1");
        title.innerText = name;
        domElement.append(title);
        domElement.append(contexts[name].canvas);
      });
    }
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
    const uvs = new Map(bakeObjects.map((bakeObject, i) => {
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
                    const arr = createImageData(imageData, xTileSize, yTileSize);
                    const tempcanvas = createCanvas(tileSize, tileSize);
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
        // const context = contexts['orm'];
        // meshBufferGeometry is a THREE.BufferGeometry
        // const meshBufferGeometry = mesh.geometry;
        // for each triangle in meshBufferGeometry, find the uv coordinates of the triangle's vertices
        // start by iterating over the indices of the triangle vertices
        // const arr = meshBufferGeometry.index.array ?? meshBufferGeometry.index;
        // for (let i = 0; i < arr.length; i += 3) {
        //   // get the indices of the triangle's vertices
        //   const index0 = arr[i];
        //   const index1 = arr[i + 1];
        //   const index2 = arr[i + 2];
        //   // get the uv coordinates of the triangle's vertices
        //   const uv0 = { x: meshBufferGeometry.attributes.uv.array[index0 * 2], y: meshBufferGeometry.attributes.uv.array[index0 * 2 + 1] };
        //   const uv1 = { x: meshBufferGeometry.attributes.uv.array[index1 * 2], y: meshBufferGeometry.attributes.uv.array[index1 * 2 + 1] };
        //   const uv2 = { x: meshBufferGeometry.attributes.uv.array[index2 * 2], y: meshBufferGeometry.attributes.uv.array[index2 * 2 + 1] };
        //   context.fillStyle = `#000000`;
        //   context.beginPath();
        //   // draw lines between each of the triangle's vertices
        //   context.moveTo(uv0.x * ATLAS_SIZE_PX * xScaleFactor, uv0.y * ATLAS_SIZE_PX * yScaleFactor);
        //   context.lineTo(uv1.x * ATLAS_SIZE_PX * xScaleFactor, uv1.y * ATLAS_SIZE_PX * yScaleFactor);
        //   context.lineTo(uv2.x * ATLAS_SIZE_PX * xScaleFactor, uv2.y * ATLAS_SIZE_PX * yScaleFactor);
        //   context.lineTo(uv0.x * ATLAS_SIZE_PX * xScaleFactor, uv0.y * ATLAS_SIZE_PX * yScaleFactor);
        //   context.stroke();
        //   context.closePath();
        // }
    });
    // Create textures from canvases
    const textures = Object.fromEntries(await Promise.all(IMAGE_NAMES.map(async (name) => {
        const texture = new THREE.Texture(contexts[name].canvas);
        // TODO: What is encoding?
        texture.encoding = THREE.sRGBEncoding;
        texture.flipY = false;
        return [name, texture];
    })));
    //console.log('finished')
    return { bakeObjects, textures, uvs };
};
export const createVRMTextureAtlas = async ({color, meshes, atlasSize = 4096}) => { 
  const ATLAS_SIZE_PX = atlasSize;
  //const IMAGE_NAMES = ["diffuse"];
  const bakeObjects = [];
  let vrmData = null;

  // combine meshes by same material and sceve them to bake objects
  meshes.forEach((mesh) => {
    const material = mesh.material.length ==  null ? mesh.material : mesh.material[0];
    let bakeObject = bakeObjects.find((bakeObject) => {
      bakeObject.material === material;
    });
    if (!bakeObject){
      bakeObjects.push({ material, mesh });
    }
    else {
      const { source, dest } = mergeGeometry({ meshes: [bakeObject.mesh, mesh] });
      bakeObject.mesh.geometry = dest;
    }

    const numTiles = Math.floor(Math.sqrt(meshes.length) + 1);
    const tileSize = ATLAS_SIZE_PX / numTiles;

    const originalUVs = new Map(
      bakeObjects.map((bakeObject, i) => {
        const min = new THREE.Vector2(i % numTiles, Math.floor(i / numTiles)).multiplyScalar(1 / numTiles);
        const max = new THREE.Vector2(min.x + 1 / numTiles, min.y + 1 / numTiles);
        return [bakeObject.mesh, { min, max }];
      })
    );
  });


  // get the material texture and color for each bake object.
  bakeObjects.forEach((bakeObject) => {
    // get material and mesh
    const { material, mesh } = bakeObject;
    // get mesh uvs min max
    const { min, max } = uvs.get(mesh);
    // create a context were to draw the final atlas image
    const context = createContext({ width: ATLAS_SIZE_PX, height: ATLAS_SIZE_PX })
    context.globalCompositeOperation = "source-over";
    
    let texture = new THREE.Texture(image);
    texture.needsUpdate = true;
    const imgData = GetImageData(material.map,material.uniforms.color.value,ATLAS_SIZE_PX,ATLAS_SIZE_PX);

    createImageBitmap(imgData)
      .then((bmp) => context.drawImage(bmp, min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX, xTileSize, yTileSize));

    const geometry = mesh.geometry

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
    } else {
      geometry.attributes.uv2 = geometry.attributes.uv;
    }

    const meshBufferGeometry = mesh.geometry;
  });
}
export const createTextureAtlasBrowser = async ({ meshes, atlasSize = 4096}) => {
    const ATLAS_SIZE_PX = atlasSize;
    const IMAGE_NAMES = ["diffuse", "uniformColor"];
    const bakeObjects = [];
    // save if there is vrm data
    let vrmData = null;
    // save material color from here
    // for each mesh in meshes
    meshes.forEach((mesh) => {
      const material = mesh.material.length ==  null ? mesh.material : mesh.material[0];
      
      // use the vrmData of the first material, and call it atlas if it exists
      if (vrmData == null){
        vrmData = getMaterialVRMData(material);
        if (vrmData != null){
          vrmData.name = "atlas";
          vrmData.vectorProperties._Color = [1,1,1,1]
          vrmData.vectorProperties._ShadeColor = [1,1,1,1]
        }
      }
      // check if bakeObjects as any objects that contain the material property with value of mesh.material
      let bakeObject = bakeObjects.find((bakeObject) => {
        //console.log(bakeObject.material);
        bakeObject.material === material;
      });
      if (!bakeObject){
          bakeObjects.push({ material, mesh });
          console.log(bakeObject);
      }
      else {
        
      const { source, dest } = mergeGeometry({ meshes: [bakeObject.mesh, mesh] });

      
      bakeObject.mesh.geometry = dest;
      console.log('baked new geometry', bakeObject);
      }
    });

    //console.log('bakeObjects')
    //console.log(bakeObjects);

     const contexts = Object.fromEntries(
      IMAGE_NAMES.map((name) => [name, createContext({ width: ATLAS_SIZE_PX, height: ATLAS_SIZE_PX })])
    );

    if (debugConfig.debugCanvases) {
      const previous = document.getElementById("debug-canvases");
      if (previous) {
        previous.parentNode.removeChild(previous);
      }

      const domElement = document.createElement("div");
      domElement.style.zIndex = "9999";
      domElement.style.position = "absolute";
      domElement.setAttribute("id", "debug-canvases");
      document.body.append(domElement);

      IMAGE_NAMES.map((name) => {
        const title = document.createElement("h1");
        title.innerText = name;
        domElement.append(title);
        domElement.append(contexts[name].canvas);
      });
    }

    const numTiles = Math.floor(Math.sqrt(meshes.length) + 1);
    const tileSize = ATLAS_SIZE_PX / numTiles;

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
      orm: ["ormMap", "aoMap", "roughnessMap", "metalnessMap"],
      uniformColor:["color"]
    }

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
        bakeObjects.map((bakeObject, i) => {
        let { min, max } = originalUVs.get(bakeObject.mesh);
        min.x = min.x * xScaleFactor;
        min.y = min.y * yScaleFactor;
        max.x = max.x * xScaleFactor;
        max.y = max.y * yScaleFactor;
        return [bakeObject.mesh, { min, max }];
      })
    );
  

      
    bakeObjects.forEach((bakeObject) => {
      const { material, mesh } = bakeObject;
      const { min, max } = uvs.get(mesh);
      console.log(uvs);
      IMAGE_NAMES.forEach((name) => {
        const context = contexts[name];
        context.globalCompositeOperation = "source-over";

        // iterate through imageToMaterialMapping[name] and find the first image that is not null
        
        let image = getTextureImage(material, imageToMaterialMapping[name].find((textureName) => getTextureImage(material, textureName, name.startsWith("uniform"))));
        console.log('name', name, 'image', image);
        console.log(image)
        //if (image) {
          let texture = new THREE.Texture(image);
          texture.needsUpdate = true;
          const imgData = GetImageData(texture,material.uniforms.color.value,ATLAS_SIZE_PX,ATLAS_SIZE_PX);


          //const textureImgata = new Texture 
          // console.log(imgData);
          // const bmp = createImageBitmap(imgData);
          // console.log(bmp)

          //context.putImageData(imgData, min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX,0,0,1000,1000);
          createImageBitmap(imgData)
            .then((bmp) => context.drawImage(bmp, min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX, xTileSize, yTileSize));

          //context.drawImage(bmp, min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX, xTileSize, yTileSize);
        //} 
        // else {
        //   const mat = material.length == null ? material : material[0];
        //   //const color = mat.color instanceof THREE.Color ? mat.color : mat.uniforms.color.value;
        //   const color = mat.color instanceof THREE.Color ? mat.color : new THREE.Color(1,1,1)
        //   switch (name){
        //     case 'diffuse':
        //       console.log("COLOR");
        //       context.fillStyle = `#${color.getHexString()}`;
        //       break;
        //     case 'normal':
        //       context.fillStyle = '#8080ff';
        //       break;
        //     case 'orm':
        //       context.fillStyle = `#${(new THREE.Color(mat.aoMapIntensity, mat.roughness, mat.metalness)).getHexString()}`
        //       break;
        //     case 'uniformColor':
        //       context.fillStyle = `#${mat.uniforms == null ? '8080ff':mat.uniforms.color.value.getHexString()}`;//mat.uniforms.color.value.getHexString();
        //       break;
        //     default:
        //       context.fillStyle = '#7F7F7F';
        //       break;


        //   }
        //   // context.fillStyle = name === 'diffuse' ? `#${color.getHexString()}` : name === 'normal' ? '#8080ff' : name === 'orm' ?
        //   //   `#${(new THREE.Color(mat.aoMapIntensity, mat.roughness, mat.metalness)).getHexString()}` : '#7F7F7F';

        //   // console.log(context)
        //   context.fillRect(min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX, xTileSize, yTileSize);
        //   //context.multiplyScalar(3);
        // }
      }
      );

      //console.log('mesh is', mesh)

      const geometry = mesh.geometry

      const uv = geometry.attributes.uv;
      if (uv) {
        console.log(uv.count);
        for (let i = 0; i < uv.array.length; i += 2) {
          uv.array[i] = lerp(uv.array[i], 0, 1, min.x, max.x);
          uv.array[i + 1] = lerp(uv.array[i + 1], 0, 1, min.y, max.y);
          //uv.array[i] = lerp(uv.array[i], 0, 1, 0, 0.25);
          //uv.array[i + 1] = lerp(uv.array[i + 1], 0, 1, 0, 0.25);
        }
      }
      const uv2 = geometry.attributes.uv2;
      if (uv2) {
        for (let i = 0; i < uv2.array.length; i += 2) {
          uv2.array[i] = lerp(uv2.array[i], 0, 1, min.x, max.x);
          uv2.array[i + 1] = lerp(uv2.array[i + 1], 0, 1, min.y, max.y);
        }
      } else {
        geometry.attributes.uv2 = geometry.attributes.uv;
      }
      const context = contexts['orm'];

      // meshBufferGeometry is a THREE.BufferGeometry
      const meshBufferGeometry = mesh.geometry;
      
      //console.log('meshBufferGeometry' , meshBufferGeometry)
      // for each triangle in meshBufferGeometry, find the uv coordinates of the triangle's vertices
      //console.log('meshBufferGeometry.attributes.uv', meshBufferGeometry.attributes.uv)
      // start by iterating over the indices of the triangle vertices
      //console.log(meshBufferGeometry.index)
      // const arr = meshBufferGeometry.index.array ?? meshBufferGeometry.index;
      // for (let i = 0; i < arr.length; i += 3) {
      //   // get the indices of the triangle's vertices
      //   const index0 = arr[i];
      //   const index1 = arr[i + 1];
      //   const index2 = arr[i + 2];
      //   // get the uv coordinates of the triangle's vertices
      //   const uv0 = { x: meshBufferGeometry.attributes.uv.array[index0 * 2], y: meshBufferGeometry.attributes.uv.array[index0 * 2 + 1] };
      //   const uv1 = { x: meshBufferGeometry.attributes.uv.array[index1 * 2], y: meshBufferGeometry.attributes.uv.array[index1 * 2 + 1] };
      //   const uv2 = { x: meshBufferGeometry.attributes.uv.array[index2 * 2], y: meshBufferGeometry.attributes.uv.array[index2 * 2 + 1] };
        

      //   context.fillStyle = `#000000`;
      //   context.beginPath();
      //   // console.log('drawing triangle', uv0, uv1, uv2);
      //   // draw lines between each of the triangle's vertices
      //   context.moveTo(uv0.x * ATLAS_SIZE_PX * xScaleFactor, uv0.y * ATLAS_SIZE_PX * yScaleFactor);
      //   context.lineTo(uv1.x * ATLAS_SIZE_PX * xScaleFactor, uv1.y * ATLAS_SIZE_PX * yScaleFactor);
      //   context.lineTo(uv2.x * ATLAS_SIZE_PX * xScaleFactor, uv2.y * ATLAS_SIZE_PX * yScaleFactor);
      //   context.lineTo(uv0.x * ATLAS_SIZE_PX * xScaleFactor, uv0.y * ATLAS_SIZE_PX * yScaleFactor);
      //   context.stroke();
      //   context.closePath();
      // }
    });
  
    // Create textures from canvases
    const textures = Object.fromEntries(
      await Promise.all(
        IMAGE_NAMES.map(async (name) => {
          const texture = new THREE.Texture(contexts[name].canvas)
          // TODO: What is encoding?
          texture.encoding = THREE.sRGBEncoding;
          texture.flipY = false;
          return [name, texture];
        })
      )
    );
      
    return { bakeObjects, textures, uvs, vrmData };
  };