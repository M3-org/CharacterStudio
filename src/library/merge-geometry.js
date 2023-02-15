import * as THREE from "three";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
// import { GLTFCubicSplineInterpolant } from "./gltf-cubic-spline-interpolant.js";
import { findChildrenByType } from "./utils.js";
import { createTextureAtlas } from "./create-texture-atlas.js";

export function cloneSkeleton(skinnedMesh) {
    const boneClones = new Map();
    for (const bone of skinnedMesh.skeleton.bones) {
        const clone = bone.clone(false);
        // clone.position.x *= -1;
        // clone.position.z *= -1;
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

function createMergedSkeleton(meshes, isVrm0 = false){
    /* user should be careful with naming convetions in custom bone names out from humanoids vrm definition,
    for example ones that come from head (to add hair movement), should start with vrm's connected bone 
    followed by the number of the bone in reference to the base bone (head > head_hair_00 > head_hair_01),
    this will avoid an error of not adding bones if they have they same name but are in different hierarchy location
    todo: add to a user guide how to name bones to avoid this error */
    const boneClones = new Map();
    const zxNeg = new THREE.Vector3(-1,1,-1)
    let index = 0;
    meshes.forEach(mesh => {
        if (mesh.skeleton){
            mesh.skeleton.bones.forEach((bone, boneInd) => {
                const clone = boneClones.get(bone.name)
                if (clone == null){ // no clone was found with the bone
                    const boneData = {
                        index,
                        boneInverses:mesh.skeleton.boneInverses[boneInd],
                        bone:bone.clone(false),
                        parentName: bone.parent?.type == "Bone" ? bone.parent.name:null
                    }   
                    if (isVrm0){
                        // boneData.boneInverses.scale(zxNeg)
                        // bone.position.x *= -1;
                        // bone.position.z *= -1;
                    }
                    index++
                    boneClones.set(bone.name, boneData);
                }        
            })
        }
    });

    const finalBones = [];
    const finalBoneInverses = [];
    let boneClonesArr =[ ...boneClones.values() ];
    // console.log(boneClonesArr[0])
    // console.log(boneClonesArr[1])
    //boneClonesArr[0].boneInverses.makeScale(-1,1,1)
    // boneClonesArr[1].bone.rotateY ( 3.14159 )
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
    newSkeleton.pose()
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

export async function combine({ transparentColor, avatar, atlasSize = 4096 }, isVrm0 = false) {
    const { bakeObjects, textures, vrmMaterial } = 
        await createTextureAtlas({ transparentColor, atlasSize, meshes: findChildrenByType(avatar, "SkinnedMesh")});
    // if (vrmMaterial != null)
    //     vrmMaterial.userData.textureProperties = {_MainTex:0, _ShadeTexture:0
    const meshes = bakeObjects.map((bakeObject) => bakeObject.mesh);

    const newSkeleton = createMergedSkeleton(meshes, isVrm0);

    meshes.forEach((mesh) => {
        const geometry = mesh.geometry;
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
    
    const { dest } = mergeGeometry({ meshes },isVrm0);
    const geometry = new THREE.BufferGeometry();

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
    const material = new THREE.MeshStandardMaterial({
        map: textures["diffuse"],
    });
    vrmMaterial.uniforms.map = textures["diffuse"];
    vrmMaterial.uniforms.shadeMultiplyTexture = textures["diffuse"];

    material.userData.vrmMaterial = vrmMaterial;
    const mesh = new THREE.SkinnedMesh(geometry, material);
    mesh.name = "CombinedMesh";
    mesh.morphTargetInfluences = dest.morphTargetInfluences;
    mesh.morphTargetDictionary = dest.morphTargetDictionary;
    // Add unmerged meshes
    // const clones = meshesToExclude.map((o) => {
    //   return o.clone(false);
    // });
    mesh.bind(newSkeleton);
    // clones.forEach((clone) => {
    //   clone.bind(skeleton);
    // });


    const group = new THREE.Object3D();
    group.name = "AvatarRoot";
    group.animations = dest.animations;
    group.add(mesh);
    group.add(newSkeleton.bones[0]);
    // clones.forEach((clone) => {
    //   group.add(clone);
    // });

    // save material as property to get it later
    material.userData.shadeTexture = textures["uniformColor"];
    group.userData.atlasMaterial = material;
    return group;
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
        destAttributes[name] = BufferGeometryUtils.mergeBufferAttributes(allSourceAttributes.map((sourceAttributes) => sourceAttributes[name]).flat().filter((attr) => attr !== undefined));
    });
    return destAttributes;
}
function mergeSourceMorphTargetDictionaries({ sourceMorphTargetDictionaries }) {
    const morphNames = new Set(); // e.g. ["MouthFlap", "Blink", "Eye Narrow", "Eye Rotation"]
    const allSourceDictionaries = Array.from(sourceMorphTargetDictionaries.values());
    allSourceDictionaries.forEach((dictionary) => {
        Object.keys(dictionary).forEach((name) => morphNames.add(name));
    });
    const destMorphTargetDictionary = {};
    Array.from(morphNames.keys()).map((name, i) => {
        destMorphTargetDictionary[name] = i;
    });
    return destMorphTargetDictionary;
}
function mergeSourceMorphAttributes({ meshes, sourceMorphTargetDictionaries, sourceMorphAttributes, destMorphTargetDictionary, }, isVrm0 = false) {
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
            merged[propName][i] = BufferGeometryUtils.mergeBufferAttributes(unmerged[propName][i]);
            if (isVrm0){
                const buffArr = merged[propName][i].array;
                for (let j = 0; j < buffArr.length; j+=3){
                    buffArr[j] *= -1;
                    buffArr[j+2] *= -1;
                }
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
export function mergeGeometry({ meshes }, isVrm0 = false) {
    // eslint-disable-next-line no-unused-vars
    let uvcount = 0;
    meshes.forEach(mesh => {
        uvcount += mesh.geometry.attributes.uv.count;
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
    dest.attributes = mergeSourceAttributes({ sourceAttributes: source.attributes });
    const destMorphTargetDictionary = mergeSourceMorphTargetDictionaries({
        sourceMorphTargetDictionaries: source.morphTargetDictionaries,
    });
    dest.morphTargetDictionary = destMorphTargetDictionary;
    dest.morphAttributes = mergeSourceMorphAttributes({
        meshes,
        sourceMorphAttributes: source.morphAttributes,
        sourceMorphTargetDictionaries: source.morphTargetDictionaries,
        destMorphTargetDictionary,
    },isVrm0);
    dest.morphTargetInfluences = mergeMorphTargetInfluences({
        meshes,
        sourceMorphTargetDictionaries: source.morphTargetDictionaries,
        destMorphTargetDictionary,
    });
    dest.index = mergeSourceIndices({ meshes });
    //disable for now cuz no animations.
    // dest.animations = remapAnimationClips({
    //   meshes,
    //   animationClips: dedupBy(Array.from(source.animationClips.values()).flat(), "name"),
    //   animationClips: '',
    //   sourceMorphTargetDictionaries: source.morphTargetDictionaries,
    //   destMorphTargetDictionary,
    // });
    dest.animations = {};
    return { source, dest };
}
