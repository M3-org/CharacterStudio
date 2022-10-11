import * as THREE from "three";
import { findChildrenByType } from "./utils.js";
import { createTextureAtlas } from "./create-texture-atlas.js";
import { cloneSkeleton } from "./export.js";
import { mergeGeometry } from "./merge-geometry.js";
function addIn({ bakedAttribute, morphAttribute, weight }) {
    for (let i = 0; i < bakedAttribute.array.length; i++) {
        bakedAttribute.array[i] += morphAttribute.array[i] * weight;
    }
}
function bakeMorphs(mesh) {
    const bakedMorphIndices = new Set();
    if (!mesh.morphTargetInfluences)
        return bakedMorphIndices;
    if (!mesh.geometry.morphTargetsRelative)
        return bakedMorphIndices;
    const morphAttributes = mesh.geometry.morphAttributes;
    Object.entries(morphAttributes).forEach(([propertyName, buffers]) => {
        buffers.forEach((morphBufferAttribute, index) => {
            const weight = mesh.morphTargetInfluences[index];
            if (weight > 0) {
                bakedMorphIndices.add(index);
                addIn({
                    bakedAttribute: mesh.geometry.attributes[propertyName],
                    morphAttribute: morphBufferAttribute,
                    weight,
                });
            }
        });
    });
    return bakedMorphIndices;
}
function removeBakedMorphs(mesh, bakedMorphIndices) {
    bakedMorphIndices.forEach((morphIndex) => {
        delete mesh.geometry.morphAttributes[morphIndex];
        mesh.morphTargetInfluences.splice(morphIndex, 1);
        const [morphName, _morphIndex] = Object.entries(mesh.morphTargetDictionary).find(([morphName, index]) => index === morphIndex);
        delete mesh.morphTargetDictionary[morphName];
    });
}
export async function combine({ transparentColor, avatar, atlasSize = 4096 }) {
    const { bakeObjects, textures, uvs, vrmData } = await createTextureAtlas({ transparentColor, atlasSize, meshes: findChildrenByType(avatar, "SkinnedMesh")});
    if (vrmData != null)
        vrmData.textureProperties = {_MainTex:0, _ShadeTexture:0}
        
    
    const meshes = bakeObjects.map((bakeObject) => bakeObject.mesh);
    meshes.forEach((mesh) => {
        const geometry = mesh.geometry;
        if (!geometry.attributes.uv2) {
            geometry.attributes.uv2 = geometry.attributes.uv;
        }
        // Exlude the currently "activated" morph attributes before merging.
        // The BufferAttributes are not lost; they remain in `mesh.geometry.morphAttributes`
        // and the influences remain in `mesh.morphTargetInfluences`.
        for (let i = 0; i < 8; i++) {
            delete geometry.attributes[`morphTarget${i}`];
            delete geometry.attributes[`morphNormal${i}`];
        }
    });
    const { source, dest } = mergeGeometry({ meshes });
    const geometry = new THREE.BufferGeometry();
    geometry.attributes = dest.attributes;
    geometry.morphAttributes = dest.morphAttributes;
    geometry.morphTargetsRelative = true;
    geometry.setIndex(dest.index);
    const material = new THREE.MeshStandardMaterial({
        map: textures["diffuse"],
    });
    
    material.userData.vrmMaterialProperties = vrmData;
    const mesh = new THREE.SkinnedMesh(geometry, material);
    mesh.name = "CombinedMesh";
    mesh.morphTargetInfluences = dest.morphTargetInfluences;
    mesh.morphTargetDictionary = dest.morphTargetDictionary;
    // Add unmerged meshes
    // const clones = meshesToExclude.map((o) => {
    //   return o.clone(false);
    // });
    const skeleton = cloneSkeleton(meshes[0]);
    mesh.bind(skeleton);
    // clones.forEach((clone) => {
    //   clone.bind(skeleton);
    // });
    const group = new THREE.Object3D();
    group.name = "AvatarRoot";
    group.animations = dest.animations;
    group.add(mesh);
    group.add(skeleton.bones[0]);
    // clones.forEach((clone) => {
    //   group.add(clone);
    // });

    // save material as property to get it later
    material.userData.shadeTexture = textures["uniformColor"];
    group.userData.atlasMaterial = material;
    return group;
}
