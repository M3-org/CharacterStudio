import * as THREE from "three";
import { mergeGeometry } from "./merge-geometry.js";
import { MToonMaterial } from "@pixiv/three-vrm";
import squaresplit from 'squaresplit';
import {createContext} from "./utils.js";
import TextureImageDataRenderer from "./textureImageDataRenderer.js";

function getTextureImage(material:THREE.Material|THREE.Material[], textureName:keyof THREE.Material) {

  // material can come in arrays or single values, in case of ccoming in array take the first one
  material = 'length' in material && material.length ?material[0]: material ;
  return textureName in material && (material as any)[textureName]?.image;
}
function getTexture(material:THREE.Material|THREE.Material[], textureName:keyof THREE.Material) {
  material = 'length' in material && material.length ?material[0]: material ;
  const newTexture = (material as any)[textureName] && (material as any)[textureName].clone();
  return newTexture;
}

function lerp(t:number, min:number, max:number, newMin:number, newMax:number) {
  const progress = (t - min) / (max - min);
  return newMin + progress * (newMax - newMin);
}
const imageToMaterialMapping = {
  diffuse: ["map"],
  normal: ["normalMap"],
  orm: ["ormMap", "aoMap", "roughnessMap", "metalnessMap"]
} as Record<string,any[]>;

export const createTextureAtlas = async ({ transparentColor, meshes, includeNonTexturedMeshesInAtlas=true, atlasSize = 4096, mtoon=true, transparentMaterial=false, transparentTexture = false, twoSidedMaterial = false, scale=1 }:{
  transparentColor:THREE.Color,
  meshes:THREE.Mesh[],
  atlasSize?:number,
  mtoon?:boolean,
  /**
   * If true, Meshes with no textures will be included in the atlas
   */
  includeNonTexturedMeshesInAtlas?:boolean,
  transparentMaterial?:boolean,
  transparentTexture?:boolean,
  twoSidedMaterial?:boolean
  scale?:number
}) => {

  // if we are in node, call createTextureAtlasNode
  return await createTextureAtlasBrowser({ backColor: transparentColor, meshes, atlasSize, mtoon,includeNonTexturedMeshesInAtlas, transparentMaterial, transparentTexture, twoSidedMaterial });
  
};

/**
 * Creates a texture atlas for the given meshes in a browser environment.
 * 
 * @param {Object} params - The parameters for creating the texture atlas.
 * @param {THREE.Color} params.backColor - The background color for the texture atlas.
 * @param {boolean} [params.includeNonTexturedMeshesInAtlas=false] - Whether to include meshes without textures in the atlas.
 * @param {THREE.Mesh[]} params.meshes - The array of meshes to include in the texture atlas.
 * @param {number} params.atlasSize - The size of the texture atlas in pixels.
 * @param {boolean} params.mtoon - Whether to use MToon material.
 * @param {boolean} params.transparentMaterial - Whether the material is transparent.
 * @param {boolean} params.transparentTexture - Whether the texture is transparent.
 * @param {boolean} params.twoSidedMaterial - Whether the material is two-sided.
 * @param {number} params.scale - The scale factor for the meshes.
 */
export const createTextureAtlasBrowser = async ({ backColor,includeNonTexturedMeshesInAtlas=true, meshes, atlasSize, mtoon, transparentMaterial, transparentTexture, 
  twoSidedMaterial=false, 
  scale=1 }:{
  backColor:THREE.Color,
  meshes:THREE.Mesh[],
  atlasSize:number,
  mtoon:boolean,
  includeNonTexturedMeshesInAtlas?:boolean,
  transparentMaterial:boolean,
  transparentTexture:boolean,
  twoSidedMaterial?:boolean,
  scale?:number
}) => {
  const ATLAS_SIZE_PX = atlasSize;
  const IMAGE_NAMES = mtoon ? ["diffuse"] : ["diffuse", "orm", "normal"];// not using normal texture for now
  const bakeObjects:{material:THREE.MeshStandardMaterial|THREE.ShaderMaterial,mesh:(THREE.Mesh| THREE.SkinnedMesh), siblings:THREE.Mesh[]}[] = [];
  // save if there is vrm data
  let vrmMaterial:THREE.ShaderMaterial = null!;

  // save material color from here

  meshes.forEach((mesh) => {

    mesh = mesh.clone();

    const material = ('length' in mesh.material && mesh.material.length ? mesh.material[0]:mesh.material) as THREE.ShaderMaterial | THREE.MeshStandardMaterial

    // use the vrmData of the first material, and call it atlas if it exists
    if (mtoon && vrmMaterial == null && material.type == "ShaderMaterial") {
      vrmMaterial = material.clone() as THREE.ShaderMaterial;
    }
    // check if bakeObjects objects that contain the material property with value of mesh.material
    let bakeObject = bakeObjects.find((bakeObject) => bakeObject.material === material);
    if (!bakeObject) {
      bakeObjects.push({ material, mesh, siblings:[] });
    }
    else {
        // @IMPROVEMENT: Merge meshes with the same material instead of keeping them separate; BUT make sure you merge morph targets and handle VRM expression bind changes!!!

        // In the meantime, we use the siblings system to keep track of the meshes that share the same material; This allows us to have shared materials for some meshes.
        bakeObject.siblings.push(mesh);
    }
  })

  // create the canvas to draw textures
  //transparent: (name == "diffuse" && drawTransparent)
  const contexts = Object.fromEntries(
    IMAGE_NAMES.map((name) => [name, createContext({ width: ATLAS_SIZE_PX, height: ATLAS_SIZE_PX, transparent:transparentTexture && name == "diffuse" })])
  );


  const bakeObjectsWithNoTextures:Set<THREE.Mesh>=new Set()
  const bakeObjectsWithSameMaterial = new Map<THREE.Material,THREE.Mesh[]>();

  /**
   * Sorts the meshes by the number of triangles they have, but also groups meshes with the same material properties if they have no textures.
   * A high number (high tri count) means the mesh will take up more space in the atlas.
   * A low number (low tri count) means the mesh will take up less space in the atlas.
   */
  const meshTriangleSorted = bakeObjects.map<[THREE.Mesh,number]>((bakeObject) => {
    const geometry = bakeObject.mesh.geometry;
    
    /**
     *  We don't want to include meshes that are turned off in the atlas, and
     *  we want to combine meshes with the same material properties;
     *  */
      if(includeNonTexturedMeshesInAtlas == false){
        if(!bakeObject.mesh.visible){
          bakeObjectsWithNoTextures.add(bakeObject.mesh)
          // mesh is not visible
          return [bakeObject.mesh, 0];
        }

        let hasNoTexture = true
        for(const name of IMAGE_NAMES){
          for(const textureName of imageToMaterialMapping[name]){
            const texture = getTextureImage(bakeObject.material, textureName)
            if(texture){
              if(hasNoTexture){
                hasNoTexture = false;
                break;
              }
            }
          }
        }
        if(hasNoTexture){
          /**
           * For each mesh with no textures, group with those that have the same properties
           */
          const material = bakeObject.material;
          if(material instanceof THREE.ShaderMaterial){
            // if it's a shaderMaterial, we can't compare the material directly assign small space
            return [bakeObject.mesh, 2];
          }

          if(bakeObjectsWithSameMaterial.size == 0){
            // if there are no meshes with the same material, add the first one
            bakeObjectsWithSameMaterial.set(material,[bakeObject.mesh])
            return [bakeObject.mesh, 1];// assign small space
          }

          for(let [mat,prevBakeMeshes] of Array.from(bakeObjectsWithSameMaterial.entries())){
            const prevMat = mat as THREE.MeshStandardMaterial;

            const isSimilarMat = ()=>{            
              /**
               * Typical javascript will convert colors to numbers with billions of decimal places and compare each.
               * comparing colors at the 5th decimal place is enough to determine if they are the same
               */
              const colorAlmostEqual = prevMat.color.r.toFixed(5) == material.color.r.toFixed(5) &&
              prevMat.color.g.toFixed(5) == material.color.g.toFixed(5) &&
              prevMat.color.b.toFixed(5) == material.color.b.toFixed(5)

              // no need to check metalnessMap, aoMap, roughnessMap, normalMap, Map because we already checked if the textures exist
              return colorAlmostEqual &&
              prevMat.emissive.equals(material.emissive) && 
              prevMat.aoMapIntensity == material.aoMapIntensity &&
              prevMat.metalness == material.metalness &&
              prevMat.normalScale.equals(material.normalScale) &&
              prevMat.roughness == material.roughness && 
              prevMat.transparent == material.transparent &&
              prevMat.vertexColors == material.vertexColors
            }
            if(isSimilarMat()){
              prevBakeMeshes.push(bakeObject.mesh)
              return [bakeObject.mesh, 0];// no need to add space since it's the same material as another mesh
            }else{
              continue;
            }
          }
          bakeObjectsWithSameMaterial.set(material,[bakeObject.mesh])
          return [bakeObject.mesh, 1];// assign small space
        }
      }
      /**
       * We have siblings, add them to the bakeObjectsWithSameMaterial map
       */
      if (
        bakeObject.siblings?.length > 0
      ){
        if(bakeObjectsWithSameMaterial.has(bakeObject.material)){
          bakeObjectsWithSameMaterial.get(bakeObject.material)?.push(...bakeObject.siblings,bakeObject.mesh);
        }else{
          bakeObjectsWithSameMaterial.set(bakeObject.material, [bakeObject.mesh,...bakeObject.siblings]);
        }
      }

    return [bakeObject.mesh, geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3];
  }).sort((a, b) => b[1] - a[1]);
  
  /**
   * Get all meshes that have textures
   */
  const meshTriangleSortedWithTextures = meshTriangleSorted.filter(([, count])=>count!=0)
  /**
   * Generate a square for each mesh with a material
   */
  const {squares,fill} = squaresplit(meshTriangleSortedWithTextures.length,ATLAS_SIZE_PX);
  console.log('squaresplit',fill)

  const reformattedSquares = squares.map((box) => {
    return {x:box.x, y:box.y, width:box.w, height:box.h}
  });

  /**
   *  Map each mesh to a square
   */
  const tileSize = new Map(reformattedSquares.map((square, i) => {
    return [meshTriangleSorted[i][0], square];
  }));

  /**
   * Add the meshes that have shared material to the square
   */
  bakeObjectsWithSameMaterial.forEach((meshes)=>{
    if(meshes.length>1){
      const square = tileSize.get(meshes[0])!
      meshes.forEach((mesh)=>{
        tileSize.set(mesh,square)
      })
    }
  })



  // get the min/max of the uvs of each mesh
  const originalUVs = new Map<THREE.Mesh,{min:THREE.Vector2,max:THREE.Vector2}>(
    Array.from(tileSize.entries()).map(([mesh,square]) => {
      const min = new THREE.Vector2(square.x, square.y);
      const max = new THREE.Vector2((square.x + square.width), (square.y + square.height));
      return [mesh, { min, max }];
    })
  );

  // uvs
  const uvBoundsMin:THREE.Vector2[] = [];
  const uvBoundsMax:THREE.Vector2[] = [];

  Array.from(tileSize.keys()).forEach((mesh) => {
    if(bakeObjectsWithNoTextures.has(mesh)){
      // mesh has no UVs
      return;
    }
    const { min, max } = originalUVs.get(mesh)!;
    uvBoundsMax.push(max);
    uvBoundsMin.push(min);
  });

  // find the smallest x and y in the Vector2 array uvBoundsMin
  const minUv = new THREE.Vector2(
    Math.min(...uvBoundsMin.map((uv) => uv.x)),
    Math.min(...uvBoundsMin.map((uv) => uv.y))
  );

  // We want the highest X to be the atlas size;
  const xScaleFactor = 1 / (ATLAS_SIZE_PX - minUv.x);
  const yScaleFactor = 1 / (ATLAS_SIZE_PX - minUv.y);

  const uvs = new Map(
    Array.from(tileSize.keys()).map((mesh) => {
      if(bakeObjectsWithNoTextures.has(mesh)){
        // mesh has no texture whatsoever, remove the UV mapping
        return
      }
      let { min, max } = originalUVs.get(mesh)!;
      min.x = min.x * xScaleFactor;
      min.y = min.y * yScaleFactor;
      max.x = max.x * xScaleFactor;
      max.y = max.y * yScaleFactor;
      return [mesh, { min, max }];
    }).filter((x=>x) )as [THREE.Mesh,{min:THREE.Vector2,max:THREE.Vector2}][] // remove undefined
  );


  let usesNormal = false;
  const textureImageDataRenderer = new TextureImageDataRenderer(ATLAS_SIZE_PX, ATLAS_SIZE_PX);
  Array.from(tileSize.keys()).forEach((mesh) => {
    const bakeObject = bakeObjects.find(
      (bakeObject) => bakeObject.mesh === mesh || bakeObject.siblings?.includes(mesh)
    )!;
    const { material } = bakeObject;
    let min:THREE.Vector2, max:THREE.Vector2;
    const uvMinMax = uvs.get(mesh);
    if(uvMinMax){
      min = uvMinMax.min;
      max = uvMinMax.max;
    }else{
      min = new THREE.Vector2(0,0);
      max = new THREE.Vector2(0,0);
    }

    // If the mesh has no texture, we don't need to draw anything;
    if(!bakeObjectsWithNoTextures.has(bakeObject.mesh)){

      const xTileSize = tileSize.get(mesh)!.width;
      const yTileSize = tileSize.get(mesh)!.height;

      IMAGE_NAMES.forEach((name) => {
        const context = contexts[name];
        //context.globalAlpha = transparent ? 0.2 : 1;
        context.globalCompositeOperation = "source-over";

        // set white color base
        let clearColor;
        let multiplyColor = new THREE.Color(1, 1, 1);
        switch (name) {
          case 'diffuse':
            clearColor = (material as THREE.MeshStandardMaterial).color || backColor;
            if ((material as THREE.ShaderMaterial).uniforms?.litFactor){
              multiplyColor = (material as THREE.ShaderMaterial).uniforms.litFactor.value;
            }
            else{
              multiplyColor = (material as THREE.MeshStandardMaterial).color;
            }
            break;
          case 'normal':
            clearColor = new THREE.Color(0xbcbcff);
            break;
          case 'orm':
            clearColor = new THREE.Color(0, (material as THREE.MeshStandardMaterial).roughness, (material as THREE.MeshStandardMaterial).metalness);
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
        const imgData = textureImageDataRenderer.render(texture, multiplyColor, clearColor, name == 'diffuse' && transparentTexture, name != 'normal');
        createImageBitmap(imgData)// bmp is trasnaprent
          .then((bmp) => context.drawImage(bmp, min.x * ATLAS_SIZE_PX, min.y * ATLAS_SIZE_PX, xTileSize, yTileSize));
      });
    }

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
    material.map!.name = material.name;
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


  /**
   * We're done creating the atlas, Remove siblings and bring them back into the bakeObject list
   */
  const siblings:{
    material:THREE.MeshStandardMaterial|THREE.ShaderMaterial,
    mesh:(THREE.Mesh| THREE.SkinnedMesh),
    siblings:THREE.Mesh[]
  }[] = []
  
  bakeObjects.map((bakeObject) => {
    bakeObject.siblings?.forEach((sibling) => {
      const material = bakeObject.material;
      siblings.push({
        material,
        mesh: sibling,
        siblings: [],
      })
    })
  });
  bakeObjects.push(...siblings);

  // xxxreturn material with textures, dont return uvs nor textures
  return { bakeObjects, material };
};