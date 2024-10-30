import * as THREE from "three";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
// import { GLTFCubicSplineInterpolant } from "./gltf-cubic-spline-interpolant.js";
import { findChildrenByType, getMeshesSortedByMaterialArray } from "./utils.js";
import { createTextureAtlas } from "./create-texture-atlas.js";
import { BufferAttribute } from "three";

export function cloneSkeleton(skinnedMesh) {
    const boneClones = new Map();
    for (const bone of skinnedMesh.skeleton.bones) {
        const clone = bone.clone(false);
        boneClones.set(bone, clone);
    }
    // Preserve original bone structure
    // Assume bones[0] is root bone
    skinnedMesh.skeleton.bones[0].traverse((o) => {
        if (o.type !== "Bone")
            return;
            
        const clone = boneClones.get(o);
        for (const child of o.children) {
            const ch = boneClones.get(child);
            if (ch)clone.add(ch);
        }
    });
    const newSkeleton = new THREE.Skeleton(skinnedMesh.skeleton.bones.map((b) => boneClones.get(b)));
    newSkeleton.boneInverses = skinnedMesh.skeleton.boneInverses;
    newSkeleton.pose();
    return newSkeleton;
}

// previous attempt to clone skeleton
// export function cloneSkeleton(skinnedMesh) {
//     const boneClones = new Map();
//     skinnedMesh.skeleton.pose();
//     skinnedMesh.skeleton.bones[0].traverse((o) =>{
//         if (o.type === "Bone"){
//             const clone = o.clone(false);
//             // clone.position.x *= -1;
//             // clone.position.z *= -1; 
//             boneClones.set(o, clone);
//         }
//     });


//     // Preserve original bone structure
//     // Assume bones[0] is root bone

//     const skeletonBonesUpdated = [];
//     const skeletonBonesInverses = [];

//     skinnedMesh.skeleton.bones[0].traverse((o) => {
//         if (o.type !== "Bone") return;

//         skeletonBonesUpdated.push(o); 

//         // Calculate inverse bind matrix and store it in the array
//         const inverseBindMatrix = new THREE.Matrix4();
//         const parentWorldInverse = new THREE.Matrix4();

//         if (o.parent) {
//             o.parent.updateMatrixWorld(true);
//             parentWorldInverse.copy( o.parent.matrixWorld ).invert();
//             inverseBindMatrix.multiplyMatrices(o.matrixWorld, parentWorldInverse);
//         }

//         skeletonBonesInverses.push(inverseBindMatrix);

//         const clone = boneClones.get(o);

//         for (const child of o.children) {
//             const ch = boneClones.get(child);
//             if (ch) {
//                 clone.add(ch);
//             }
//         }
//     });
//     const newSkeleton = new THREE.Skeleton(skeletonBonesUpdated.map((b) => boneClones.get(b)));
//     //newSkeleton.boneInverses = skeletonBonesInverses;
//     newSkeleton.pose();
//     return newSkeleton;
// }

function changeBoneHandedness(bone) {
    console.log("isvrm0")
    // Clone the bone and apply handedness change
    const clone = bone.clone(false);

    // Reverse the X-axis scale to change handedness
    const scale = clone.scale;
    scale.x = -scale.x;

    // Reverse the rotation around the Y-axis to change handedness
    const rotation = clone.rotation;
    rotation.y = -rotation.y;

    // You might need to adjust the position as well depending on your specific use case.
    // If the mesh is centered at the origin, this may not be necessary.
    // If your mesh has been moved from the origin, you may need to adjust the position as well.
    // clone.position.x = -clone.position.x;

    clone.position.set(0,0,0);

    return clone;
}
function createMergedSkeleton(meshes, scale){
    /* user should be careful with naming convetions in custom bone names out from humanoids vrm definition,
    for example ones that come from head (to add hair movement), should start with vrm's connected bone 
    followed by the number of the bone in reference to the base bone (head > head_hair_00 > head_hair_01),
    this will avoid an error of not adding bones if they have they same name but are in different hierarchy location
    todo: add to a user guide how to name bones to avoid this error */
    const boneClones = new Map();
    const zxNeg = new THREE.Vector3(-1,1,-1)
    const bnWorldMatrix = new THREE.Matrix4();
    const bnPosition = new THREE.Vector3();

    let index = 0;
    meshes.forEach(mesh => {
        if (mesh.skeleton){
            // Create a new skeleton by cloning the source skeleton
            var clonedSkeleton = cloneSkeleton(mesh);
            // take all bones as they come
            const boneArr = clonedSkeleton.bones;
            
            clonedSkeleton.bones.forEach((bone, boneInd) => {
                // only bones that are included in the previous array (used bones)
                if (boneArr.indexOf(bone)!==-1){
                    const clone = boneClones.get(bone.name);      
                    if (clone == null){ // no clone was found with the bone
                        const boneData = {
                            index,
                            boneInverses:clonedSkeleton.boneInverses[boneInd],
                            bone: bone.clone(false),
                            parentName: bone.parent?.type == "Bone" ? bone.parent.name:null
                        }   
                        index++
                        boneClones.set(bone.name, boneData);
                    }
                    else{
                        // make sure to store vrm colliders when found on other skeletons
                        if (bone.userData.VRMcolliders != null){
                            if (clone.bone.userData.VRMcolliders == null){
                                clone.bone.userData.VRMcolliders = bone.userData.VRMcolliders;
                            }
                            else{
                                // compare before merge if its not already added:
                                // this case happens when a single trait model includes more than on skinned mesh
                                if (bone.userData.VRMcollidersID != clone.bone.userData.VRMcollidersID){
                                    clone.bone.userData.VRMcolliders = [
                                        ...clone.bone.userData.VRMcolliders,
                                        ...bone.userData.VRMcolliders
                                    ];
                                }
                            }
                        }
                    }    
                }    
                
            })
        }
    });

    const finalBones = [];
    const finalBoneInverses = [];
    let boneClonesArr =[ ...boneClones.values() ];
    boneClonesArr.forEach(bnClone => {
        finalBones.push(bnClone.bone)
        finalBoneInverses.push(bnClone.boneInverses)
        if (bnClone.parentName != null){
            const parent = boneClones.get(bnClone.parentName)?.bone 
            if (parent)
                parent.add(bnClone.bone)
        }
    }); 
    const newSkeleton = new THREE.Skeleton(finalBones,finalBoneInverses);
    //newSkeleton.pose(); bones are posed when cloning the skeleton, dont pose here
    
    newSkeleton.bones.forEach(bn => {
        const restPosition = bn.userData?.vrm0RestPosition;
        if (restPosition){
            bn.position.set(-restPosition.x , restPosition.y, -restPosition.z);
        }
        bn.position.set(bn.position.x * scale, bn.position.y * scale,bn.position.z * scale);
    });
    return newSkeleton
}
function getUpdatedSkinIndex(newSkeleton, mesh){
    if (!mesh.skeleton)
        return
    const newBonesIndex = new Map();
    // compare this skeleton and make a map with the current index pointing the new index
    if (mesh.skeleton){
        mesh.skeleton.bones.forEach((bone, index) => {
            const filterByName = newSkeleton.bones.filter (newBone=>newBone.name === bone.name)
            const newIndex = filterByName.length > 0 ? newSkeleton.bones.indexOf(filterByName[0]):-1
            newBonesIndex.set(index, newIndex)
        });
        
        const newSkinIndexArr = [];

        const skinIndices = mesh.geometry.attributes.skinIndex.array;
        for (let i =0; i < skinIndices.length;i++){
            
            newSkinIndexArr[i] = newBonesIndex.get(skinIndices[i])
        }
        
        const indexTypedArray = new Uint16Array(newSkinIndexArr);

        return new THREE.BufferAttribute(indexTypedArray,4,false);
        
    }
}

// returns an ordered array with non duplicated indices
function getOrderedNonDupArray(arr){
    const sortedArr = [...arr];
    sortedArr.sort()
    return sortedArr.filter((item,index) => sortedArr.indexOf(item) === index);
}

function getTypedArrayType(someTypedArray) {
    const typedArrayTypes = [
      Int8Array,
      Uint8Array,
      Uint8ClampedArray,
      Int16Array,
      Uint16Array,
      Int32Array,
      Uint32Array,
      Float32Array,
      Float64Array,
      BigInt64Array,
      BigUint64Array
    ];
    const checked = typedArrayTypes.filter(ta => someTypedArray.constructor === ta);
    return checked.length && checked[0] || null;
  }

function removeUnusedAttributes(attribute,arrayMatch){
    //const attr = mesh.geometry.getAttribute(attributeName)
    const newArr = []
    for (let i =0 ; i < arrayMatch.length ;i++){
        const ind = i*attribute.itemSize;
        for (let j = 0;j < attribute.itemSize;j++ ){
            newArr[ind+j] = attribute.array[arrayMatch[i]*attribute.itemSize+j] // yes [i]*3 and not [ind]*3
        }
    }
    const type = getTypedArrayType(attribute.array);
    const typedArr = new type(newArr);
    return new BufferAttribute(typedArr,attribute.itemSize,attribute.normalized)
}

function remapBoneIndices(geometry, oldSkeleton, newSkeleton){

    // Iterate through the vertices of the geometry
    for (let i = 0; i < geometry.attributes.skinIndex.array.length; i += 4) {
    // For each vertex, get the current skinIndices
        const skinIndices = [
        geometry.attributes.skinIndex.array[i],
        geometry.attributes.skinIndex.array[i + 1],
        geometry.attributes.skinIndex.array[i + 2],
        geometry.attributes.skinIndex.array[i + 3]
        ];

        // Iterate through skinIndices and remap them to match the new skeleton
        for (let j = 0; j < 4; j++) {
            const oldBoneIndex = skinIndices[j];
            // Map the old bone index to the new skeleton's bone index
            const newBoneIndex = mapOldBoneIndexToNew(oldBoneIndex, oldSkeleton, newSkeleton);
            skinIndices[j] = newBoneIndex;
        }

        // Update the geometry's skinIndices
        geometry.attributes.skinIndex.array[i] = skinIndices[0];
        geometry.attributes.skinIndex.array[i + 1] = skinIndices[1];
        geometry.attributes.skinIndex.array[i + 2] = skinIndices[2];
        geometry.attributes.skinIndex.array[i + 3] = skinIndices[3];
    }

    // Ensure the geometry's skinIndices are updated
    geometry.attributes.skinIndex.needsUpdate = true;
}

function mapOldBoneIndexToNew(oldBoneIndex, oldSkeleton, newSkeleton) {
    // Find the old bone using the oldBoneIndex
    const oldBone = oldSkeleton.bones[oldBoneIndex];
  
    // Find the corresponding bone in the new skeleton using the bone's name
    const newBone = newSkeleton.bones.find((bone) => bone.name === oldBone.name);
  
    if (newBone) {
      // Return the index of the new bone in the new skeleton
      return newSkeleton.bones.indexOf(newBone);
    } else {
      // Handle the case where no corresponding bone is found
      // You might return a default value or handle the situation as needed
      return -1; // or any other value indicating no match
    }
  }

export async function combineNoAtlas(model,avatar, options) {
    
    const { scale, isVrm0, mergeAppliedMorphs } = options

    const clonedMeshes = [];
    const material = [];

    const meshes = findChildrenByType(model, "SkinnedMesh");
    // Get VRM-bound morphTargets so we don't remove or merge them.
    const VRMBoundMorphs = getVRMBoundExpressionMorphs(avatar)
    const blendShapesFromManifest = getAllBlendShapeTraits(avatar).map((trait) => trait.id);

    meshes.forEach(originalMesh => {
        const clonedMesh = originalMesh.clone(); // Clone the original mesh
        clonedMeshes.push(clonedMesh); // Add the cloned mesh to the array
        if (Array.isArray(originalMesh.material)) {
            // If the material property is an array (e.g., for MultiMaterial), concatenate it to the materialsArray
            material.push(...originalMesh.material);
        } else {
            // If the material property is a single material, push it to the materialsArray
            material.push(originalMesh.material);
        }
    });
    const newSkeleton = createMergedSkeleton(clonedMeshes, scale);
    const group = new THREE.Object3D();
    group.name = "AvatarRoot";
   // group.animations = [];
    clonedMeshes.forEach(mesh => {
        const geometry = new THREE.BufferGeometry();
        
        const attributes = {}
        for (const attributeName in mesh.geometry.attributes) {
            const attribute = mesh.geometry.attributes[attributeName];
            attributes[attributeName] = attribute.clone();
        }
        /**
         * Object to keep track of morphTargets we want merged vs morphTargets we want to keep as blendshapes;
         * If merge has content, we remove all other morphTargets
         */
        const morphTargetsProcess = {
            merge:new Set(),
            keep:new Set(VRMBoundMorphs),
            remove: new Set()
        }
        /**
         * Whether we want to merge morphtargets to the final result.
         * Only affects morphTargets from the Manifest
         */
        if(mergeAppliedMorphs){
            if(!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

            blendShapesFromManifest.forEach((key)=>{
                const influenceIndex = mesh.morphTargetDictionary[key];
                if(influenceIndex !== undefined && mesh.morphTargetInfluences[influenceIndex] > 0) {
                    morphTargetsProcess.merge.add(key)
                }else{
                    morphTargetsProcess.remove.add(key)
                    return null
                }
            })

        }

        if (mesh.userData?.isVRM0){
            for (let i = 0; i < attributes["position"].array.length; i+=3){
                attributes["position"].array[i] *= -1
                attributes["position"].array[i+2] *= -1
            }
        }

        
        const source = {
            attributes,
            morphTargetDictionaries: new Map(meshes.map((m) => [m, m.morphTargetDictionary || {}])),
            morphTargetInfluences: new Map(meshes.map((m) => [m, m.morphTargetInfluences || []])),
            //animationClips: mesh.animations, //disable for now cuz no animations.
            index: null,
            animations: {}
        };

        //console.log(mesh.geometry.morphAttributes);
        const { dest, destMorphToMerge} = mergeGeometry({ meshes:[mesh], scale , morphTargetsProcess },isVrm0)


        // change vertex positions if is vrm0
        if (isVrm0){
            for (let i = 0; i < source.attributes.position.array.length; i+=3){
                source.attributes.position.array[i] *= -1
                source.attributes.position.array[i+2] *= -1
            }
        }
    
        source.attributes = dest.attributes;
        source.morphAttributes = dest.morphAttributes;
        geometry.morphTargetsRelative = true;

        const baseIndArr = mesh.geometry.index.array;
        const offsetIndexArr = getOrderedNonDupArray(mesh.geometry.index.array);

        const indArrange = []

        for (let i =0 ; i < baseIndArr.length ;i++){
            indArrange[i] = offsetIndexArr.indexOf(baseIndArr[i])
        }

        remapBoneIndices(geometry,mesh.skeleton,newSkeleton);
        
        const indexArr = new Uint32Array(indArrange);
        const indexAttribute = new BufferAttribute(indexArr,1,false); 

        geometry.setIndex(indexAttribute)
        for (const att in geometry.attributes){
            geometry.setAttribute(att, removeUnusedAttributes(geometry.getAttribute(att),offsetIndexArr))
        }
        
        // update morph attributes indices to match new offsetIndexArr
        for (const att in geometry.morphAttributes){
            const attribute = geometry.morphAttributes[att];
            for (let i =0; i < attribute.length ;i++){
                attribute[i] = removeUnusedAttributes(attribute[i],offsetIndexArr)
            }
        }
    
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i] *= scale;
            vertices[i + 1] *= scale;
            vertices[i + 2] *= scale;
            // Apply morph targets to the vertices
            if(mergeAppliedMorphs){
                if(!destMorphToMerge.morphTargetInfluences)return
                for (let j = 0; j < destMorphToMerge.morphTargetInfluences.length; j++) {
                    const morphAttribute = destMorphToMerge.morphAttributes?.position[j];
                    if (morphAttribute) {
                        for (let k = 0; k < 3; k++) {
                            //@ts-ignore
                            vertices[i + k] += morphAttribute.array[i + k] * destMorphToMerge.morphTargetInfluences[j];
                        }
                    }
                }
            }
        }
    
    
        const newMesh = new THREE.SkinnedMesh(geometry, mesh.material);

        newMesh.name = mesh.name;
        newMesh.morphTargetInfluences = dest.morphTargetInfluences;
        newMesh.morphTargetDictionary = dest.morphTargetDictionary;
    
        newMesh.bind(newSkeleton);

        // group.animations = ( ... source.animations);
        group.add(newMesh);
        group.add(newSkeleton.bones[0]);
    });

    group.userData.atlasMaterial = material;

    return group;
}

function cloneMeshAndSaveSkinInfo(mesh){
    const boneName = mesh.parent.name;
    const originalGlobalPosition = new THREE.Vector3();
    const originalGlobalScale = new THREE.Vector3();
    mesh.getWorldPosition(originalGlobalPosition);
    mesh.getWorldScale(originalGlobalScale)
    mesh = mesh.clone();

    const rotationMatrix = new THREE.Matrix4();
    const rotation = new THREE.Quaternion()
    mesh.getWorldQuaternion(rotation);
    rotationMatrix.makeRotationFromQuaternion(rotation);

    mesh.userData.boneName = boneName;
    mesh.userData.globalPosition = originalGlobalPosition;
    mesh.userData.globalScale = originalGlobalScale;
    mesh.userData.globalRotationMatrix = rotationMatrix;

    return mesh;
}

function createSkinnedMeshFromMesh(baseSkeleton, mesh){
    const skinnedMesh = new THREE.SkinnedMesh(mesh.geometry, mesh.material);

    // Clone the existing skeleton and find the bone by name
    const skeleton = baseSkeleton.clone();
    const boneIndex = skeleton.bones.findIndex(bone => bone.name === mesh.userData.boneName);
    
    // stored original world position as this is a new cloned mesh
    const globalPosition = mesh.userData.globalPosition;
    const globalScale = mesh.userData.globalScale || new THREE.Vector3(1,1,1);
    const globalRotationMatrix = mesh.userData.globalRotationMatrix;

    // Add the bone to the skinned mesh
    skinnedMesh.add(skeleton.bones[0]);

    // Create the skin data (with a single bone)
    const boneIndices = [];
    const weights = [];

    // Assign the bone index (0) and weight (1.0) to each vertex
    const vertices = skinnedMesh.geometry.attributes.position.array;
    // used to apply rotations
    const vertex = new THREE.Vector3();

    // in vrm0 case, multiply x and z times -1
    const vrm0Mult = mesh.userData.isVRM0 ? -1 : 1;
    for (let i = 0; i < vertices.length; i+=3 ) {
        // first set rotation
        vertex.set(vertices[i], vertices[i + 1], vertices[i + 2]);
        vertex.applyMatrix4(globalRotationMatrix);

        vertices[i] = (vrm0Mult * globalScale.x *vertex.x) + globalPosition.x;
        vertices[i+1] =  (globalScale.y * vertex.y) + globalPosition.y;    // no negative vrm0 multiply here
        vertices[i+2] = (vrm0Mult * globalScale.z * vertex.z) + globalPosition.z;
        boneIndices.push(boneIndex, 0, 0, 0);
        weights.push(1.0, 0, 0, 0);
    }

    // Set the skin data directly on the SkinnedMesh's geometry
    skinnedMesh.geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(boneIndices, 4));
    skinnedMesh.geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(weights, 4));

    // Bind the skinned mesh to the skeletond
    // do not pose!
    skinnedMesh.bind(skeleton);

    return skinnedMesh;
}
/**
 * 
 * @param {THREE.Object3D} model 
 * @param {Object} avatar 
 * @param {Object} [options] 
 * @returns 
 */
export async function combine(model,avatar, options) {

    let {
        transparentColor = new THREE.Color(1,1,1),
        mToonAtlasSize = 4096, 
        mToonAtlasSizeTransp = 4096, 
        stdAtlasSize = 4096, 
        stdAtlasSizeTransp = 4096,
        includeNonTexturedMeshesInAtlas = false,
        exportMtoonAtlas = false, 
        exportStdAtlas = true,
        mergeAppliedMorphs = false,
        isVrm0 = false,
        scale = 1,
        twoSidedMaterial = false,
    } = options;

    // convert meshes to skinned meshes first
    const cloneNonSkinnedMeshes = findChildrenByType(model, ["Mesh"]);
    for (let i =0; i < cloneNonSkinnedMeshes.length;i++){
        cloneNonSkinnedMeshes[i] = cloneMeshAndSaveSkinInfo(cloneNonSkinnedMeshes[i]);
    }

    const cloneSkinnedMeshes = findChildrenByType(model, ["SkinnedMesh"]);

    const allMeshes = [...cloneNonSkinnedMeshes, ...cloneSkinnedMeshes];

    // make sure to have at least 1 atlas set
    if (exportMtoonAtlas == false && exportStdAtlas == false) exportMtoonAtlas = true;

    
    // to implement
    let {stdMesh, stdTranspMesh, mToonMesh, mToonTranspMesh, requiresTransparency} = getMeshesSortedByMaterialArray(allMeshes);

    if (exportMtoonAtlas == false){
        stdMesh = [...stdMesh, ...mToonMesh]
        stdTranspMesh = [...stdTranspMesh, ...mToonTranspMesh]
        mToonTranspMesh = [];
        mToonMesh = [];
    }
    if (exportStdAtlas == false){
        mToonMesh = [...mToonMesh, ...stdMesh]
        mToonTranspMesh = [...mToonTranspMesh, ...stdTranspMesh]
        stdMesh =[];
        stdTranspMesh = [];
    }

    const group = new THREE.Object3D();
    group.name = "AvatarRoot";
    group.userData.atlasMaterial = [];

    const newSkeleton = createMergedSkeleton(allMeshes, scale);

    // arrange each mesh by material type
    const meshArrayData = {
        standard:{meshArray:stdMesh,size:stdAtlasSize, isMtoon:false, transparentMaterial:false }, 
        standardTransparent:{meshArray:stdTranspMesh,size:stdAtlasSizeTransp, isMtoon:false, transparentMaterial:true }, 
        mToon:{meshArray: mToonMesh, size: mToonAtlasSize, isMtoon:true, transparentMaterial:false}, 
        mToonTransparent:{meshArray: mToonTranspMesh, size: mToonAtlasSizeTransp, isMtoon:true, transparentMaterial:true}};
    
    // Get VRM-bound morphTargets so we don't remove or merge them.
    const VRMBoundMorphs = getVRMBoundExpressionMorphs(avatar)
    const blendShapesFromManifest = getAllBlendShapeTraits(avatar).map((trait) => trait.id);

    for (const prop in meshArrayData){
        const meshData = meshArrayData[prop];
        const arr = meshData.meshArray;
        if (arr.length > 0)
        {        
            const { bakeObjects, material } = 
                await createTextureAtlas({ transparentColor, atlasSize:meshData.size, meshes: arr, mtoon:meshData.isMtoon, includeNonTexturedMeshesInAtlas, transparentMaterial:meshData.transparentMaterial, transparentTexture:requiresTransparency, twoSidedMaterial:twoSidedMaterial});
                const meshes = bakeObjects.map((bakeObject) => bakeObject.mesh);

            const skinnedMeshes = [];
            /**
             * Object to keep track of morphTargets we want merged vs morphTargets we want to keep as blendshapes;
             * If merge has content, we remove all other morphTargets
             */
            const morphTargetsProcess = {
                merge:new Set(),
                keep:new Set(Object.keys(VRMBoundMorphs)),
                remove: new Set()
            }
            meshes.forEach((mesh) => {

                if (mesh.type == "Mesh"){
                    mesh = createSkinnedMeshFromMesh(newSkeleton, mesh)
                }
            
                skinnedMeshes.push(mesh)
                /**
                 * Whether we want to merge morphtargets to the final result.
                 * Only affects morphTargets from the Manifest
                 */
                if(mergeAppliedMorphs){
                    if(!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

                    blendShapesFromManifest.forEach((key)=>{
                        const influenceIndex = mesh.morphTargetDictionary[key];
                        if(influenceIndex !== undefined && mesh.morphTargetInfluences[influenceIndex] > 0) {
                            morphTargetsProcess.merge.add(key)
                        }else{
                            morphTargetsProcess.remove.add(key)
                            return null
                        }
                    })

                }

                // remove vertices from culled faces from the mesh
                const geometry = mesh.geometry;

                const baseIndArr = geometry.index.array
                const offsetIndexArr = getOrderedNonDupArray(mesh.geometry.index.array);

                const indArrange = []
                for (let i =0 ; i < baseIndArr.length ;i++){
                    indArrange[i] = offsetIndexArr.indexOf(baseIndArr[i])
                }
                const indexArr = new Uint32Array(indArrange);
                const indexAttribute = new BufferAttribute(indexArr,1,false); 

                // update attributes indices to match new offsetIndexArr
                geometry.setIndex(indexAttribute)
                for (const att in geometry.attributes){
                    geometry.setAttribute(att, removeUnusedAttributes(geometry.getAttribute(att),offsetIndexArr))
                }
                
                // update morph attributes indices to match new offsetIndexArr
                for (const att in geometry.morphAttributes){
                    const attribute = geometry.morphAttributes[att];
                    for (let i =0; i < attribute.length ;i++){
                        attribute[i] = removeUnusedAttributes(attribute[i],offsetIndexArr)
                    }
                }

                // assign secondary uvs in case they ar not present
                if (!geometry.attributes.uv2) {
                    geometry.attributes.uv2 = geometry.attributes.uv;
                }

                // update mesh skeleton indices
                if (mesh.skeleton != null)
                    mesh.geometry.setAttribute("skinIndex", getUpdatedSkinIndex(newSkeleton, mesh))
                    
                // Exlude the currently "activated" morph attributes before merging.
                // The BufferAttributes are not lost; they remain in `mesh.geometry.morphAttributes`
                // and the influences remain in `mesh.morphTargetInfluences`.
                for (let i = 0; i < 8; i++) {
                    delete geometry.attributes[`morphTarget${i}`];
                    delete geometry.attributes[`morphNormal${i}`];
                }

            });
            const { dest, destMorphToMerge} = mergeGeometry({ meshes:skinnedMeshes, scale , morphTargetsProcess },isVrm0);
            console.log('destMorphToMerge',destMorphToMerge)
            const geometry = new THREE.BufferGeometry();

            // modify all merged vertices to reflect vrm0 format
            if (isVrm0){
                for (let i = 0; i < dest.attributes.position.array.length; i+=3){
                    dest.attributes.position.array[i] *= -1
                    dest.attributes.position.array[i+2] *= -1
                }
            }

            geometry.attributes = dest.attributes;
            geometry.morphAttributes = dest.morphAttributes;
            geometry.morphTargetsRelative = true;
            geometry.setIndex(dest.index);

            const vertices = geometry.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
                vertices[i] *= scale;
                vertices[i + 1] *= scale;
                vertices[i + 2] *= scale;

                // Apply morph targets to the vertices
                if(mergeAppliedMorphs){
                    if(!destMorphToMerge.morphTargetInfluences)continue
                    for (let j = 0; j < destMorphToMerge.morphTargetInfluences.length; j++) {
                        const morphAttribute = destMorphToMerge.morphAttributes?.position[j];
                        if (morphAttribute) {
                            for (let k = 0; k < 3; k++) {
                                vertices[i + k] += morphAttribute.array[i + k] * destMorphToMerge.morphTargetInfluences[j];
                            }
                        }
                    }
                }
            }


            const mesh = new THREE.SkinnedMesh(geometry, material);
            mesh.name = "CombinedMesh_" + prop;
            mesh.morphTargetInfluences = dest.morphTargetInfluences;
            mesh.morphTargetDictionary = dest.morphTargetDictionary;

            mesh.bind(newSkeleton);
          
            //group.animations = dest.animations;
            group.add(mesh);
           

            mesh.userData.bindMorphs = {
                old:VRMBoundMorphs,
                new:{}
            }
            Object.keys(VRMBoundMorphs).forEach((VRMMorphName) => {
                const index = mesh.morphTargetDictionary[VRMMorphName];
                if(index !== undefined){
                    mesh.userData.bindMorphs.new[VRMMorphName] = {
                        index:index,
                        primitives:[mesh.id]
                    };
                }
            });
            group.userData.atlasMaterial.push(material);      
        }
    }
    /**
     * We need to re-link the new morphDictionary and the vrm ExpressioManager since indexes have changed
     * We clone an expression manager for easy maintenance;
     */
    const expressionManagerToClone = Object.values(avatar).find((a)=>a?.vrm?.expressionManager)?.vrm.expressionManager;
    // getAvatarData in utils.ts will take care of the rest
    group.userData.expressionManagerToClone = expressionManagerToClone
    group.add(newSkeleton.bones[0]);
    return group;
}

/**
 * 
 * @param {Object} avatar 
 * @returns {Array} Array of blendshapeTraits
 */
function getAllBlendShapeTraits(avatar){
    const blendShapes = Object.values(avatar).filter((a)=>a)[0]?.traitInfo.manifestData.getAllBlendShapeTraits() || [];
    return blendShapes;
}
/**
 * 
 * @param {Object} avatar 
 * @returns 
 */
function getVRMBoundExpressionMorphs(avatar){
    const expressionMaps = Object.values(avatar).map((t)=>t?.vrm).filter((t)=>!!t).map((vrm) => vrm.expressionManager?.expressionMap);
    /**
     * @type {Object.<string, {index:number, primitives:string[]}>}
     */
    const VRMBoundMorphs = {};
    /**
     * @type {string[]}
     */
    let expressionNameDone = []
    // Iterate through maps of expressions of each VRM
    for(const expressionMap of expressionMaps){
        if(!expressionMap) continue;
        // Iterate through each expression in the map
        for(const expression of Object.values(expressionMap)){
            // Skip if the expression has already been processed
            if(expressionNameDone.includes(expression.expressionName)) continue;
            expressionNameDone.push(expression.expressionName)
            // Get the bound Blendshape from the expression
            /**
             *type VRMExpressionMorphTargetBind from pixiv VRM but cjs wont export it?
             * @type {Object[]}
             */
            const bounds = expression._binds
            if(!bounds || bounds.length == 0) continue;
            bounds.forEach((bound) => {
                /**
                 * @param {number} morphTargetIndex 
                 * @returns {[string, number]}
                 */
                function getPrimitiveWithMorphTargetIndex(morphTargetIndex){
                    const primitiveDictionaries = bound.primitives.map((p) => p.morphTargetDictionary).filter((d) => !!d);
                    const dictionary = primitiveDictionaries.find((dict) => Object.values(dict).includes(morphTargetIndex))
                    if(!dictionary) return;
                    return Object.entries(dictionary).find(([, value]) => value == morphTargetIndex);
                }

                const primitiveKeyIndex = getPrimitiveWithMorphTargetIndex(bound.index);
                if(!primitiveKeyIndex) return;
                // Add the morph target and index to the VRMBoundMorphs object
                VRMBoundMorphs[primitiveKeyIndex[0]] = {index:primitiveKeyIndex[1],
                    primitives:bound.primitives.map((p) => p.id)
                };
            })
        }
    }
    return VRMBoundMorphs
  }

function mergeMorphTargetInfluences({ meshes, sourceMorphTargetDictionaries, destMorphTargetDictionary }) {
    const destMorphTargetInfluences = [];
    Object.entries(destMorphTargetDictionary).map(([morphName, destIndex]) => {
        const mesh = meshes.find((mesh) => {
            // eslint-disable-next-line no-prototype-builtins
            return sourceMorphTargetDictionaries.get(mesh).hasOwnProperty(morphName);
        });
        const sourceIndex = mesh.morphTargetDictionary[morphName];
        destMorphTargetInfluences[destIndex] = mesh.morphTargetInfluences[sourceIndex];
        // TODO: Stop / reset animations so that animated morph influences return to their "at rest" values.
        // Maybe the "at rest" values should be baked into attributes (e.g. eye brow shapes) to allow more
        // active morph targets in the combined mesh. Not all morphs should be baked. (e.g. The eyelids
        // that are animated with the "Blinks" animation should not be baked.)
    });
    return destMorphTargetInfluences;
}
// function findSceneGroup(object3D) {
//     if (object3D.name === "Scene" && object3D.type === "Group") {
//         return object3D;
//     }
//     if (!object3D.parent) {
//         return null;
//     }
//     return findSceneGroup(object3D.parent);
// }
function mergeSourceAttributes({ sourceAttributes }) {
    const propertyNames = new Set(); // e.g. ["normal", "position", "skinIndex", "skinWeight", "tangent", "uv", "uv2"]
    const allSourceAttributes = Array.from(sourceAttributes.values());
    allSourceAttributes.forEach((sourceAttributes) => {
        Object.keys(sourceAttributes).forEach((name) => propertyNames.add(name));
    });
    const destAttributes = {};
    Array.from(propertyNames.keys()).map((name) => {
        destAttributes[name] = BufferGeometryUtils.mergeAttributes(allSourceAttributes.map((sourceAttributes) => sourceAttributes[name]).flat().filter((attr) => attr !== undefined));
    });
    return destAttributes;
}
/**
 * 
 * @param params {{
    sourceMorphTargetDictionaries: Object
    morphTargetsProcess?:{
        merge:Set<string>,
        keep:Set<string>,
        remove:Set<string>
    }}
 * @returns 
 */
function mergeSourceMorphTargetDictionaries(params) {
    const { sourceMorphTargetDictionaries,morphTargetsProcess } = params;
    const morphNames = new Set(); // e.g. ["MouthFlap", "Blink", "Eye Narrow", "Eye Rotation"]
    const allSourceDictionaries = Array.from(sourceMorphTargetDictionaries.values());
    allSourceDictionaries.forEach((dictionary) => {
        Object.keys(dictionary).forEach((name) => {
            if(!morphTargetsProcess){
                morphNames.add(name)
            }else{
                if(morphTargetsProcess.remove.has(name) || morphTargetsProcess.merge.has(name)){
                    // Don't add morphs that are to be removed or merged
                    return
                }
                if(morphTargetsProcess.keep.has(name)){
                    morphNames.add(name)
                }
            }

        });
    });
    const destMorphTargetDictionary = {};
    Array.from(morphNames.keys()).map((name, i) => {
        destMorphTargetDictionary[name] = i;
    });
    return destMorphTargetDictionary;
}
function mergeSourceMorphAttributes({ meshes, sourceMorphTargetDictionaries, sourceMorphAttributes, destMorphTargetDictionary, scale}, isVrm0 = false) {
    const propertyNameSet = new Set(); // e.g. ["position", "normal"]
    const allSourceMorphAttributes = Array.from(sourceMorphAttributes.values());
    allSourceMorphAttributes.forEach((sourceMorphAttributes) => {
        Object.keys(sourceMorphAttributes).forEach((name) => propertyNameSet.add(name));
    });
    const propertyNames = Array.from(propertyNameSet);
    // const morphNames = Object.keys(destMorphTargetDictionary);
    const unmerged = {};
    propertyNames.forEach((propName) => {
        unmerged[propName] = [];
        Object.entries(destMorphTargetDictionary).forEach(([morphName, destMorphIndex]) => {
            unmerged[propName][destMorphIndex] = [];
            meshes.forEach((mesh) => {
                let bufferAttribute;
                const morphTargetDictionary = sourceMorphTargetDictionaries.get(mesh);
                // eslint-disable-next-line no-prototype-builtins
                if (morphTargetDictionary.hasOwnProperty(morphName) && mesh.geometry.morphAttributes[propName]) {
                    const sourceMorphIndex = morphTargetDictionary[morphName];
                    bufferAttribute = mesh.geometry.morphAttributes[propName][sourceMorphIndex];
                }
                else {
                    const attribute = mesh.geometry.attributes[propName];
                    const array = new attribute.array.constructor(new Array(attribute.array.length).fill(0));
                    bufferAttribute = new THREE.BufferAttribute(array, attribute.itemSize, attribute.normalized);
                }
                unmerged[propName][destMorphIndex].push(bufferAttribute);
            });
        });
    });
    const merged = {};
    propertyNames.forEach((propName) => {
        merged[propName] = [];
        for (let i =0; i < Object.entries(destMorphTargetDictionary).length ; i++){
            merged[propName][i] = BufferGeometryUtils.mergeAttributes(unmerged[propName][i]);
            const buffArr = merged[propName][i].array;
            for (let j = 0; j < buffArr.length; j+=3){
                buffArr[j] *= scale;
                buffArr[j+1] *= scale;
                buffArr[j+2] *= scale;
            }
        }
    });
    return merged;
}
function mergeSourceIndices({ meshes }) {
    var indexOffset = 0;
    var mergedIndex = [];
    meshes.forEach((mesh) => {
        const index = mesh.geometry.index;
        for (var j = 0; j < index.count; ++j) {
            mergedIndex.push(index.getX(j) + indexOffset);
        }
        indexOffset += mesh.geometry.attributes.position.count;
    });
    return mergedIndex;
}
// function dedupBy(items, propName) {
//     const deduped = new Set();
//     items.forEach((item) => {
//         deduped.add(item[propName]);
//     });
//     return Array.from(deduped).map((value) => {
//         return items.find((item) => item[propName] === value);
//     });
// }
// function CubicSplineFrameOffsets({ numMorphs }) {
//     const frameSize = numMorphs * 3;
//     return {
//         frameSize,
//         tanIn: 0,
//         value: frameSize / 3,
//         tanOut: (frameSize * 2) / 3,
//     };
// }
// remapMorphTrack
//
//   Remap tracks that animate morph target influences.
//
//   We assume the sourceTrack is
//   - using CubicSpline interpolatifunction remapMorphTrack({ track, sourceMorphTargetDictionary, destMorphTargetDictionary }) {
//     const sourceOffsets = CubicSplineFrameOffsets({ numMorphs: Object.keys(sourceMorphTargetDictionary).length });
//     const destOffsets = CubicSplineFrameOffsets({ numMorphs: Object.keys(destMorphTargetDictionary).length });
//     const destKeyframes = [];
//     const numFrames = track.times.length;
//     const destMorphNames = Object.keys(destMorphTargetDictionary);
//     for (let frameIndex = 0; frameIndex < numFrames; frameIndex++) {
//         const sourceFrame = track.values.slice(frameIndex * sourceOffsets.frameSize, frameIndex * sourceOffsets.frameSize + sourceOffsets.frameSize);
//         const destFrame = [];
//         destMorphNames.forEach((morphName) => {
//             const destMorphIndex = destMorphTargetDictionary[morphName];
//             // eslint-disable-next-line no-prototype-builtins
//             const isMorphInSourceTrack = sourceMorphTargetDictionary.hasOwnProperty(morphName);
//             if (isMorphInSourceTrack) {
//                 const sourceMorphIndex = sourceMorphTargetDictionary[morphName];
//                 destFrame[destOffsets.tanIn + destMorphIndex] = sourceFrame[sourceOffsets.tanIn + sourceMorphIndex];
//                 destFrame[destOffsets.value + destMorphIndex] = sourceFrame[sourceOffsets.value + sourceMorphIndex];
//                 destFrame[destOffsets.tanOut + destMorphIndex] = sourceFrame[sourceOffsets.tanOut + sourceMorphIndex];
//             }
//             else {
//                 destFrame[destOffsets.tanIn + destMorphIndex] = 0;
//                 destFrame[destOffsets.value + destMorphIndex] = 0;
//                 destFrame[destOffsets.tanOut + destMorphIndex] = 0;
//             }
//         });
//         destKeyframes.push(destFrame);
//     }
//     const destTrackName = `${"CombinedMesh"}.morphTargetInfluences`;
//     const destTrack = new THREE.NumberKeyframeTrack(destTrackName, track.times, destKeyframes.flat());
//     // Make sure the track will interpolate correctly
//     // (Copied from THREE.GLTFLoader : https://github.com/mrdoob/three.js/blob/350f0a021943d6fa1d039a7c14c303653daa463f/examples/jsm/loaders/GLTFLoader.js#L3634 )
//     destTrack['createInterpolant'] = function InterpolantFactoryMethodGLTFCubicSpline(result) {
//         return new GLTFCubicSplineInterpolant(this.times, this.values, this.getValueSize() / 3, result);
//     };
//     destTrack['createInterpolant'].isInterpolantFactoryMethodGLTFCubicSpline = true;
//     return destTrack;
// }on and
//   - animating morphTargetInfluences.
//
//   TODO: Support other interpolation types. (Adding linear should be easy.)
//
//   The values buffer of the sourceTrack contains a sequence of keyframes:
//
//   [ frame 0 | frame 1 | frame 2 | frame 3 ... ]
//
//   Each keyframe contains three numbers for each morph target (influence) of the sourceMesh:
//   - an inTangent (tanIn)
//   - an influence (value)
//   - an outTangent (tanOut)
//
//   Each frame orders the numbers by type: inTangents first, then values, then outTangents.
//   So if there are M morph targets, frame N will look like:
//   [
//     ...
//     |                              |                             |                                |
//     | tanIn_N_0, ... ,  tanIn_N_M, | value_N_0, ... , value_N_M, | tanOut_N_0,  ... , tanOut_N_M, |  // < -- frame N
//     |                              |                             |                                |
//     ...
//   ]
//
//   So for example, if the sourceMesh has 2 morph targets and the track has three keyframes, the values buffer contains:
//   [
//      tanIn_0_0, tanIn_0_1, value_0_0, value_0_1, tanOut_0_0, tanOut_0_1, // <-- Frame 0
//      tanIn_1_0, tanIn_1_1, value_1_0, value_1_1, tanOut_1_0, tanOut_1_1, // <-- Frame 1
//      tanIn_2_0, tanIn_2_1, value_2_0, value_2_1, tanOut_2_0, tanOut_2_1  // <-- Frame 2
//   ]
//
//   See the GLTF spec for details about how this is represented in GLTF:
//     https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#animations
//   See THREE's GLTFLoader for details about how this is loaded and represented in THREE:
//     https://github.com/mrdoob/three.js/blob/350f0a021943d6fa1d039a7c14c303653daa463f/examples/jsm/loaders/GLTFLoader.js#L3634
//
//   This function creates a new (dest) track that can will work with the combined (dest) mesh.
//   Each morph target influence index in the source mesh has a corresponding index in the dest mesh.
//   The dest mesh will have the sum of all the morph targets of its source meshes, so we will
//   insert several zeros into the track so the dest mesh's morphTargetInfluences that should not
//   be changed by this track are left alone.
//
//   Continuing the example above,
//   If the sourceMesh has two morph targets and sourceTrack has three keyframes,
//   and if the destMesh has three morph targets, then there will be some mapping
//   of morphTargetInfluences from source to dest:
//   {
//     sourceMorph0 -> destMorph2,
//     sourceMorph1 -> destMorph1
//   }
//
//   Assuming the same values buffer from before, the new values buffer will be:
//   [
//      0, tanIn_0_1, tanIn_0_0, 0, value_0_1, value_0_0, 0, tanOut_0_1, tanOut_0_0, // <-- Frame 0
//      0, tanIn_1_1, tanIn_1_0, 0, value_1_1, value_1_0, 0, tanOut_1_1, tanOut_1_0, // <-- Frame 1
//      0, tanIn_2_1, tanIn_2_0, 0, value_2_1, value_2_0, 0, tanOut_2_1, tanOut_2_0  // <-- Frame 2
//   ]
//
//   Notice that:
//   - zeroes have been inserted for destMorph0,
//   - the numbers associated with sourceMorph0 will now be associated with destMorph2, and
//   - the numbers associated with sourceMorph1 will now be associated with destMorph1
// function remapMorphTrack({ track, sourceMorphTargetDictionary, destMorphTargetDictionary }) {
//     const sourceOffsets = CubicSplineFrameOffsets({ numMorphs: Object.keys(sourceMorphTargetDictionary).length });
//     const destOffsets = CubicSplineFrameOffsets({ numMorphs: Object.keys(destMorphTargetDictionary).length });
//     const destKeyframes = [];
//     const numFrames = track.times.length;
//     const destMorphNames = Object.keys(destMorphTargetDictionary);
//     for (let frameIndex = 0; frameIndex < numFrames; frameIndex++) {
//         const sourceFrame = track.values.slice(frameIndex * sourceOffsets.frameSize, frameIndex * sourceOffsets.frameSize + sourceOffsets.frameSize);
//         const destFrame = [];
//         destMorphNames.forEach((morphName) => {
//             const destMorphIndex = destMorphTargetDictionary[morphName];
//             // eslint-disable-next-line no-prototype-builtins
//             const isMorphInSourceTrack = sourceMorphTargetDictionary.hasOwnProperty(morphName);
//             if (isMorphInSourceTrack) {
//                 const sourceMorphIndex = sourceMorphTargetDictionary[morphName];
//                 destFrame[destOffsets.tanIn + destMorphIndex] = sourceFrame[sourceOffsets.tanIn + sourceMorphIndex];
//                 destFrame[destOffsets.value + destMorphIndex] = sourceFrame[sourceOffsets.value + sourceMorphIndex];
//                 destFrame[destOffsets.tanOut + destMorphIndex] = sourceFrame[sourceOffsets.tanOut + sourceMorphIndex];
//             }
//             else {
//                 destFrame[destOffsets.tanIn + destMorphIndex] = 0;
//                 destFrame[destOffsets.value + destMorphIndex] = 0;
//                 destFrame[destOffsets.tanOut + destMorphIndex] = 0;
//             }
//         });
//         destKeyframes.push(destFrame);
//     }
//     const destTrackName = `${"CombinedMesh"}.morphTargetInfluences`;
//     const destTrack = new THREE.NumberKeyframeTrack(destTrackName, track.times, destKeyframes.flat());
//     // Make sure the track will interpolate correctly
//     // (Copied from THREE.GLTFLoader : https://github.com/mrdoob/three.js/blob/350f0a021943d6fa1d039a7c14c303653daa463f/examples/jsm/loaders/GLTFLoader.js#L3634 )
//     destTrack['createInterpolant'] = function InterpolantFactoryMethodGLTFCubicSpline(result) {
//         return new GLTFCubicSplineInterpolant(this.times, this.values, this.getValueSize() / 3, result);
//     };
//     destTrack['createInterpolant'].isInterpolantFactoryMethodGLTFCubicSpline = true;
//     return destTrack;
// }
// function remapKeyframeTrack({ track, sourceMorphTargetDictionaries, meshes, destMorphTargetDictionary }) {
//     if (track.name.endsWith("morphTargetInfluences")) {
//         return remapMorphTrack({
//             track,
//             sourceMorphTargetDictionary: sourceMorphTargetDictionaries.get(meshes.find((mesh) => mesh.name === track.name.split(".")[0])),
//             destMorphTargetDictionary,
//         });
//     }
//     else {
//         return track;
//     }
// }
// function remapAnimationClips({ animationClips, sourceMorphTargetDictionaries, meshes, destMorphTargetDictionary }) {
//     return animationClips.map((clip) => new THREE.AnimationClip(clip.name, clip.duration, clip.tracks.map((track) => remapKeyframeTrack({ track, sourceMorphTargetDictionaries, meshes, destMorphTargetDictionary })), clip.blendMode));
// }

/**
 * 
 * @param {{
 *   meshes: (THREE.SkinnedMesh | THREE.Mesh)[],
 *   scale: number,
 *   morphTargetsProcess?:{
 *       merge:Set<string>,
 *       keep:Set<string>,
 *       remove:Set<string>
 *   }
 *}} param0 parameters
 * @param {boolean} isVrm0 
 * @returns 
 */
export function mergeGeometry({ meshes, scale, morphTargetsProcess }, isVrm0 = false) {
    // eslint-disable-next-line no-unused-vars
    let uvcount = 0;
    meshes.forEach(mesh => {
        uvcount += mesh.geometry.attributes.uv.count;
        
        // validation for each mesh! if the mesh itself is VRM0 move the vertices
        if (mesh.userData?.isVRM0){
            for (let i = 0; i < mesh.geometry.attributes.position.array.length; i+=3){
                mesh.geometry.attributes.position.array[i] *= -1
                mesh.geometry.attributes.position.array[i+2] *= -1
            }
        }
    });
    const source = {
        meshes,
        attributes: new Map(meshes.map((m) => [m, m.geometry.attributes])),
        morphAttributes: new Map(meshes.map((m) => [m, m.geometry.morphAttributes])),
        morphTargetDictionaries: new Map(meshes.map((m) => [m, m.morphTargetDictionary || {}])),
        morphTargetInfluences: new Map(meshes.map((m) => [m, m.morphTargetInfluences || []])),
        // animationClips: new Map(meshes.map((m) => [m, findSceneGroup(m).animations])), //disable for now cuz no animations.
    };
    const dest = {
        attributes: null,
        morphTargetDictionary: null,
        morphAttributes: null,
        morphTargetInfluences: null,
        index: null,
        animations: {}
    };

    /**
     * Step One: Merge all Attribute, but if morphTargetsProcess.merge has content, remove the to-be-merged morphs from the blendshapes
     */

    // The morphs that we want merged should be removed from the blendshapes
    dest.attributes = mergeSourceAttributes({ sourceAttributes: source.attributes });
    const destMorphTargetDictionary = mergeSourceMorphTargetDictionaries({
        sourceMorphTargetDictionaries: source.morphTargetDictionaries,
        morphTargetsProcess: {
            remove:morphTargetsProcess?.remove||new Set(),
            keep:morphTargetsProcess?.keep||new Set(),
            merge:morphTargetsProcess?.merge || new Set()
        }
    });
    dest.morphTargetDictionary = destMorphTargetDictionary;
    dest.morphAttributes = mergeSourceMorphAttributes({
        meshes,
        sourceMorphAttributes: source.morphAttributes,
        sourceMorphTargetDictionaries: source.morphTargetDictionaries,
        destMorphTargetDictionary,
        scale,
    },isVrm0);
    dest.morphTargetInfluences = mergeMorphTargetInfluences({
        meshes,
        sourceMorphTargetDictionaries: source.morphTargetDictionaries,
        destMorphTargetDictionary,
    });
    dest.index = mergeSourceIndices({ meshes });


    /**
     *  Step Two, generate a new Dictionary for the morphs and influences that we want to merge 
     */
    /**
     * @type {{
     * morphAttributes: Record<string, THREE.BufferAttribute[]>,
     * morphTargetDictionaries: Object,
     * morphTargetInfluences: number[]
     * }}
     */
    const destMorphToMerge= {
        morphAttributes: {},
        morphTargetDictionaries: {},
        morphTargetInfluences: null,
    }

    let keep = new Set(morphTargetsProcess?.keep||[])
    morphTargetsProcess?.merge.forEach((key)=>{
        keep.add(key)
    })
    const destMorphTargetDictionary2 = mergeSourceMorphTargetDictionaries({
        sourceMorphTargetDictionaries: source.morphTargetDictionaries,
        morphTargetsProcess:{
            remove:new Set(),
            keep:keep,
            merge: new Set()
        }
    });

    destMorphToMerge.morphAttributes = mergeSourceMorphAttributes({
        meshes,
        sourceMorphAttributes: source.morphAttributes,
        sourceMorphTargetDictionaries: source.morphTargetDictionaries,
        destMorphTargetDictionary:destMorphTargetDictionary2,
        scale,
    },isVrm0);

    const destMorphTargetInfluences = mergeMorphTargetInfluences({
        meshes,
        sourceMorphTargetDictionaries: source.morphTargetDictionaries,
        destMorphTargetDictionary:destMorphTargetDictionary2
    });
    destMorphToMerge.morphTargetInfluences  = destMorphTargetInfluences
    destMorphToMerge.morphTargetDictionaries = destMorphTargetDictionary2;


    //disable for now cuz no animations.
    // dest.animations = remapAnimationClips({
    //   meshes,
    //   animationClips: dedupBy(Array.from(source.animationClips.values()).flat(), "name"),
    //   animationClips: '',
    //   sourceMorphTargetDictionaries: source.morphTargetDictionaries,
    //   destMorphTargetDictionary,
    // });
    dest.animations = {};

    return { source, dest, destMorphToMerge};
}
