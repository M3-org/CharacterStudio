import * as THREE from "three";
import { VRMSpringBoneCollider } from "@pixiv/three-vrm";
import { disposeVRM, renameVRMBones, addModelData } from "./utils";
import { getNodesWithColliders, saveVRMCollidersToUserData, renameMorphTargets } from "./load-utils";

/**
 * Manages VRM model operations including setup, colliders, morph targets, and disposal.
 * @class VRMManager
 */
export class VRMManager {
    /**
     * Creates a new VRMManager instance.
     * @param {Object} manifestDataManager - The manifest data manager instance
     */
    constructor(manifestDataManager) {
        this.manifestDataManager = manifestDataManager;
        this.vrmModels = new Map();
    }

    /**
     * Sets up a VRM model with all necessary configurations.
     * @param {Object} m - The model to set up
     * @param {string} collectionID - Collection ID
     * @param {Object} item - Item data
     * @param {string} traitID - Trait ID
     * @param {Array} textures - Array of textures
     * @param {Array} colors - Array of colors
     * @returns {Object|null} The set up VRM model or null if setup fails
     */
    setupVRM(m, collectionID, item, traitID, textures, colors) {
        let vrm = m.userData.vrm;
        if (m.userData.vrm == null) {
            console.error("No valid VRM was provided for " + traitID + " trait, skipping file.");
            return null;
        }

        addModelData(vrm, { isVRM0: vrm.meta?.metaVersion === '0' });

        if (this.manifestDataManager.isColliderRequired(traitID)) {
            saveVRMCollidersToUserData(m);
        }

        // Apply colliders to the spring manager
        this.applySpringBoneColliders(vrm);

        renameVRMBones(vrm);
        renameMorphTargets(m);

        // Unregister the Blendshapes from the manifest
        this.unregisterMorphTargets(vrm, collectionID);

        // Handle VRM0 specific setup
        if (vrm.meta?.metaVersion === '0') {
            this._setupVRM0(vrm);
        } else {
            console.log("Loaded VRM1 file ", vrm);
        }

        return vrm;
    }

    /**
     * Sets up VRM0 specific configurations.
     * @private
     * @param {Object} vrm - The VRM model to set up
     */
    _setupVRM0(vrm) {
        if (vrm.humanoid.humanBones.hips.node.parent == vrm.scene) {
            const dummyRotate = new THREE.Object3D();
            dummyRotate.name = "newRootNode";
            addChildAtFirst(vrm.scene, dummyRotate);
            dummyRotate.add(vrm.humanoid.humanBones.hips.node);
        }
        vrm.humanoid.humanBones.hips.node.parent.rotateY(3.14159);

        vrm.scene.traverse((child) => {
            if (child.isSkinnedMesh) {
                for (let i = 0; i < child.skeleton.bones.length; i++) {
                    child.skeleton.bones[i].userData.vrm0RestPosition = { ...child.skeleton.bones[i].position };
                }
                child.userData.isVRM0 = true;
            }
        });
        console.log("Loaded VRM0 file ", vrm);
    }

    /**
     * Applies spring bone colliders to a VRM model.
     * @param {Object} vrm - The VRM model to apply colliders to
     */
    applySpringBoneColliders(vrm) {
        const colliderGroups = this._getColliderGroups(vrm);
        this._addCollidersToJoints(vrm, colliderGroups);
    }

    /**
     * Gets collider groups from all VRM models.
     * @private
     * @param {Object} vrm - The VRM model to get colliders from
     * @returns {Array} Array of collider groups
     */
    _getColliderGroups(vrm) {
        const colliderGroups = [];
        Object.entries(this.vrmModels).map(([_, entry]) => {
            const nodes = getNodesWithColliders(entry.vrm);
            if (nodes.length === 0) return;

            nodes.forEach((node) => {
                if (!vrm.springBoneManager) return;

                const colliderGroup = {
                    colliders: [],
                    name: node.name,
                };

                for (const child of node.children) {
                    if (child instanceof VRMSpringBoneCollider) {
                        if (colliderGroup.colliders.indexOf(child) === -1) {
                            colliderGroup.colliders.push(child);
                        }
                    }
                }

                if (colliderGroup.colliders.length) {
                    const groupExists = colliderGroups.find((cg) => cg.name == colliderGroup.name);
                    if (groupExists && groupExists.colliders.length != colliderGroup.colliders.length) {
                        const newColliders = colliderGroup.colliders.filter(
                            (c) => !groupExists.colliders.find((cg) => cg.name == c.name)
                        );
                        groupExists.colliders.push(...newColliders);
                    } else if (!groupExists) {
                        colliderGroups.push(colliderGroup);
                    }
                }
            });
        });
        return colliderGroups;
    }

    /**
     * Adds collider groups to the joints of a VRM model.
     * @private
     * @param {Object} vrm - The VRM model
     * @param {Array} colliderGroups - Array of collider groups to add
     */
    _addCollidersToJoints(vrm, colliderGroups) {
        vrm.springBoneManager.joints.forEach((joint) => {
            for (const group of colliderGroups) {
                const joinGroup = joint.colliderGroups.find((cg) => cg.name == group.name);
                if (joinGroup) {
                    if (group.colliders.length != joinGroup.colliders.length) {
                        const newColliders = group.colliders.filter(
                            (c) => !joinGroup.colliders.find((cc) => cc.name == c.name)
                        );
                        joinGroup.colliders.push(...newColliders);
                    }
                } else {
                    joint.colliderGroups.push(group);
                }
            }
        });
    }

    /**
     * Unregisters morph targets from the manifest.
     * @param {Object} vrm - The VRM model
     * @param {string} identifier - Manifest identifier
     */
    unregisterMorphTargets(vrm, identifier) {
        const manifestBlendShapes = this.manifestDataManager.getAllBlendShapeTraits(identifier);
        const expressions = vrm.expressionManager?.expressions;
        if (manifestBlendShapes.length == 0) return;
        if (!expressions) return;

        const expressionToRemove = [];
        for (const expression of expressions) {
            if (manifestBlendShapes.map((b) => b.id).includes(expression.expressionName)) {
                expressionToRemove.push(expression);
            }
        }

        for (const expression of expressionToRemove) {
            vrm.expressionManager.unregisterExpression(expression);
        }
    }

    /**
     * Disposes of a VRM model and its resources.
     * @param {Object} vrm - The VRM model to dispose
     */
    disposeVRM(vrm) {
        disposeVRM(vrm);
    }

    /**
     * Adds a VRM model to the manager's collection.
     * @param {string} id - The ID of the VRM model
     * @param {Object} vrm - The VRM model to add
     */
    addVRM(id, vrm) {
        this.vrmModels.set(id, { vrm });
    }

    /**
     * Removes a VRM model from the manager's collection.
     * @param {string} id - The ID of the VRM model to remove
     */
    removeVRM(id) {
        const vrmData = this.vrmModels.get(id);
        if (vrmData) {
            this.disposeVRM(vrmData.vrm);
            this.vrmModels.delete(id);
        }
    }
} 