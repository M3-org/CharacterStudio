import * as THREE from "three";


import { GLTFExporter } from './GLTFExporter.js';
// // if this is node.js, use the local version of the library, other import the library from three.js jsm examples
// if (!process && !process.env.env) {
//     console.log('browser!')
//     GLTFExporter = await import('three/examples/jsm/exporters/GLTFExporter.js').module;
// }

import { findChildrenByType, findChildByName } from "./utils.js";
import { combine } from "./mesh-combination.js";
import debugConfig from "./debug-config.js";
export function cloneSkeleton(skinnedMesh) {
    skinnedMesh.skeleton.pose();
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
            clone.add(boneClones.get(child));
        }
    });
    return new THREE.Skeleton(skinnedMesh.skeleton.bones.map((b) => boneClones.get(b)));
}
function ensureHubsComponents(userData) {
    if (!userData.gltfExtensions) {
        userData.gltfExtensions = {};
    }
    if (!userData.gltfExtensions.MOZ_hubs_components) {
        userData.gltfExtensions.MOZ_hubs_components = {};
    }
    return userData;
}
export function combineHubsComponents(a, b) {
    ensureHubsComponents(a);
    ensureHubsComponents(b);
    if (a.gltfExtensions.MOZ_hubs_components)
        // TODO: Deep merge
        a.gltfExtensions.MOZ_hubs_components = Object.assign(a.gltfExtensions.MOZ_hubs_components, b.gltfExtensions.MOZ_hubs_components);
    return a;
}
export const exportGLTF = (function () {
    const exporter = new GLTFExporter();
    return (object3D, { binary, animations }) => {
        return new Promise((resolve) => {
            exporter.parse(object3D, (gltf) => resolve({ gltf }), (error) => { console.log('error', error); }, { binary, animations });
        });
    };
})();
function addNonDuplicateAnimationClips(clone, scene) {
    const clipsToAdd = [];
    for (const clip of scene.animations) {
        const index = clone.animations.findIndex((clonedAnimation) => {
            return clonedAnimation.name === clip.name;
        });
        if (index === -1) {
            clipsToAdd.push(clip);
        }
    }
    for (const clip of clipsToAdd) {
        clone.animations.push(clip);
    }
}
function cloneIntoAvatar(avatarGroup) {
    const clonedScene = new THREE.Group();
    clonedScene.name = "Scene";
    // Combine the root "Scene" nodes
    const scenes = avatarGroup.children
        .map((o) => {
        return findChildByName(o, "Scene");
    })
        .filter((o) => !!o);
    for (const scene of scenes) {
        addNonDuplicateAnimationClips(clonedScene, scene);
    }
    // Combine the "AvatarRoot" nodes
    const avatarRoots = avatarGroup.children
        .map((o) => {
        return findChildByName(o, "AvatarRoot") || findChildByName(o, "Avatar");
    })
        .filter((o) => !!o);
    const clonedAvatarRoot = avatarRoots[0].clone(false);
    for (const avatarRoot of avatarRoots) {
        clonedAvatarRoot.userData = combineHubsComponents(clonedAvatarRoot.userData, avatarRoot.userData);
    }
    // Clone skinned meshes, bind them to a new skeleton
    const clonedSkinnedMeshes = findChildrenByType(avatarGroup, "SkinnedMesh").map((o) => {
        return o.clone(false);
    });
    const clonedSkeleton = cloneSkeleton(clonedSkinnedMeshes[0]);
    for (const skinnedMesh of clonedSkinnedMeshes) {
        skinnedMesh.bind(clonedSkeleton);
    }
    // Combine clones
    clonedScene.add(clonedAvatarRoot);
    clonedAvatarRoot.add(clonedSkeleton.bones[0]); // Assume bones[0] is root bone
    for (const skinnedMesh of clonedSkinnedMeshes) {
        clonedAvatarRoot.add(skinnedMesh);
    }
    return clonedScene;
}
export async function exportAvatar({ avatar, atlasSize = 4096 }) {
    // TODO: Re-evaluate whether we want to perform this step.
    // The intention (for now) is to make combination optional,
    // so that it is easy to debug and also if non-mergable meshes
    // are added, there's a workaround for them.
    const clone = cloneIntoAvatar(avatar);
    const combinedAvatar = await combine({ avatar: clone, atlasSize });
    if (debugConfig.debugGLTF) {
        console.log("avatar", combinedAvatar);
        const { gltf } = await exportGLTF(combinedAvatar, { binary: false, animations: combinedAvatar.animations });
        console.log("gltf", gltf);
    }
    const { gltf: glb } = await exportGLTF(combinedAvatar, { binary: true, animations: combinedAvatar.animations });
    return { glb };
}
