import { BufferAttribute, Euler, Vector3 } from "three";
import { VRMExpressionPresetName } from "@pixiv/three-vrm";
import { encodeToKTX2 } from 'ktx2-encoder';
import { KtxDecoder } from "./ktx";
import { KTXTools } from "./ktxtools";




function ToOutputVRMMeta(vrmMeta, icon, outputImage) {
    return {
        allowedUserName: vrmMeta.allowedUserName,
        author: vrmMeta.author,
        commercialUssageName: vrmMeta.commercialUssageName,
        contactInformation: vrmMeta.contactInformation,
        licenseName: vrmMeta.licenseName,
        otherLicenseUrl: vrmMeta.otherLicenseUrl,
        otherPermissionUrl: vrmMeta.otherPermissionUrl,
        reference: vrmMeta.reference,
        sexualUssageName: vrmMeta.sexualUssageName,
        texture: icon ? outputImage.length - 1 : undefined,
        title: vrmMeta.title,
        version: vrmMeta.version,
        violentUssageName: vrmMeta.violentUssageName,
    };
}


const debug = false;


// WebGL(OpenGL)マクロ定数
var WEBGL_CONST;
(function (WEBGL_CONST) {
    WEBGL_CONST[WEBGL_CONST["ARRAY_BUFFER"] = 34962] = "ARRAY_BUFFER";
    WEBGL_CONST[WEBGL_CONST["ELEMENT_ARRAY_BUFFER"] = 34963] = "ELEMENT_ARRAY_BUFFER";
    WEBGL_CONST[WEBGL_CONST["BYTE"] = 5120] = "BYTE";
    WEBGL_CONST[WEBGL_CONST["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
    WEBGL_CONST[WEBGL_CONST["SHORT"] = 5122] = "SHORT";
    WEBGL_CONST[WEBGL_CONST["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
    WEBGL_CONST[WEBGL_CONST["UNSIGNED_INT"] = 5125] = "UNSIGNED_INT";
    WEBGL_CONST[WEBGL_CONST["FLOAT"] = 5126] = "FLOAT";
    WEBGL_CONST[WEBGL_CONST["LINEAR"] = 9729] = "LINEAR";
    WEBGL_CONST[WEBGL_CONST["REPEAT"] = 10497] = "REPEAT";
})(WEBGL_CONST || (WEBGL_CONST = {}));
const BLENDSHAPE_PREFIX = "blend_";
const MORPH_CONTROLLER_PREFIX = "BlendShapeController_";
const SPRINGBONE_COLLIDER_NAME = "vrmColliderSphere";
const EXPORTER_VERSION = "alpha-v1.0";
const CHUNK_TYPE_JSON = "JSON";
const CHUNK_TYPE_BIN = "BIN\x00";
const GLTF_VERSION = 2;
const HEADER_SIZE = 12;
function convertMetaToVRM0(meta) {
    return {
        title: meta.name,
        version: "v0",
        author: meta.authors?.length > 0 ? meta.authors.join(", ") : "",
        reference: meta.references != null ? meta.references.join(", "):"",
        contactInformation: meta.contactInformation != null ? meta.contactInformation : "",
        otherPermissionUrl: meta.otherPermissionUrl,
        allowedUserName: meta.avatarPermission != null ? meta.avatarPermission : "",
        violentUssageName: meta.allowExcessivelyViolentUsage ? "Allow" : "Disallow",
        sexualUssageName: meta.allowExcessivelySexualUsage ? "Allow" : "Disallow",
        commercialUssageName: meta.commercialUsage == "personalProfit" || meta.commercialUsage == "corporation"? "Allow" : "Disallow",
        licenseName:meta.copyrightInformation,
        otherLicenseUrl:meta.otherLicenseUrl,
        metaVersion:"0"
    }
}
function convertHumanoidToVRM0(humanoid) {
    const newHumanBones = [];
    for (const prop in humanoid.humanBones) {
        newHumanBones.push({
            bone: prop,
            node: humanoid.humanBones[prop].node
        })
    }
    return {
        humanBones: newHumanBones
    }
}

function getVRM0BlendshapeName(curName) {
    switch (curName) {
        case "happy":
            return "joy"
        case "sad":
            return "sorrow"
        case "relaxed":
            return "fun"
        case "aa":
            return "a"
        case "ih":
            return "i"
        case "ou":
            return "u"
        case "ee":
            return "e"
        case "oh":
            return "o"
        default:
            return curName;
    }
}

function getVRM0BoneName(name) {
    if (name.includes("Thumb")) {
        if (name.includes("Metacarpal"))
            return name.replace("Metacarpal", "Proximal")
        if (name.includes("Proximal"))
            return name.replace("Proximal", "Intermediate")
    }
    return name;
}
export default class VRMExporterv0 {
    async parse(vrm, avatar, screenshot, rootSpringBones, isktx2, scale, onDone) {
        const vrmMeta = convertMetaToVRM0(vrm.meta);
        const humanoid = convertHumanoidToVRM0(vrm.humanoid);
        const materials = vrm.materials;
        //const expressionsPreset = {};
        //const expressionCustom = {};
        const blendShapeGroups = [];
        // to do, add support to spring bones
        //const springBone = vrm.springBoneManager;
        const exporterInfo = {
            // TODO: データがなくて取得できない
            generator: "UniGLTF-2.0.0",
            version: "2.0",
        };
        // TODO: とりあえず全部ある想定で進める
        if (!avatar) {
            throw new Error("avatar is undefined or null");
        }
        else if (!humanoid) {
            throw new Error("humanoid is undefined or null");
        }
        else if (!vrmMeta) {
            throw new Error("meta is undefined or null");
        }
        else if (!materials) {
            throw new Error("materials is undefined or null");
        }

        // add support to spring bones
        // else if (!springBone) {
        //     throw new Error("springBone is undefined or null");
        // }
        // TODO: name基準で重複除外 これでいいのか？


        const uniqueMaterials = materials
            .filter((material, index, self) => self.findIndex((e) => e.name === material.name.replace(" (Outline)", "")) === index)
            .map((material) => material);

        const uniqueMaterialNames = uniqueMaterials.map((material) => material.name);

        const icon = screenshot
            ? { name: "icon", imageBitmap: screenshot.image }
            : null; // TODO: ない場合もある

        const mainImages = uniqueMaterials
            .filter((material) => material.map)
            .map((material) => {
                if (!material.map)
                    throw new Error(material.name + " map is null");
                return { name: material.name, imageBitmap: material.map.image };
            });
        const shadeImages = uniqueMaterials
            .filter((material) => material.userData.shadeTexture)
            .map((material) => {
                if (!material.userData.shadeTexture)
                    throw new Error(material.userData.shadeTexture + " map is null");
                return { name: material.name + "_shade", imageBitmap: material.userData.shadeTexture.image };
            });
        const ormImages = uniqueMaterials
            .filter((material) => material.roughnessMap)
            .map((material) => {
                if (!material.roughnessMap)
                    return null;
                return { name: material.name + "_orm", imageBitmap: material.roughnessMap.image };
            });

        const normalImages = uniqueMaterials
            .filter((material) => material.roughnessMap)
            .map((material) => {
                if (!material.normalMap)
                    return null
                return { name: material.name + "_normal", imageBitmap: material.normalMap.image };
            });
        const images = [...mainImages, ...shadeImages, ...ormImages, ...normalImages].filter(element => element !== null);
        const outputImages = toOutputImages(images, icon, isktx2 ? "image/ktx2" : "image/png");
        const outputSamplers = toOutputSamplers(outputImages);
        const outputTextures = toOutputTextures(outputImages, isktx2);
        const outputMaterials = toOutputMaterials(uniqueMaterials, images);
        const rootNode = avatar.children.filter((child) => child.children.length > 0 &&
            child.children[0].type === VRMObjectType.Bone)[0];
        const nodes = getNodes(rootNode).filter((node) => node.name !== SPRINGBONE_COLLIDER_NAME);
        const nodeNames = nodes.map((node) => node.name);
        const outputNodes = nodes.map((node) => {
            const childNodeIndices = node.children
                .filter((childNode) => childNode.name !== SPRINGBONE_COLLIDER_NAME)
                .map((childNode) => nodeNames.indexOf(childNode.name));

            return {
                name: node.name,
                rotation: [
                    node.quaternion.x,
                    node.quaternion.y,
                    node.quaternion.z,
                    node.quaternion.w,
                ],
                scale: [node.scale.x, node.scale.y, node.scale.z],
                translation: [node.position.x, node.position.y, node.position.z],
                children: childNodeIndices.length > 0 ? childNodeIndices : undefined,  // only include children if there are any
            };
        });
        const outputAccessors = [];
        const meshes = avatar.children.filter((child) => child.type === VRMObjectType.Group ||
            child.type === VRMObjectType.SkinnedMesh);
        const meshDatas = [];

        meshes.forEach((object, meshindex) => {
            const mesh = (object.type === VRMObjectType.Group
                ? object.children[0]
                : object);
            const attributes = mesh.geometry.attributes;
            const positionAttribute = new MeshData(attributes.position, WEBGL_CONST.FLOAT, MeshDataType.POSITION, AccessorsType.VEC3, mesh.name, undefined);
            meshDatas.push(positionAttribute);
            const meshDataIndex = meshDatas.length - 1;

            const normalArray = attributes.normal.array;
            const normalizedArray = new Float32Array(normalArray.length);

            for (let i = 0; i < normalArray.length; i += 3) {
                const x = normalArray[i];
                const y = normalArray[i + 1];
                const z = normalArray[i + 2];

                const length = Math.sqrt(x * x + y * y + z * z);

                normalizedArray[i] = x / length;
                normalizedArray[i + 1] = y / length;
                normalizedArray[i + 2] = z / length;
            }

            const normalAttribute = new MeshData(
                new BufferAttribute(normalizedArray, 3),
                WEBGL_CONST.FLOAT,
                MeshDataType.NORMAL,
                AccessorsType.VEC3,
                mesh.name,
                undefined
            );
            meshDatas.push(normalAttribute);

            meshDatas.push(new MeshData(attributes.uv, WEBGL_CONST.FLOAT, MeshDataType.UV, AccessorsType.VEC2, mesh.name, undefined));
            meshDatas.push(new MeshData(attributes.skinWeight, WEBGL_CONST.FLOAT, MeshDataType.SKIN_WEIGHT, AccessorsType.VEC4, mesh.name, undefined));
            meshDatas.push(new MeshData(attributes.skinIndex, WEBGL_CONST.UNSIGNED_SHORT, MeshDataType.SKIN_INDEX, AccessorsType.VEC4, mesh.name, undefined));
            const subMeshes = object.type === VRMObjectType.Group
                ? object.children.map((child) => child)
                : [object];
            subMeshes.forEach((subMesh) => {
                if (!subMesh.geometry.index) {
                    throw new Error(subMesh.name + " geometry.index is null");
                }
                meshDatas.push(new MeshData(subMesh.geometry.index, WEBGL_CONST.UNSIGNED_INT, MeshDataType.INDEX, AccessorsType.SCALAR, mesh.name, subMesh.name));
            });
            // TODO: とりあえずundefiendは例外スロー
            if (!mesh.morphTargetDictionary) {
                mesh.morphTargetDictionary = {};
                mesh.morphTargetInfluences = [];
                mesh.geometry.morphAttributes = {};
                mesh.updateMorphTargets();
                // throw new Error(mesh.name + " morphTargetDictionary is null");
            }

            mesh.geometry.userData.targetNames = [];
            

            const getMorphData = (attributeData, prop, meshDataType, baseAttribute) => {
                const nonZeroIndices = [];
                const nonZeroValues = [];

                // Step 1: Get Non-Zero Elements
                for (let i = 0; i < attributeData.length; i += 3) {
                    const x = attributeData[i];
                    const y = attributeData[i + 1];
                    const z = attributeData[i + 2];

                    // Check if any of the x, y, or z values is non-zero
                    if (x !== 0 || y !== 0 || z !== 0) {
                        nonZeroIndices.push(i / 3); // Push the index of the position, not the index in the array
                        nonZeroValues.push(x, y, z);
                    }
                }

                if (nonZeroIndices.length > 0) {
                    // Step 2: Sort the nonZeroIndices array in ascending order
                    const sortedIndices = [...nonZeroIndices].sort((a, b) => a - b);

                    // Step 3: Create a new nonZeroValues array based on the sorted indices
                    const sortedValues = [];
                    for (let i = 0; i < sortedIndices.length; i++) {
                        const index = sortedIndices[i];
                        const valueIndex = nonZeroIndices.indexOf(index);
                        sortedValues.push(nonZeroValues[valueIndex * 3], nonZeroValues[valueIndex * 3 + 1], nonZeroValues[valueIndex * 3 + 2]);
                    }

                    // Step 4: Create sparse data
                    const sparseData = {
                        targetMeshDataIndex: meshDataIndex,
                        count: sortedIndices.length,
                        indices: new Uint32Array(sortedIndices),
                        values: new Float32Array(sortedValues),
                    };

                    // Step 5: Create MeshData
                    meshDatas.push(new MeshData(
                        baseAttribute,
                        WEBGL_CONST.FLOAT,
                        meshDataType,
                        AccessorsType.VEC3,
                        mesh.name,
                        BLENDSHAPE_PREFIX + prop,
                        sparseData
                    ));
                }
            };

            for (const prop in mesh.morphTargetDictionary) {

                mesh.geometry.userData.targetNames.push(prop);
                const morphIndex = mesh.morphTargetDictionary[prop];
                const morphAttribute = mesh.geometry.morphAttributes;

                getMorphData(morphAttribute.position[morphIndex].array, prop, MeshDataType.BLEND_POSITION, attributes.position)

                if (morphAttribute.normal)
                    getMorphData(morphAttribute.normal[morphIndex].array, prop, MeshDataType.BLEND_NORMAL, attributes.normal)

            }
        });

        console.warn("taking only mesh 0 for morph targets now");
        for (const prop in vrm.expressionManager.expressionMap) {
            const expression = vrm.expressionManager.expressionMap[prop];
            const morphTargetBinds = expression._binds.map(obj => ({ mesh: 0, index: obj.index, weight: obj.weight * 100 }))
            //only add those that have connected binds
            if (morphTargetBinds.length > 0) {
                let isPreset = false;
                for (const presetName in VRMExpressionPresetName) {
                    if (prop === VRMExpressionPresetName[presetName] && prop !== "surprised") {
                        blendShapeGroups.push({
                            name: prop,
                            presetName: getVRM0BlendshapeName(prop),
                            binds: morphTargetBinds,
                            isBinary: expression.isBinary,
                        })
                        isPreset = true;
                        break;
                    }
                }
                if (isPreset === false) {
                    blendShapeGroups.push({
                        name: prop,
                        presetName: "unknown",
                        binds: morphTargetBinds,
                        isBinary: expression.isBinary,
                    })
                }
            }

            // to do, material target binds, and texture transform binds
        }


        // inverseBindMatrices length = 16(matrixの要素数) * 4バイト * ボーン数
        // TODO: とりあえず数合わせでrootNode以外のBoneのmatrixをいれた
        meshes.forEach((object) => {
            const mesh = (object.type === VRMObjectType.Group
                ? object.children[0]
                : object);
            const inverseBindMatrices = new Float32Array(mesh.skeleton.boneInverses.map((boneInv) => boneInv.elements).flat());
            meshDatas.push(new MeshData(new BufferAttribute(inverseBindMatrices, 16), WEBGL_CONST.FLOAT, MeshDataType.BIND_MATRIX, AccessorsType.MAT4, mesh.name, mesh.name));
        });
        outputAccessors.push(...meshDatas.map((meshData) => ({
            // bufferView: -1,
            // commented out byteOffset as it'd except a bufferView property to be present in the accessors sparse causing an error
            // byteOffset: 0,
            componentType: meshData.valueType,
            count: meshData.attribute.count,
            max: meshData.max,
            min: meshData.min,
            normalized: false,
            type: meshData.accessorsType,
        })));
        const outputMeshes = toOutputMeshes(meshes, meshDatas, uniqueMaterialNames);
        // mesh
        meshes.forEach((group, index) => {
            outputNodes.push({
                mesh: index,
                name: group.name,
                rotation: [
                    group.quaternion.x,
                    group.quaternion.y,
                    group.quaternion.z,
                    group.quaternion.w,
                ],
                scale: [group.scale.x, group.scale.y, group.scale.z],
                skin: index,
                translation: [group.position.x, group.position.y, group.position.z],
            });
        });
        // secondary
        // const secondaryRootNode = avatar.children.filter((child) => child.name === "secondary")[0];
        // outputNodes.push({
        //     name: secondaryRootNode.name,
        //     rotation: [
        //         secondaryRootNode.quaternion.x,
        //         secondaryRootNode.quaternion.y,
        //         secondaryRootNode.quaternion.z,
        //         secondaryRootNode.quaternion.w,
        //     ],
        //     scale: [
        //         secondaryRootNode.scale.x,
        //         secondaryRootNode.scale.y,
        //         secondaryRootNode.scale.z,
        //     ],
        //     translation: [
        //         secondaryRootNode.position.x,
        //         secondaryRootNode.position.y,
        //         secondaryRootNode.position.z,
        //     ],
        // });
        const outputSkins = toOutputSkins(meshes, meshDatas, nodeNames);

        const vrmHumanoid = {
            humanBones: []
            //humanBones2: Object.assign(humanoid.humanBones)

        };
        humanoid.humanBones.forEach(bone => {

            if (nodeNames.indexOf(bone.node.name) != -1) vrmHumanoid.humanBones.push({
                bone: getVRM0BoneName(bone.bone), //for thumb
                node: nodeNames.indexOf(bone.node.name),
                useDefaultValues: true
            })
        });
        //rest of the data is stored in VRMHumanoidDescription
        // const vrmHumanoid = {
        //     armStretch: humanoid.humanDescription.armStretch,
        //     feetSpacing: humanoid.humanDescription.feetSpacing,
        //     hasTranslationDoF: humanoid.humanDescription.hasTranslationDoF,
        //     humanBones: Object.entries(humanoid.humanBones)
        //         .filter((x) => x[1].length > 0)
        //         .map((x) => ({
        //         bone: x[0],
        //         node: nodeNames.indexOf(x[1][0].node.name),
        //         useDefaultValues: true, // TODO:
        //     })),
        //     legStretch: humanoid.humanDescription.legStretch,
        //     lowerArmTwist: humanoid.humanDescription.lowerArmTwist,
        //     lowerLegTwist: humanoid.humanDescription.lowerLegTwist,
        //     upperArmTwist: humanoid.humanDescription.upperArmTwist,
        //     upperLegTwist: humanoid.humanDescription.upperLegTwist,
        // };

        const vrmMaterialProperties = {
            floatProperties: {
                // _BlendMode : 0, 
                // _BumpScale : 1, 
                // _CullMode : 0,
                // _Cutoff : 0.5,
                // _DebugMode : 0,
                _DstBlend: 0.5,
                // _IndirectLightIntensity : 0.1,
                // _LightColorAttenuation : 0,
                // _MToonVersion : 38, 
                // _OutlineColorMode : 0,
                // _OutlineCullMode : 1, 
                // _OutlineLightingMix : 1,
                // _OutlineScaledMaxDistance : 1, 
                // _OutlineWidth : 0.079, 
                // _OutlineWidthMode : 1, 
                // _ReceiveShadowRate : 1,
                // _RimFresnelPower : 1, 
                // _RimLift : 0, 
                // _RimLightingMix : 0, 
                _ShadeShift: 0.5,
                _ShadeToony: 0.5,
                _ShadingGradeRate: 0.5,
                // _SrcBlend : 1, 
                // _UvAnimRotation : 0,
                // _UvAnimScrollX : 0, 
                // _UvAnimScrollY : 0, 
                // _ZWrite : 1
            },
            keywordMap: {
                _NORMALMAP: false,
                MTOON_OUTLINE_COLOR_FIXED: true,
                MTOON_OUTLINE_WIDTH_WORLD: true
            },
            name: "VRMCombinedMat",
            renderQueue: 2000,
            shader: "VRM/MToon",
            tagMap: {
                RenderType: "Opaque"
            },
            textureProperties: {
                _MainTex: 0,
                _ShadeTexture: 0
            },
            vectorProperties: {
                _Color: [1, 1, 1, 1],
                _EmissionColor: [0, 0, 0, 1],
                _EmissionMap: [0, 0, 1, 1],
                _MainTex: [0, 0, 1, 1],
                _OutlineColor: [0, 0, 0, 1],
                _OutlineWidthTexture: [0, 0, 1, 1],
                _ReceiveShadowTexture: [0, 0, 1, 1],
                _RimColor: [0, 0, 0, 1],
                _RimTexture: [0, 0, 1, 1],
                _ShadeColor: [0.9, 0.9, 0.9, 1],
                // _ShadeTexture : [0, 0, 1, 1], 
                // _ShadingGradeTexture : [0, 0, 1, 1], 
                // _SphereAdd : [0, 0, 1, 1], 
                // _UvAnimMaskTexture : [0, 0, 1, 1]
            }
        }

        const stdMaterialProperties = {
            name: "STDCombinedMat",
            shader: "VRM_USE_GLTFSHADER",
        }

        const materialProperties = []
        uniqueMaterials.forEach(mat => {
            if (mat.type == "ShaderMaterial") {
                materialProperties.push(Object.assign({}, vrmMaterialProperties))
            }
            else {
                materialProperties.push(Object.assign({}, stdMaterialProperties))
            }
        });
        //const outputVrmMeta = ToOutputVRMMeta(vrmMeta, icon, outputImages);
        const outputVrmMeta = vrmMeta;
        const rootSpringBonesIndexes = [];
        rootSpringBones.forEach(rootSpringBone => {
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.name === rootSpringBone.name) {
                    rootSpringBonesIndexes.push(i);
                    break;
                }
            }
        })

        // should be fetched from rootSpringBonesIndexes instead
        const colliderGroups = [];


        const skeleton = meshes.find(mesh => mesh.isSkinnedMesh)?.skeleton || null;

        //current method: were saving in userData the values that we want to store, 
        for (let i = 0; i < skeleton.bones.length; i++) {
            const bn = skeleton.bones[i];
            if (bn.userData.VRMcolliders) {
                // get the node value here
                const colliderGroup = {
                    node: nodeNames.indexOf(bn.name),
                    colliders: [],
                    name: bn.name
                }
                bn.userData.VRMcolliders.forEach(collider => {
                    const sphere = collider.sphere
                    colliderGroup.colliders.push({
                        radius: sphere.radius * scale,
                        offset: { x: sphere.offset[0] * scale, y: sphere.offset[1] * scale, z: sphere.offset[2] * scale }
                    })
                });
                colliderGroups.push(colliderGroup)
            }
        }
        console.log("COLLIDER GROUPS", colliderGroups);

        const findBoneIndex = (boneName) => {
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                if (node.name === boneName) {
                    return i;
                }
            }
            return -1;
        }

        const boneGroups = [];
        rootSpringBones.forEach(springBone => {
            //const boneIndices = findBoneIndices(springBone.name);
            const boneIndex = findBoneIndex(springBone.name)
            if (boneIndex === -1) {
                console.warn("Spring bone " + springBone.name + " was removed during cleanup process. Skipping.");
                return; // Skip to the next iteration
            }
            // get the collider group indices
            const colliderIndices = [];
            springBone.colliderGroups.forEach(colliderGroup => {
                const springCollider = colliderGroup.colliders[0];
                // sometimes there are no colliders defined in collidersGroup
                if (springCollider != null) {
                    const springParent = springCollider.parent;
                    const ind = colliderGroups.findIndex(group => group.name === springParent.name);
                    if (ind != -1) {
                        if (!colliderIndices.includes(ind))
                            colliderIndices.push(ind);
                    }
                    else {
                        if (debug) console.warn("No collider group for bone name: ", springParent.name + " was found");
                    }
                }
                else {
                    if(debug) console.log("No colliders definition were present in vrm file file for: ", springBone.name + " spring bones")
                }
            });


            let centerIndex = findBoneIndex(springBone.center?.name);
            if (centerIndex == -1) console.warn("no center bone for spring bone " + springBone.name);
            // springBone: bone:boneObject, center:boneObject, string:name, array:colliderGroup, settings:object,  
            const settings = springBone.settings;

            // FIX!!

            boneGroups.push(
                {
                    bones: [boneIndex],
                    center: centerIndex,
                    colliderGroups: colliderIndices,
                    dragForce: settings.dragForce,
                    gravityDir: { x: settings.gravityDir.x, y: settings.gravityDir.y, z: settings.gravityDir.z },
                    gravityPower: settings.gravityPower,
                    hitRadius: settings.hitRadius,
                    stiffiness: settings.stiffness // for some reason specs mark as stiffiness, but loads it as stiffness
                }
            );
        });

        const outputSecondaryAnimation = {
            boneGroups,
            colliderGroups,
        }
        console.log(outputSecondaryAnimation);


        outputVrmMeta.texture = icon ? outputImages.length - 1 : undefined;
        const bufferViews = await Promise.all(
            images.map(async (image) => ({
                buffer: isktx2 ? await imageBitmap2ktx2(image.imageBitmap) : imageBitmap2png(image.imageBitmap),
                type: MeshDataType.IMAGE,
            }))
        );

        /// continue until code finished assigning buffers

        const meshDataBufferViewRelation = [];
        meshDatas.forEach((data, i) => {
            if (data.buffer) {
                bufferViews.push({ buffer: data.buffer, typeString: "", type: data.type });
            } else if (data.sparse) {
                bufferViews.push({ buffer: data.sparse.indices, typeString: "indices", type: data.type, count: data.sparse.count });
                bufferViews.push({ buffer: data.sparse.values, typeString: "values", type: data.type });
            }
            meshDataBufferViewRelation[i] = bufferViews.length - 1;
        });


        if (icon)
            bufferViews.push({
                buffer:  isktx2 ?  await imageBitmap2ktx2(icon.imageBitmap) : imageBitmap2png(icon.imageBitmap),
                type: MeshDataType.IMAGE,
            });
        let bufferOffset = 0;
        let imageIndex = 0;
        let accessorIndex = 0;

        let index = 0;
        const outputBufferViews = bufferViews.map((bufferView) => {
            const value = {
                buffer: 0,
                byteLength: bufferView.buffer.byteLength,
                byteOffset: bufferOffset,
                target: bufferView.type === MeshDataType.IMAGE ||
                    bufferView.type === MeshDataType.BIND_MATRIX ||
                    bufferView.typeString === "indices" || // added these conditions
                    bufferView.typeString === "values"
                    ? undefined
                    : bufferView.type === MeshDataType.INDEX
                        ? WEBGL_CONST.ELEMENT_ARRAY_BUFFER
                        : WEBGL_CONST.ARRAY_BUFFER,
            };
            bufferOffset += bufferView.buffer.byteLength;
            if (bufferView.type === MeshDataType.IMAGE) {
                outputImages[imageIndex++].bufferView = index;
                index++;
            }
            else {
                if (!meshDatas[accessorIndex].sparse) {
                    meshDatas[accessorIndex].bufferIndex = index;
                    // save the bufferview in case we need it for sparse accessors
                    outputAccessors[accessorIndex].bufferView = index;

                    accessorIndex++
                    index++;
                }
                else {
                    // create the sparse object if it has not been created yet
                    if (outputAccessors[accessorIndex].sparse == null) {
                        outputAccessors[accessorIndex].sparse = {}
                        // const targetBufferView = meshDataBufferViewRelation[meshDatas[accessorIndex].targetMeshDataIndex];
                        // outputAccessors[accessorIndex].bufferView = targetBufferView;
                        // console.log(outputAccessors[accessorIndex].bufferView);
                    }

                    // if the buffer view is representing indices of the sparse, save them into an indices object
                    // also save count, we can take the length of the indicesw view for this
                    if (bufferView.typeString === "indices") {
                        outputAccessors[accessorIndex].sparse.count = bufferView.count;
                        outputAccessors[accessorIndex].sparse[bufferView.typeString] = {
                            bufferView: index,
                            byteOffset: 0,
                            componentType: WEBGL_CONST.UNSIGNED_INT
                        }
                    }
                    if (bufferView.typeString === "values") {
                        outputAccessors[accessorIndex].sparse[bufferView.typeString] = {
                            bufferView: index,
                            byteOffset: 0,
                            // componentType : WEBGL_CONST.FLOAT
                        }
                    }

                    //outputAccessors[accessorIndex].sparse

                    // add accessor index only if this is the last sparse type value
                    if (bufferView.typeString === "values") {
                        accessorIndex++;
                    }

                    // always add to index
                    index++;
                }
            }
            return value;
        });

        const outputScenes = toOutputScenes(avatar, outputNodes);

        fillVRMMissingMetaData(outputVrmMeta);
        const extensionsUsed = [              
            "KHR_materials_unlit",
            "KHR_texture_transform",
            "VRM"
        ];

        if (isktx2){
            extensionsUsed.push("KHR_texture_basisu");
        }

        /**
         * Check for bone count mismatch else the VRM will be broken
         */
        for(const skin of outputSkins){
            const mats = outputAccessors.filter(acc => acc.type == "MAT4");
            for(let m of mats){
                if(skin.joints.length != m.count){
                    throw new Error(`The number of joints in the skin is not equal to the number of Accessors of type MAT4. Got ${skin.joints.length} when accessors show ${m.count} This is usually because of a bone count mismatch in your VRMs!`);
                }
            }

        }

        const outputData = {
            accessors: outputAccessors,
            asset: exporterInfo,
            buffers: [
                {
                    byteLength: bufferOffset,
                },
            ],
            bufferViews: outputBufferViews,
            extensions: {
                VRM: {
                    blendShapeMaster: { blendShapeGroups },
                    //firstPerson: vrmFirstPerson,
                    firstPerson: {
                        firstPersonBone: 44,
                        firstPersonBoneOffset: new Vector3(),
                        lookAtHorizontalInner: { curve: [0, 0, 0, 1, 1, 1, 1, 0], xRange: 90, yRange: 10 },
                        lookAtHorizontalOuter: { curve: [0, 0, 0, 1, 1, 1, 1, 0], xRange: 90, yRange: 10 },
                        lookAtTypeName: 'Bone',
                        lookAtVerticalDown: { curve: [0, 0, 0, 1, 1, 1, 1, 0], xRange: 90, yRange: 10 },
                        lookAtVerticalUp: { curve: [0, 0, 0, 1, 1, 1, 1, 0], xRange: 90, yRange: 10 },
                    },
                    materialProperties,
                    humanoid: vrmHumanoid,
                    meta: outputVrmMeta,
                    secondaryAnimation: outputSecondaryAnimation,
                    specVersion: "0.0"
                },
            },
            extensionsUsed: extensionsUsed,    
            images: outputImages,
            materials: outputMaterials,
            meshes: outputMeshes,
            nodes: outputNodes,
            samplers: outputSamplers,
            scenes: outputScenes,
            skins: outputSkins,
            textures: outputTextures,
        };
        console.log("output", outputData);
        const jsonChunk = new GlbChunk(parseString2Binary(JSON.stringify(outputData, undefined, 2)), "JSON");
        const binaryChunk = new GlbChunk(concatBinary(bufferViews.map((buf) => buf.buffer)), "BIN\x00");
        const fileData = concatBinary([jsonChunk.buffer, binaryChunk.buffer]);
        const header = concatBinary([
            parseString2Binary("glTF"),
            parseNumber2Binary(2, 4),
            parseNumber2Binary(fileData.byteLength + 12, 4),
        ]);
        onDone(concatBinary([header, fileData]));
    }
}
function fillVRMMissingMetaData(vrmMeta) {
    vrmMeta.title = vrmMeta.title || "Character";
    vrmMeta.version = vrmMeta.version || "1";
    vrmMeta.author = vrmMeta.author || "Anon";
    vrmMeta.contactInformation = vrmMeta.contactInformation || "";
    vrmMeta.reference = vrmMeta.reference || "";
    vrmMeta.allowedUserName = vrmMeta.allowedUserName || "Everyone";
    vrmMeta.violentUssageName = vrmMeta.violentUssageName || "Disallow";
    vrmMeta.sexualUssageName = vrmMeta.sexualUssageName || "Disallow";
    vrmMeta.commercialUssageName = vrmMeta.commercialUssageName || "Disallow";
    vrmMeta.otherPermissionUrl = vrmMeta.otherPermissionUrl || "";
    vrmMeta.licenseName = vrmMeta.licenseName || "Redistribution_Prohibited";
    vrmMeta.otherLicenseUrl = vrmMeta.otherLicenseUrl || "";
}

function radian2Degree(radian) {
    return radian * (180 / Math.PI);
}
function getNodes(parentNode) {
    if (parentNode.children.length <= 0)
        return [parentNode];
    return [parentNode].concat(parentNode.children.map((child) => getNodes(child)).flat());
}

// async function imageBitmap2ktx2(image) {
//     // Create ImageBitmap from the image
//     const bitmap = await createImageBitmap(image);

//     // Create a canvas and draw the ImageBitmap onto it
//     const canvas = document.createElement('canvas');
//     canvas.width = bitmap.width;
//     canvas.height = bitmap.height;

//     const ctx = canvas.getContext('bitmaprenderer');
//     ctx.transferFromImageBitmap(bitmap);

//     // Convert the canvas to a Blob
//     const blob2 = await new Promise((res) => canvas.toBlob(res));

//     // Encode the Blob to KTX2 format
//     const ktx2Data = await encodeToKTX2(blob2,{
//         mode: 'etc1s',  // Use ETC1S for better compression
//         quality: 'low',  // Adjust based on acceptable quality loss
//         compressionLevel: 1  // Lower values can increase compression
//     });

//     // Return the KTX2 data as an ArrayBuffer or Uint8Array
//     return new Uint8Array(ktx2Data);
// }

  // Initialize the KTX decoder/compressor

const ktxTools = new KTXTools();

async function imageBitmap2ktx2(image) {
    // Create ImageBitmap from the image
  const bitmap = await createImageBitmap(image);

  // Create a canvas and draw the ImageBitmap onto it
  const canvas = document.createElement('canvas');
  
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  

  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(bitmap, 0, 0);

  // Get the image data as a Uint8Array (RGBA format)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixelData = new Uint8Array(imageData.data.buffer);


  

  // Compress the image data to KTX2 format
  // reference https://github.khronos.org/KTX-Software/ktxtools/ktx_create.html
  const ktx2Data = await ktxTools.compress(pixelData, canvas.width, canvas.height, 4, {
    //basisu_options: {
        normalMap : false,

        uastc: false, // Set to true for higher quality UASTC compression
        qualityLevel: 50, // Adjust compression quality (0-100)
        compressionLevel: 2,
        /** Set the compression quality KTX2 - UASTC */
        // compressionUASTC_Rdo: false,
        // UASTC_supercmp_scheme: "Zstd",

        // --uastc-quality <level>
        uastcFlags: "DEFAULT", // "FASTEST", "FASTER", "DEFAULT", "SLOWER", "SLOWEST"

        // --astc-quality <level>
        // The quality level configures the quality-performance tradeoff for the compressor; more complete searches of the search space improve image quality at the expense of compression time
        // fastest == 0, fast == 10, medium == 60, thorough == 98, exhaustive == 100, 
        compressionUASTC_Rdo_Level: 18,

        // --uastc-rdo
        // Enable UASTC RDO post-processing.
        uastcRDO: false,

        // --uastc-rdo-l <lambda>
        // Set UASTC RDO quality scalar (lambda) to lambda. Lower values yield higher quality/larger LZ compressed files, higher values yield lower quality/smaller LZ compressed files.
        // A good range to try is [.25,10]. For normal maps a good range is [.25,.75]. The full 
        // Range is [.001,10.0]. Default is 1.0.
        uastcRDOQualityScalar: 1.0, 

        // --uastc-rdo-d <dictsize>
        // Set UASTC RDO dictionary size in bytes. Default is 4096. Lower values=faster, but give less compression. 
        // Range is [64,65536]
        uastcRDODictSize: 4096,

        // --uastc-rdo-b <scale>
        // Set UASTC RDO max smooth block error scale. Default is 10.0, 1.0 is disabled. Larger values suppress more artifacts (and allocate more bits) on smooth blocks.
        // Range is [1.0,300.0]
        uastcRDOMaxSmoothBlockErrorScale: 10.0,

        // --uastc-rdo-s <deviation>
        // Set UASTC RDO max smooth block standard deviation. Default is 18.0. Larger values expand the range of blocks considered smooth.
        // Range is [.01,65536.0]
        uastcRDOMaxSmoothBlockStdDev: 18.0,

        // --uastc-rdo-f
        uastcRDODontFavorSimplerModes: false,
        

        
        /** Set the compression quality KTX2 - ETC1S */
        // --clevel <level>
        // ETC1S / BasisLZ compression level, an encoding speed vs. quality tradeoff. Range is [0,5], default is 1. Higher values are slower but give higher quality.
        // ETC1SCompressionLevel: 2,

        // --qlevel <level>
        // ETC1S / BasisLZ quality level. 
        //Range is [1,255]. Lower gives better compression/lower quality/faster. Higher gives less compression/higher quality/slower. 
        //--qlevel automatically determines values for --max-endpoints, --max-selectors, --endpoint-rdo-threshold and --selector-rdo-threshold for the target quality level. Setting these options overrides the values determined by -qlevel which defaults to 128 if neither it nor --max-endpoints and --max-selectors have been set.
        ETC1SQualityLevel: 128,

        // --max-endpoints <arg>
        // Manually set the maximum number of color endpoint clusters. 
        // Range is [1,16128]. Default is 0, unset.
        ETC1SmaxEndpoints: 0,

        // --endpoint-rdo-threshold <arg>
        // Set endpoint RDO quality threshold. 
        // The default is 1.25. Lower is higher quality but less quality per output bit (try [1.0,3.0]). This will override the value chosen by --qlevel.
        ETC1SEndpointRdoThreshold: 1.25,

        // --max-selectors <arg>
        // Manually set the maximum number of color selector clusters from [1,16128]. Default is 0, unset.
        ETC1SMaxSelectors: 0,

        // --selector-rdo-threshold <arg>
        // Set selector RDO quality threshold. 
        // The default is 1.25. Lower is higher quality but less quality per output bit (try [1.0,3.0]). This will override the value chosen by --qlevel.
        ETC1SSelectorRdoThreshold: 1.25,

        // --no-endpoint-rdo
        // Disable endpoint rate distortion optimizations. Slightly faster, less noisy output, but lower quality per output bit. Default is to do endpoint RDO.
        ETC1SNoEndpointRdo: false,

        // --no-selector-rdo
        // Disable selector rate distortion optimizations. Slightly faster, less noisy output, but lower quality per output bit. Default is to do selector RDO.
        ETC1SNoSelectorRdo: false,
    //},
    supercmp_scheme: 'Zstd', // Optional: Enable supercompression Zstd, Zlib, BasisLZ, None

    //compression_level: 18
  });

  return ktx2Data;
}
  

function imageBitmap2png(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    canvas.getContext("2d").drawImage(image, 0, 0);

    // Convert canvas data to PNG format
    const pngUrl = canvas.toDataURL("image/png");

    // Extract base64-encoded data
    const data = atob(pngUrl.split(",")[1]);

    // Calculate the necessary padding to ensure the length is a multiple of 4
    const padding = (4 - (data.length % 4)) % 4;

    // Create an array with the correct length (padded if needed)
    const array = new ArrayBuffer(data.length + padding);

    // Use a DataView to set Uint8 values
    const view = new DataView(array);

    // Copy the original data to the array
    for (let i = 0; i < data.length; i++) {
        view.setUint8(i, data.charCodeAt(i));
    }

    // Optionally, pad with zeros
    for (let i = data.length; i < data.length + padding; i++) {
        view.setUint8(i, 0);
    }
    return array;
}
function parseNumber2Binary(number, size) {
    const buf = new ArrayBuffer(size);
    const view = new DataView(buf);
    view.setUint32(0, number, true);
    return buf;
}
function parseString2Binary(str) {
    return new TextEncoder().encode(str).buffer;
}
function concatBinary(arrays) {
    let sumLength = 0;
    for (let i = 0; i < arrays.length; i++) {
        sumLength += arrays[i].byteLength;
    }
    const output = new Uint8Array(sumLength);
    let pos = 0;
    for (let i = 0; i < arrays.length; ++i) {
        output.set(new Uint8Array(arrays[i]), pos);
        pos += arrays[i].byteLength;
    }
    return output.buffer;
}
function parseBinary(attr, componentType) {
    const componentTypeSize = componentType === WEBGL_CONST.UNSIGNED_SHORT ? 2 : 4;
    const array = attr.array;
    let offset = 0;
    const buf = new ArrayBuffer(attr.count * attr.itemSize * componentTypeSize);
    const view = new DataView(buf);
    for (let i = 0; i < attr.count; i++) {
        for (let a = 0; a < attr.itemSize; a++) {
            let value;
            if (attr.itemSize > 4) {
                value = array[i * attr.itemSize + a];
            }
            else {
                if (a === 0)
                    value = attr.getX(i);
                else if (a === 1)
                    value = attr.getY(i);
                else if (a === 2)
                    value = attr.getZ(i);
                else
                    value = attr.getW(i);
            }
            if (componentType === WEBGL_CONST.UNSIGNED_SHORT) {
                view.setUint16(offset, value, true);
            }
            else if (componentType === WEBGL_CONST.UNSIGNED_INT) {
                view.setUint32(offset, value, true);
            }
            else {
                view.setFloat32(offset, value, true);
            }
            offset += componentTypeSize;
        }
    }
    return buf;
}
class GlbChunk {
    constructor(data, type) {
        this.data = data;
        this.type = type;
        const paddedData = this.padBuffer(this.data, type === "JSON" ? 0x20 : 0x00);
        this.buffer = concatBinary([
            parseNumber2Binary(paddedData.byteLength, 4),
            parseString2Binary(this.type),
            paddedData,
        ]);
    }

    padBuffer(buffer, paddingByte) {
        const paddedLength = Math.ceil(buffer.byteLength / 4) * 4;
        if (buffer.byteLength === paddedLength) {
            return buffer;
        }
        const paddedBuffer = new ArrayBuffer(paddedLength);
        new Uint8Array(paddedBuffer).set(new Uint8Array(buffer));
        new Uint8Array(paddedBuffer).fill(paddingByte, buffer.byteLength);
        return paddedBuffer;
    }
}
const calculateMinMax = (valuesArray) => {
    const max = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
    const min = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];

    for (let i = 0; i < valuesArray.length; i += 3) {
        max[0] = Math.max(max[0], valuesArray[i]);
        max[1] = Math.max(max[1], valuesArray[i + 1]);
        max[2] = Math.max(max[2], valuesArray[i + 2]);

        min[0] = Math.min(min[0], valuesArray[i]);
        min[1] = Math.min(min[1], valuesArray[i + 1]);
        min[2] = Math.min(min[2], valuesArray[i + 2]);
    }

    return { max, min };
}

export class MeshData {
    constructor(attribute, valueType, type, accessorsType, meshName, name, sparseData) {
        this.attribute = attribute;
        this.type = type;
        this.valueType = valueType;
        this.accessorsType = accessorsType;
        this.meshName = meshName;
        this.name = name;

        // Check if sparse data is provided

        if (sparseData) {
            const { indices, values, count, targetMeshDataIndex } = sparseData;

            // Convert indices and values to BufferAttributes
            const indicesBufferAttribute = new BufferAttribute(
                indices,
                1 // Set the item size to 1 for indices
            );
            const valuesBufferAttribute = new BufferAttribute(
                values,
                attribute.itemSize // Use the same item size as the original attribute
            );

            this.targetMeshDataIndex = targetMeshDataIndex;

            // pass as attribute
            this.sparse = {
                targetMeshDataIndex,
                count,
                indices: parseBinary(indicesBufferAttribute, WEBGL_CONST.UNSIGNED_INT), // detect if use WEBGL_CONST.UNSIGNED_SHORT or WEBGL_CONST.UNSIGNED_INT
                values: parseBinary(valuesBufferAttribute, WEBGL_CONST.FLOAT)
            }

            if (type === MeshDataType.POSITION || type === MeshDataType.BLEND_POSITION){
                const {
                    min,
                    max
                } = calculateMinMax(values);
                this.max = max;
                this.min = min;
            }
        }
        else {
            this.buffer = parseBinary(this.attribute, this.valueType)

            if (type === MeshDataType.POSITION || type === MeshDataType.BLEND_POSITION){
                const {
                    min,
                    max
                } = calculateMinMax(this.attribute.array);
                this.max = max;
                this.min = min;
            }
        }

    }
}

var MaterialType;
(function (MaterialType) {
    MaterialType["MeshBasicMaterial"] = "MeshBasicMaterial";
    MaterialType["MeshStandardMaterial"] = "MeshStandardMaterial";
    MaterialType["MToonMaterial"] = "MToonMaterial";
})(MaterialType || (MaterialType = {}));
var AccessorsType;
(function (AccessorsType) {
    AccessorsType["SCALAR"] = "SCALAR";
    AccessorsType["VEC2"] = "VEC2";
    AccessorsType["VEC3"] = "VEC3";
    AccessorsType["VEC4"] = "VEC4";
    AccessorsType["MAT4"] = "MAT4";
})(AccessorsType || (AccessorsType = {}));
var MeshDataType;
(function (MeshDataType) {
    MeshDataType["POSITION"] = "POSITION";
    MeshDataType["NORMAL"] = "NORMAL";
    MeshDataType["UV"] = "UV";
    MeshDataType["INDEX"] = "INDEX";
    MeshDataType["SKIN_WEIGHT"] = "SKIN_WEIGHT";
    MeshDataType["SKIN_INDEX"] = "SKIN_INDEX";
    MeshDataType["BLEND_POSITION"] = "BLEND_POSITION";
    MeshDataType["BLEND_NORMAL"] = "BLEND_NORMAL";
    MeshDataType["BIND_MATRIX"] = "BIND_MATRIX";
    MeshDataType["IMAGE"] = "IMAGE";
})(MeshDataType || (MeshDataType = {}));
var VRMObjectType;
(function (VRMObjectType) {
    VRMObjectType["Group"] = "Group";
    VRMObjectType["SkinnedMesh"] = "SkinnedMesh";
    VRMObjectType["Object3D"] = "Object3D";
    VRMObjectType["Bone"] = "Bone";
})(VRMObjectType || (VRMObjectType = {}));
const toOutputMeshes = (meshes, meshDatas, uniqueMaterialNames) => {
    return meshes.map((object) => {
        const mesh = (object.type === VRMObjectType.Group
            ? object.children[0]
            : object);
        const subMeshes = object.type === VRMObjectType.Group
            ? object.children.map((child) => child)
            : [object];
        return {
            // extras: {
            //   targetNames: mesh.geometry.userData.targetNames,
            // },
            name: object.name,
            primitives: subMeshes.map((subMesh) => {
                const meshTypes = meshDatas.map((data) => data.meshName === mesh.name ? data.type : null);
                const materialName = Array.isArray(subMesh.material)
                    ? subMesh.material[0].name
                    : subMesh.material.name;
                return {
                    attributes: {
                        JOINTS_0: meshTypes.indexOf(MeshDataType.SKIN_INDEX),
                        NORMAL: meshTypes.indexOf(MeshDataType.NORMAL),
                        POSITION: meshTypes.indexOf(MeshDataType.POSITION),
                        TEXCOORD_0: meshTypes.indexOf(MeshDataType.UV),
                        WEIGHTS_0: meshTypes.indexOf(MeshDataType.SKIN_WEIGHT),
                    },
                    extras: {
                        targetNames: subMesh.geometry.userData.targetNames,
                    },
                    indices: meshDatas
                        .map((data) => data.type === MeshDataType.INDEX && data.meshName === mesh.name
                            ? data.name
                            : null)
                        .indexOf(subMesh.name),
                    material: uniqueMaterialNames.indexOf(materialName),
                    mode: 4,
                    targets: mesh.geometry.userData.targetNames
                        ? mesh.geometry.userData.targetNames.map((targetName) => {
                            const normalIndex = meshDatas
                                .map((data) => data.type === MeshDataType.BLEND_NORMAL &&
                                    data.meshName === mesh.name
                                    ? data.name
                                    : null)
                                .indexOf(BLENDSHAPE_PREFIX + targetName);

                            const positionIndex = meshDatas
                                .map((data) => data.type === MeshDataType.BLEND_POSITION &&
                                    data.meshName === mesh.name
                                    ? data.name
                                    : null)
                                .indexOf(BLENDSHAPE_PREFIX + targetName);


                            const result = {}
                            if (positionIndex !== -1)
                                result.POSITION = positionIndex;
                            if (normalIndex !== -1)
                                result.NORMAL = normalIndex;
                            // Use the indices or handle the case when they are -1
                            return result;
                        })
                        : undefined,
                };
            }),
        };
    });
};
const toOutputSkins = (meshes, meshDatas, nodeNames) => {
    return meshes.map((object) => {
        const mesh = (object.type === VRMObjectType.Group
            ? object.children[0]
            : object);
        return {
            inverseBindMatrices: meshDatas
                .map((data) => data.type === MeshDataType.BIND_MATRIX ? data.meshName : null)
                .indexOf(mesh.name),
            joints: mesh.skeleton.bones.map((bone) => nodeNames.indexOf(bone.name)).filter((index) => index !== -1),
            skeleton: nodeNames.indexOf(mesh.skeleton.bones[0].name),
        };
    });
};
const toOutputMaterials = (uniqueMaterials, images) => {
    return uniqueMaterials.map((material) => {
        let baseColor;
        let VRMC_materials_mtoon = null;

        material = material.userData.vrmMaterial ? material.userData.vrmMaterial : material;
        if (material.type === "ShaderMaterial") {
            //VRMC_materials_mtoon = material.userData.gltfExtensions.VRMC_materials_mtoon;
            VRMC_materials_mtoon = {};
            //   VRMC_materials_mtoon.specVersion = VRMC_materials_mtoon.specVersion || "1.0";
            VRMC_materials_mtoon.shadeMultiplyTexture = { index: images.map((image) => image.name).indexOf(material.uniforms.shadeMultiplyTexture.name) };
            const mtoonMaterial = material;
            baseColor = mtoonMaterial.color ? [
                1,
                1,
                1,
                1,
            ] :
                undefined;
        } else {
            const otherMaterial = material;
            baseColor = otherMaterial.color ? [
                otherMaterial.color.r,
                otherMaterial.color.g,
                otherMaterial.color.b,
                1, // TODO:
            ] :
                undefined;
        }
        let baseTxrIndex = -1;
        if (material.map)
            baseTxrIndex = images.map((image) => image.name).indexOf(material.name);
        else if (material.uniforms) {
            if (material.uniforms.map) {
                baseTxrIndex = images.map((image) => image.name).indexOf(material.uniforms.map.name);
            }
        }

        let metalicRoughnessIndex = -1;
        if (material.roughnessMap)
            metalicRoughnessIndex = images.map((image) => image.name).indexOf(material.name + "_orm");

        let normalTextureIndex = -1;
        if (material.normalMap)
            normalTextureIndex = images.map((image) => image.name).indexOf(material.name + "_normal");

        const baseTexture = baseTxrIndex >= 0 ? {
            extensions: {
                KHR_texture_transform: {
                    offset: [0, 0],
                    scale: [1, 1],
                }
            },
            index: baseTxrIndex,
            texCoord: 0, // TODO:
        } :
            undefined;

        const pbrMetallicRoughness = {
            baseColorFactor: baseColor,
            baseColorTexture: baseTexture,
        }

        const metalRoughTexture = metalicRoughnessIndex >= 0 ? {
            index: metalicRoughnessIndex,
            texCoord: 0, // TODO:
        } : undefined

        const normalMapTexture = normalTextureIndex >= 0 ? {
            index: normalTextureIndex,
            texCoord: 0,
        } : undefined;

        if (metalRoughTexture) {
            pbrMetallicRoughness.metallicRoughnessTexture = metalRoughTexture;
        }
        else {
            const metallicFactor = (() => {
                switch (material.type) {
                    case MaterialType.MeshStandardMaterial:
                        return material.metalness;
                    case MaterialType.MeshBasicMaterial:
                        return 0;
                    default:
                        return 0;
                }
            })();
            const roughnessFactor = (() => {
                switch (material.type) {
                    case MaterialType.MeshStandardMaterial:
                        return material.roughness;
                    case MaterialType.MeshBasicMaterial:
                        return 0.9;
                    default:
                        return 0.9;
                }
            })();

            pbrMetallicRoughness.metallicFactor = metallicFactor;
            pbrMetallicRoughness.roughnessFactor = roughnessFactor;
        }

        const parseMaterial = {
            alphaCutoff: material.alphaTest > 0 ? material.alphaTest : undefined,
            alphaMode: material.transparent ?
                "BLEND" : material.alphaTest > 0 ?
                    "MASK" : "OPAQUE",
            doubleSided: material.side === 2,
            extensions: material.type === "ShaderMaterial" ? {
                KHR_materials_unlit: {}, // TODO:
                // VRMC_materials_mtoon
            } : undefined,
            name: material.name,
            pbrMetallicRoughness
        }
        if (normalMapTexture) {
            parseMaterial.normalTexture = normalMapTexture;
        }
        return parseMaterial;
    });
};
const toOutputImages = (images, icon, mimeType) => {
    return (icon ? images.concat(icon) : images)
        .filter((image) => image && image.imageBitmap)
        .map((image) => ({
            bufferView: -1,
            mimeType: mimeType,
            name: image.name, // TODO: 取得できないので仮のテクスチャ名としてマテリアル名を入れた
        }));
};
const toOutputSamplers = (outputImages) => {
    return outputImages.map(() => ({
        magFilter: WEBGL_CONST.LINEAR,
        minFilter: WEBGL_CONST.LINEAR,
        wrapS: WEBGL_CONST.REPEAT,
        wrapT: WEBGL_CONST.REPEAT, // TODO: だいたいこれだった
    }));
};
const toOutputTextures = (outputImages, isktx2) => {
    if (isktx2){
        return outputImages.map((_, index) => ({
            sampler: 0,
            extensions: {
                KHR_texture_basisu: {
                    source: index
                }
            }
        }));
    }
    else{
        return outputImages.map((_, index) => ({
            sampler: 0,
            source: index, // TODO: 全パターンでindexなのか不明
        }));
    }
};
const toOutputScenes = (avatar, outputNodes) => {
    const nodeNames = outputNodes.map((node) => node.name);
    return [
        {
            nodes: avatar.children
                .filter((child) => child.type === VRMObjectType.Object3D ||
                    child.type === VRMObjectType.SkinnedMesh ||
                    child.type === VRMObjectType.Group ||
                    child.type === VRMObjectType.Bone)
                .map((x) => nodeNames.indexOf(x.name)),
        },
    ];
};
const toOutputSecondaryAnimation = (springBone, nodeNames) => {
    return {
        boneGroups: springBone.springBoneGroupList[0] &&
            springBone.springBoneGroupList[0].length > 0
            ? springBone.springBoneGroupList.map((group) => ({
                bones: group.map((e) => nodeNames.indexOf(e.bone.name)),
                center: group[0].center
                    ? nodeNames.indexOf(group[0].center.name) // TODO: nullになっていて実際のデータはわからん
                    : -1,
                colliderGroups: springBone.colliderGroups.map((_, index) => index),
                dragForce: group[0].dragForce,
                gravityDir: {
                    x: group[0].gravityDir.x,
                    y: group[0].gravityDir.y,
                    z: group[0].gravityDir.z, // TODO: それっぽいやつをいれた
                },
                gravityPower: group[0].gravityPower,
                hitRadius: group[0].radius,
                stiffiness: group[0].stiffnessForce, // TODO: それっぽいやつをいれた
            }))
            : [
                {
                    bones: [],
                    center: -1,
                    colliderGroups: [],
                    dragForce: 0.4,
                    gravityDir: {
                        x: 0,
                        y: -1,
                        z: 0,
                    },
                    gravityPower: 0,
                    hitRadius: 0.02,
                    stiffiness: 1,
                },
            ],
        colliderGroups: springBone.colliderGroups.map((group) => ({
            colliders: [
                {
                    offset: {
                        x: group.colliders[0].position.x,
                        y: group.colliders[0].position.y,
                        z: group.colliders[0].position.z,
                    },
                    radius: group.colliders[0].geometry.boundingSphere
                        ? group.colliders[0].geometry.boundingSphere.radius
                        : undefined,
                },
            ],
            node: group.node,
        })),
    };
};