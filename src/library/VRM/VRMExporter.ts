/* eslint-disable @typescript-eslint/ban-ts-comment */
import { VRM, MToonMaterial, VRMSpringBoneManager } from "@pixiv/three-vrm";
import {
  BufferAttribute,
  MeshStandardMaterial,
  MeshBasicMaterial,
  Bone,
  Object3D,
  Scene,
  Group,
} from "three";
import { VRMSkinnedMesh } from "./VRMInterface";
import { ToOutputVRMMeta } from "./VRMMetaUtils";
import {
  OutputSkin,
  OutputBaseTexture,
  OutputMaterial,
  OutputMesh,
  OutputNode,
  OutputAccessor,
  OutputBufferView,
  OutputImage,
  OutputSampler,
  OutputTexture,
  OutputScene,
  OutputVRM,
  OutputSecondaryAnimation,
} from "./OutputVRMInterfaces";

// WebGL(OpenGL)マクロ定数
enum WEBGL_CONST {
  ARRAY_BUFFER = 34962,
  ELEMENT_ARRAY_BUFFER = 34963,
  BYTE = 5120,
  UNSIGNED_BYTE = 5121,
  SHORT = 5122,
  UNSIGNED_SHORT = 5123,
  UNSIGNED_INT = 5125,
  FLOAT = 5126,
  LINEAR = 9729,
  REPEAT = 10497,
}

const BLENDSHAPE_PREFIX = "blend_";
const MORPH_CONTROLLER_PREFIX = "BlendShapeController_";
const SPRINGBONE_COLLIDER_NAME = "vrmColliderSphere";

const EXPORTER_VERSION = "UniVRM-0.64.0";

const CHUNK_TYPE_JSON = "JSON";
const CHUNK_TYPE_BIN = "BIN\x00";
const GLTF_VERSION = 2;
const HEADER_SIZE = 12;

type VRMMaterial = MeshBasicMaterial | MeshStandardMaterial | MToonMaterial;

export default class VRMExporter {
  parse(vrm: VRM, onDone: (buffer: ArrayBuffer) => void): void {
    const scene = vrm.scene;
    const humanoid = vrm.humanoid;
    const vrmMeta = vrm.meta;
    const materials = vrm.materials;
    const blendShapeProxy = vrm.blendShapeProxy;
    const lookAt = vrm.lookAt;
    const springBone = vrm.springBoneManager;

    const exporterInfo = {
      // TODO: データがなくて取得できない
      generator: "UniGLTF-2.0.0",
      version: "2.0",
    };

    // TODO: とりあえず全部ある想定で進める
    if (!scene) {
      throw new Error("scene is undefined or null");
    } else if (!humanoid) {
      throw new Error("humanoid is undefined or null");
    } else if (!vrmMeta) {
      throw new Error("meta is undefined or null");
    } else if (!materials) {
      throw new Error("materials is undefined or null");
    } else if (!blendShapeProxy) {
      throw new Error("blendShapeProxy is undefined or null");
    } else if (!lookAt) {
      throw new Error("lookAt is undefined or null");
    } else if (!springBone) {
      throw new Error("springBone is undefined or null");
    }

    // TODO: name基準で重複除外 これでいいのか？
    const uniqueMaterials = materials
      .filter(
        (material, index, self) =>
          self.findIndex((e) => e.name === material.name) === index
      )
      .map((material) => material as VRMMaterial);
    const uniqueMaterialNames = uniqueMaterials.map(
      (material) => material.name
    );
    const icon: VRMImageData | null = vrmMeta.texture
      ? { name: "icon", imageBitmap: vrmMeta.texture.image }
      : null; // TODO: ない場合もある
    const images: Array<VRMImageData> = uniqueMaterials
      .filter((material) => material.map)
      .map((material) => {
        if (!material.map) throw new Error(material.name + " map is null");
        return { name: material.name, imageBitmap: material.map.image };
      }); // TODO: 画像がないMaterialもある
    const outputImages = toOutputImages(images, icon);
    const outputSamplers = toOutputSamplers(outputImages);
    const outputTextures = toOutputTextures(outputImages);

    const outputMaterials = toOutputMaterials(uniqueMaterials, images);

    const rootNode = scene.children.filter(
      (child) =>
        child.children.length > 0 &&
        child.children[0].type === VRMObjectType.Bone
    )[0];
    const nodes = getNodes(rootNode).filter(
      (node) => node.name !== SPRINGBONE_COLLIDER_NAME
    );
    const nodeNames = nodes.map((node) => node.name);
    const outputNodes: Array<OutputNode> = nodes.map((node) => ({
      children: node.children
        .filter((childNode) => childNode.name !== SPRINGBONE_COLLIDER_NAME)
        .map((childNode) => nodeNames.indexOf(childNode.name)),
      name: node.name,
      rotation: [
        node.quaternion.x,
        node.quaternion.y,
        node.quaternion.z,
        node.quaternion.w,
      ],
      scale: [node.scale.x, node.scale.y, node.scale.z],
      translation: [node.position.x, node.position.y, node.position.z],
    }));

    const outputAccessors: Array<OutputAccessor> = [];

    const meshes = scene.children.filter(
      (child) =>
        child.type === VRMObjectType.Group ||
        child.type === VRMObjectType.SkinnedMesh
    );

    const meshDatas: Array<MeshData> = [];
    meshes.forEach((object) => {
      const mesh = (object.type === VRMObjectType.Group
        ? object.children[0]
        : object) as VRMSkinnedMesh;
      const attributes = mesh.geometry.attributes;
      meshDatas.push(
        new MeshData(
          attributes.position,
          WEBGL_CONST.FLOAT,
          MeshDataType.POSITION,
          AccessorsType.VEC3,
          mesh.name,
          undefined
        )
      );
      meshDatas.push(
        new MeshData(
          attributes.normal,
          WEBGL_CONST.FLOAT,
          MeshDataType.NORMAL,
          AccessorsType.VEC3,
          mesh.name,
          undefined
        )
      );
      meshDatas.push(
        new MeshData(
          attributes.uv,
          WEBGL_CONST.FLOAT,
          MeshDataType.UV,
          AccessorsType.VEC2,
          mesh.name,
          undefined
        )
      );
      meshDatas.push(
        new MeshData(
          attributes.skinWeight,
          WEBGL_CONST.FLOAT,
          MeshDataType.SKIN_WEIGHT,
          AccessorsType.VEC4,
          mesh.name,
          undefined
        )
      );
      meshDatas.push(
        new MeshData(
          attributes.skinIndex,
          WEBGL_CONST.UNSIGNED_SHORT,
          MeshDataType.SKIN_INDEX,
          AccessorsType.VEC4,
          mesh.name,
          undefined
        )
      );

      const subMeshes =
        object.type === VRMObjectType.Group
          ? object.children.map((child) => child as VRMSkinnedMesh)
          : [object as VRMSkinnedMesh];
      subMeshes.forEach((subMesh) => {
        if (!subMesh.geometry.index) {
          throw new Error(subMesh.name + " geometry.index is null");
        }
        meshDatas.push(
          new MeshData(
            subMesh.geometry.index,
            WEBGL_CONST.UNSIGNED_INT,
            MeshDataType.INDEX,
            AccessorsType.SCALAR,
            mesh.name,
            subMesh.name
          )
        );
      });

      // TODO: とりあえずundefiendは例外スロー
      if (!mesh.morphTargetDictionary) {
        mesh.morphTargetDictionary = {};
        mesh.morphTargetInfluences = [];
        mesh.geometry.morphAttributes = {};
        mesh.updateMorphTargets();
        // throw new Error(mesh.name + " morphTargetDictionary is null");
      }
      const morphIndexPair = Object.entries(mesh.morphTargetDictionary);
      if (mesh.geometry.userData.targetNames) {
        mesh.geometry.userData.targetNames.forEach((targetName, index) => {
          const morphIndex = morphIndexPair.filter(
            (pair) => pair[0] === index.toString()
          )[0][1];
          const morphAttribute = mesh.geometry.morphAttributes;
          meshDatas.push(
            new MeshData(
              morphAttribute.position[morphIndex],
              WEBGL_CONST.FLOAT,
              MeshDataType.BLEND_POSITION,
              AccessorsType.VEC3,
              mesh.name,
              BLENDSHAPE_PREFIX + targetName
            )
          );
          meshDatas.push(
            new MeshData(
              morphAttribute.normal[morphIndex],
              WEBGL_CONST.FLOAT,
              MeshDataType.BLEND_NORMAL,
              AccessorsType.VEC3,
              mesh.name,
              BLENDSHAPE_PREFIX + targetName
            )
          );
        });
      }
    });

    // inverseBindMatrices length = 16(matrixの要素数) * 4バイト * ボーン数
    // TODO: とりあえず数合わせでrootNode以外のBoneのmatrixをいれた
    meshes.forEach((object) => {
      const mesh = (object.type === VRMObjectType.Group
        ? object.children[0]
        : object) as VRMSkinnedMesh;
      const inverseBindMatrices = new Float32Array(
        mesh.skeleton.boneInverses.map((boneInv) => boneInv.elements).flat()
      );
      meshDatas.push(
        new MeshData(
          new BufferAttribute(inverseBindMatrices, 16),
          WEBGL_CONST.FLOAT,
          MeshDataType.BIND_MATRIX,
          AccessorsType.MAT4,
          mesh.name,
          mesh.name
        )
      );
    });

    outputAccessors.push(
      ...meshDatas.map((meshData) => ({
        bufferView: -1,
        byteOffset: 0,
        componentType: meshData.valueType,
        count: meshData.attribute.count,
        max: meshData.max,
        min: meshData.min,
        normalized: false,
        type: meshData.accessorsType,
      }))
    );

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
    const secondaryRootNode = scene.children.filter(
      (child) => child.name === "secondary"
    )[0];
    outputNodes.push({
      name: secondaryRootNode.name,
      rotation: [
        secondaryRootNode.quaternion.x,
        secondaryRootNode.quaternion.y,
        secondaryRootNode.quaternion.z,
        secondaryRootNode.quaternion.w,
      ],
      scale: [
        secondaryRootNode.scale.x,
        secondaryRootNode.scale.y,
        secondaryRootNode.scale.z,
      ],
      translation: [
        secondaryRootNode.position.x,
        secondaryRootNode.position.y,
        secondaryRootNode.position.z,
      ],
    });

    const outputSkins = toOutputSkins(meshes, meshDatas, nodeNames);

    // TODO: javascript版の弊害によるエラーなので将来的に実装を変える
    const blendShapeMaster = {
      // @ts-ignore: Unreachable code error
      blendShapeGroups: Object.values(blendShapeProxy._blendShapeGroups).map(
        (blendShape) => ({
          // @ts-ignore: Unreachable code error
          binds: blendShape._binds.map((bind) => ({
            index: bind.morphTargetIndex,
            mesh: outputMeshes
              .map((mesh) => mesh.name)
              .indexOf(bind.meshes[0].name),
            weight: bind.weight * 100,
          })),
          // @ts-ignore: Unreachable code error
          isBinary: blendShape.isBinary,
          // @ts-ignore: Unreachable code error
          materialValues: blendShape._materialValues,
          // @ts-ignore: Unreachable code error
          name: blendShape.name.replace(MORPH_CONTROLLER_PREFIX, ""),
          presetName: Object.entries(
            blendShapeProxy.blendShapePresetMap
          ).filter(
            (x) =>
              // @ts-ignore: Unreachable code error
              x[1] === blendShape.name.replace(MORPH_CONTROLLER_PREFIX, "")
          )[0][0],
        })
      ),
    };

    // TODO: javascript版の弊害によるエラーなので将来的に実装を変える
    // @ts-ignore: Unreachable code error
    lookAt.firstPerson._firstPersonBoneOffset.z *= -1; // TODO:
    const vrmFirstPerson = {
      firstPersonBone: nodeNames.indexOf(
        // @ts-ignore: Unreachable code error
        lookAt.firstPerson._firstPersonBone.name
      ),
      // @ts-ignore: Unreachable code error
      firstPersonBoneOffset: lookAt.firstPerson._firstPersonBoneOffset,
      lookAtHorizontalInner: {
        // @ts-ignore: Unreachable code error
        curve: lookAt.applyer._curveHorizontalInner.curve,
        xRange: radian2Degree(
          // @ts-ignore: Unreachable code error
          lookAt.applyer._curveHorizontalInner.curveXRangeDegree
        ),
        yRange: radian2Degree(
          // @ts-ignore: Unreachable code error
          lookAt.applyer._curveHorizontalInner.curveYRangeDegree
        ),
      },
      lookAtHorizontalOuter: {
        // @ts-ignore: Unreachable code error
        curve: lookAt.applyer._curveHorizontalOuter.curve,
        xRange: radian2Degree(
          // @ts-ignore: Unreachable code error
          lookAt.applyer._curveHorizontalOuter.curveXRangeDegree
        ),
        yRange: radian2Degree(
          // @ts-ignore: Unreachable code error
          lookAt.applyer._curveHorizontalOuter.curveYRangeDegree
        ),
      },
      // @ts-ignore: Unreachable code error
      lookAtTypeName: lookAt.applyer.type,
      lookAtVerticalDown: {
        // @ts-ignore: Unreachable code error
        curve: lookAt.applyer._curveVerticalDown.curve,
        xRange: radian2Degree(
          // @ts-ignore: Unreachable code error
          lookAt.applyer._curveVerticalDown.curveXRangeDegree
        ),
        yRange: radian2Degree(
          // @ts-ignore: Unreachable code error
          lookAt.applyer._curveVerticalDown.curveYRangeDegree
        ),
      },
      lookAtVerticalUp: {
        // @ts-ignore: Unreachable code error
        curve: lookAt.applyer._curveVerticalUp.curve,
        xRange: radian2Degree(
          // @ts-ignore: Unreachable code error
          lookAt.applyer._curveVerticalUp.curveXRangeDegree
        ),
        yRange: radian2Degree(
          // @ts-ignore: Unreachable code error
          lookAt.applyer._curveVerticalUp.curveYRangeDegree
        ),
      },
      meshAnnotations: lookAt.firstPerson.meshAnnotations.map((annotation) => ({
        firstPersonFlag: annotation.firstPersonFlag === 0 ? "Auto" : "", // TODO: 別の数字のとき何になるか
        mesh: outputMeshes
          .map((mesh) => mesh.name)
          .indexOf(
               annotation.primitives[0].name
          ), // TODO: とりあえず対応
      })),
    };

    const vrmHumanoid = {
      armStretch: humanoid.humanDescription.armStretch,
      feetSpacing: humanoid.humanDescription.feetSpacing,
      hasTranslationDoF: humanoid.humanDescription.hasTranslationDoF,
      humanBones: Object.entries(humanoid.humanBones)
        .filter((x) => x[1].length > 0)
        .map((x) => ({
          bone: x[0],
          node: nodeNames.indexOf(x[1][0].node.name),
          useDefaultValues: true, // TODO:
        })),
      legStretch: humanoid.humanDescription.legStretch,
      lowerArmTwist: humanoid.humanDescription.lowerArmTwist,
      lowerLegTwist: humanoid.humanDescription.lowerLegTwist,
      upperArmTwist: humanoid.humanDescription.upperArmTwist,
      upperLegTwist: humanoid.humanDescription.upperLegTwist,
    };

    const materialProperties = materials.map(
      (material) => material.userData.vrmMaterialProperties
    );

    const outputVrmMeta = ToOutputVRMMeta(vrmMeta, icon, outputImages);
    const outputSecondaryAnimation = toOutputSecondaryAnimation(
      springBone,
      nodeNames
    );

    const bufferViews: Array<BufferView> = [];
    bufferViews.push(
      ...images.map((image) => ({
        buffer: imageBitmap2png(image.imageBitmap),
        type: MeshDataType.IMAGE,
      }))
    );
    bufferViews.push(
      ...meshDatas.map((data) => ({ buffer: data.buffer, type: data.type }))
    );
    if (icon)
      bufferViews.push({
        buffer: imageBitmap2png(icon.imageBitmap),
        type: MeshDataType.IMAGE,
      });

    /* png画像として書き出しのテスト
        images.forEach((image, index) => {
            const fileName = "test"+index.toString()+".png";
            const canvas = document.createElement("canvas");
            canvas.width = image.imageBitmap.width;
            canvas.height = image.imageBitmap.height;
            canvas.getContext('2d').drawImage(image.imageBitmap, 0, 0);
            canvas.toBlob((blob) =>{
                console.log(blob);
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                // link.click();
            }, "image/png", 1.0);
        });
        */

    let bufferOffset = 0;
    let imageIndex = 0;
    let accessorIndex = 0;
    const outputBufferViews: Array<OutputBufferView> = bufferViews.map(
      (bufferView, index) => {
        const value = {
          buffer: 0,
          byteLength: bufferView.buffer.byteLength,
          byteOffset: bufferOffset,
          target:
            bufferView.type === MeshDataType.IMAGE ||
            bufferView.type === MeshDataType.BIND_MATRIX
              ? undefined
              : bufferView.type === MeshDataType.INDEX
              ? WEBGL_CONST.ELEMENT_ARRAY_BUFFER
              : WEBGL_CONST.ARRAY_BUFFER, // TODO: だいたいこれだったの　Mesh/indicesだけELEMENT...
        };
        bufferOffset += bufferView.buffer.byteLength;
        if (bufferView.type === MeshDataType.IMAGE) {
          outputImages[imageIndex++].bufferView = index;
        } else {
          outputAccessors[accessorIndex++].bufferView = index;
        }
        return value;
      }
    );

    const outputScenes = toOutputScenes(scene, outputNodes);

    const outputData: OutputVRM = {
      accessors: outputAccessors, // buffer数 - 画像数
      asset: exporterInfo, // TODO:
      buffers: [
        {
          byteLength: bufferOffset,
        },
      ],
      bufferViews: outputBufferViews,
      extensions: {
        VRM: {
          blendShapeMaster: blendShapeMaster,
          exporterVersion: EXPORTER_VERSION,
          firstPerson: vrmFirstPerson,
          humanoid: vrmHumanoid,
          materialProperties: materialProperties,
          meta: outputVrmMeta,
          secondaryAnimation: outputSecondaryAnimation,
          specVersion: "0.0", // TODO:
        },
      },
      extensionsUsed: [
        "KHR_materials_unlit", // TODO:
        "KHR_texture_transform", // TODO:
        "VRMC_materials_mtoon",
        "VRM",
      ],
      images: outputImages,
      materials: outputMaterials,
      meshes: outputMeshes,
      nodes: outputNodes,
      samplers: outputSamplers,
      scene: 0,
      scenes: outputScenes,
      skins: outputSkins,
      textures: outputTextures,
    };

    const jsonChunk = new GlbChunk(
      parseString2Binary(JSON.stringify(outputData, undefined, 2)),
      "JSON"
    );
    const binaryChunk = new GlbChunk(
      concatBinary(bufferViews.map((buf) => buf.buffer)),
      "BIN\x00"
    );
    const fileData = concatBinary([jsonChunk.buffer, binaryChunk.buffer]);
    const header = concatBinary([
      parseString2Binary("glTF"),
      parseNumber2Binary(2, 4),
      parseNumber2Binary(fileData.byteLength + 12, 4),
    ]);
    onDone(concatBinary([header, fileData]));
  }
}

function radian2Degree(radian: number) {
  return radian * (180 / Math.PI);
}

function getNodes(parentNode: Object3D | Bone): Array<Object3D | Bone> {
  if (parentNode.children.length <= 0) return [parentNode];
  return [parentNode].concat(
    parentNode.children.map((child) => getNodes(child)).flat()
  );
}

function imageBitmap2png(image: ImageBitmap) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  canvas.getContext("2d")!.drawImage(image, 0, 0);
  const pngUrl = canvas.toDataURL("image/png");
  const data = atob(pngUrl.split(",")[1]);
  const array = new ArrayBuffer(data.length);
  const view = new DataView(array);
  for (let i = 0; i < data.length; i++) {
    view.setUint8(i, data.charCodeAt(i));
  }
  return array;
}

function parseNumber2Binary(number: number, size: number) {
  const buf = new ArrayBuffer(size);
  const view = new DataView(buf);
  view.setUint32(0, number, true);
  return buf;
}

function parseString2Binary(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer;
}

function concatBinary(arrays: Array<ArrayBuffer>) {
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

function parseBinary(attr: BufferAttribute, componentType: number) {
  const componentTypeSize =
    componentType === WEBGL_CONST.UNSIGNED_SHORT ? 2 : 4;
  const array = attr.array;
  let offset = 0;
  const buf = new ArrayBuffer(attr.count * attr.itemSize * componentTypeSize);
  const view = new DataView(buf);
  for (let i = 0; i < attr.count; i++) {
    for (let a = 0; a < attr.itemSize; a++) {
      let value: number;
      if (attr.itemSize > 4) {
        value = array[i * attr.itemSize + a];
      } else {
        if (a === 0) value = attr.getX(i);
        else if (a === 1) value = attr.getY(i);
        else if (a === 2) value = attr.getZ(i);
        else value = attr.getW(i);
      }

      if (componentType === WEBGL_CONST.UNSIGNED_SHORT) {
        view.setUint16(offset, value, true);
      } else if (componentType === WEBGL_CONST.UNSIGNED_INT) {
        view.setUint32(offset, value, true);
      } else {
        view.setFloat32(offset, value, true);
      }
      offset += componentTypeSize;
    }
  }
  return buf;
}

class GlbChunk {
  data: ArrayBuffer;
  type: string;
  buffer: ArrayBuffer;
  constructor(data: ArrayBuffer, type: string) {
    this.data = data;
    this.type = type;
    const buf = this.data; //, this.type === "JSON" ? 0x20 : 0x00);
    this.buffer = concatBinary([
      parseNumber2Binary(buf.byteLength, 4),
      parseString2Binary(this.type),
      buf,
    ]);
  }

  // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#structured-json-content
  paddingBinary(array: ArrayBuffer, value: number) {
    const paddedLength = Math.ceil(array.byteLength / 4) * 4;
    if (array.byteLength === paddedLength) return array;
    const paddedArray = new Uint8Array(paddedLength);
    paddedArray.set(new Uint8Array(array), 0);
    for (let i = array.byteLength; i < paddedLength; i++) {
      paddedArray.set(new Uint8Array(value), i);
    }
    return paddedArray.buffer;
  }
}

export class MeshData {
  attribute: BufferAttribute;
  valueType: number;
  type: MeshDataType;
  accessorsType: AccessorsType;
  meshName: string;
  name: string | undefined;
  buffer: ArrayBuffer;
  max: [number, number, number] | undefined;
  min: [number, number, number] | undefined;
  constructor(
    attribute: BufferAttribute,
    valueType: number,
    type: MeshDataType,
    accessorsType: AccessorsType,
    meshName: string,
    name: string | undefined
  ) {
    this.attribute = attribute;
    this.type = type;
    this.valueType = valueType;
    this.accessorsType = accessorsType;
    this.meshName = meshName;
    this.name = name;
    this.buffer = parseBinary(this.attribute, this.valueType);
    this.max =
      type === MeshDataType.POSITION || type === MeshDataType.BLEND_POSITION
        ? [
            Math.max.apply(
              null,
              Array.from(this.attribute.array).filter((_, i) => i % 3 === 0)
            ),
            Math.max.apply(
              null,
              Array.from(this.attribute.array).filter((_, i) => i % 3 === 1)
            ),
            Math.max.apply(
              null,
              Array.from(this.attribute.array).filter((_, i) => i % 3 === 2)
            ),
          ]
        : undefined;
    this.min =
      type === MeshDataType.POSITION || type === MeshDataType.BLEND_POSITION
        ? [
            Math.min.apply(
              null,
              Array.from(this.attribute.array).filter((_, i) => i % 3 === 0)
            ),
            Math.min.apply(
              null,
              Array.from(this.attribute.array).filter((_, i) => i % 3 === 1)
            ),
            Math.min.apply(
              null,
              Array.from(this.attribute.array).filter((_, i) => i % 3 === 2)
            ),
          ]
        : undefined;
  }
}

enum MaterialType {
  MeshBasicMaterial = "MeshBasicMaterial",
  MeshStandardMaterial = "MeshStandardMaterial",
  MToonMaterial = "MToonMaterial",
}

enum AccessorsType {
  SCALAR = "SCALAR", // 1
  VEC2 = "VEC2", // 2
  VEC3 = "VEC3", // 3
  VEC4 = "VEC4", // 4
  MAT4 = "MAT4", // 16
}

enum MeshDataType {
  POSITION = "POSITION",
  NORMAL = "NORMAL",
  UV = "UV",
  INDEX = "INDEX",
  SKIN_WEIGHT = "SKIN_WEIGHT",
  SKIN_INDEX = "SKIN_INDEX",
  BLEND_POSITION = "BLEND_POSITION",
  BLEND_NORMAL = "BLEND_NORMAL",
  BIND_MATRIX = "BIND_MATRIX",
  IMAGE = "IMAGE",
}

enum VRMObjectType {
  Group = "Group",
  SkinnedMesh = "SkinnedMesh",
  Object3D = "Object3D",
  Bone = "Bone",
}

export interface VRMImageData {
  name: string;
  imageBitmap: ImageBitmap;
}

interface BufferView {
  buffer: ArrayBuffer;
  type: MeshDataType;
}

const toOutputMeshes = (
  meshes: Array<Object3D>,
  meshDatas: Array<MeshData>,
  uniqueMaterialNames: Array<string>
): Array<OutputMesh> => {
  return meshes.map((object) => {
    const mesh = (object.type === VRMObjectType.Group
      ? object.children[0]
      : object) as VRMSkinnedMesh;
    const subMeshes =
      object.type === VRMObjectType.Group
        ? object.children.map((child) => child as VRMSkinnedMesh)
        : [object as VRMSkinnedMesh];
    return {
      // extras: {
      //   targetNames: mesh.geometry.userData.targetNames,
      // },
      name: object.name, // TODO: なんか違う名前になっている
      primitives: subMeshes.map((subMesh) => {
        const meshTypes = meshDatas.map((data) =>
          data.meshName === mesh.name ? data.type : null
        );
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
            .map((data) =>
              data.type === MeshDataType.INDEX && data.meshName === mesh.name
                ? data.name
                : null
            )
            .indexOf(subMesh.name),
          material: uniqueMaterialNames.indexOf(materialName),
          mode: 4, // TRIANGLES
          targets: mesh.geometry.userData.targetNames
            ? mesh.geometry.userData.targetNames.map((targetName) => ({
                NORMAL: meshDatas
                  .map((data) =>
                    data.type === MeshDataType.BLEND_NORMAL &&
                    data.meshName === mesh.name
                      ? data.name
                      : null
                  )
                  .indexOf(BLENDSHAPE_PREFIX + targetName),
                POSITION: meshDatas
                  .map((data) =>
                    data.type === MeshDataType.BLEND_POSITION &&
                    data.meshName === mesh.name
                      ? data.name
                      : null
                  )
                  .indexOf(BLENDSHAPE_PREFIX + targetName),
              }))
            : undefined,
        };
      }),
    };
  });
};

const toOutputSkins = (
  meshes: Array<Object3D>,
  meshDatas: Array<MeshData>,
  nodeNames: Array<string>
): Array<OutputSkin> => {
  return meshes.map((object) => {
    const mesh = (object.type === VRMObjectType.Group
      ? object.children[0]
      : object) as VRMSkinnedMesh;
    return {
      inverseBindMatrices: meshDatas
        .map((data) =>
          data.type === MeshDataType.BIND_MATRIX ? data.meshName : null
        )
        .indexOf(mesh.name),
      joints: mesh.skeleton.bones.map((bone) => nodeNames.indexOf(bone.name)),
      skeleton: nodeNames.indexOf(mesh.skeleton.bones[0].name),
    };
  });
};

const toOutputMaterials = (
  uniqueMaterials: Array<VRMMaterial>,
  images: Array<VRMImageData>
): Array<OutputMaterial> => {
  return uniqueMaterials.map((material) => {
    let baseColor: [number, number, number, number] | undefined;
    if (material.type === MaterialType.MToonMaterial) {
      const mtoonMaterial = material as MToonMaterial;
      baseColor = mtoonMaterial.color
        ? [
            mtoonMaterial.color.x,
            mtoonMaterial.color.y,
            mtoonMaterial.color.z,
            mtoonMaterial.color.w,
          ]
        : undefined;
    } else {
      const otherMaterial = material as
        | MeshBasicMaterial
        | MeshStandardMaterial;
      baseColor = otherMaterial.color
        ? [
            otherMaterial.color.r,
            otherMaterial.color.g,
            otherMaterial.color.b,
            1, // TODO:
          ]
        : undefined;
    }
    const baseTexture: OutputBaseTexture | undefined = material.map
      ? {
          extensions: {
            KHR_texture_transform: {
              offset: [0, 0],
              scale: [1, 1],
            },
          },
          index: images.map((image) => image.name).indexOf(material.name), // TODO: ImageDataにいれたMaterial名で対応付け
          texCoord: 0, // TODO:
        }
      : undefined;
    const metallicFactor = (() => {
      switch (material.type) {
        case MaterialType.MeshStandardMaterial:
          return (material as MeshStandardMaterial).metalness;
        case MaterialType.MeshBasicMaterial:
          return 0;
        default:
          return 0.5;
      }
    })();

    const roughnessFactor = (() => {
      switch (material.type) {
        case MaterialType.MeshStandardMaterial:
          return (material as MeshStandardMaterial).roughness;
        case MaterialType.MeshBasicMaterial:
          return 0.9;
        default:
          return 0.5;
      }
    })();

    return {
      alphaCutoff: material.alphaTest > 0 ? material.alphaTest : undefined,
      alphaMode: material.transparent
        ? "BLEND"
        : material.alphaTest > 0
        ? "MASK"
        : "OPAQUE",
      doubleSided: material.side === 2, // 両面描画であれば2になっている
      extensions:
        material.type === MaterialType.MeshBasicMaterial
          ? {
              KHR_materials_unlit: {}, // TODO:
            }
          : undefined,
      name: material.name,
      pbrMetallicRoughness: {
        baseColorFactor: baseColor,
        baseColorTexture: baseTexture,
        metallicFactor: metallicFactor,
        roughnessFactor: roughnessFactor,
      },
    };
  });
};

const toOutputImages = (
  images: Array<VRMImageData>,
  icon: VRMImageData | null
): Array<OutputImage> => {
  return (icon ? images.concat(icon) : images)
    .filter((image) => image && image.imageBitmap)
    .map((image) => ({
      bufferView: -1,
      mimeType: "image/png", // TODO: とりあえずpngをいれた
      name: image.name, // TODO: 取得できないので仮のテクスチャ名としてマテリアル名を入れた
    }));
};

const toOutputSamplers = (
  outputImages: Array<OutputImage>
): Array<OutputSampler> => {
  return outputImages.map(() => ({
    magFilter: WEBGL_CONST.LINEAR, // TODO: だいたいこれだった
    minFilter: WEBGL_CONST.LINEAR, // TODO: だいたいこれだった
    wrapS: WEBGL_CONST.REPEAT, // TODO: だいたいこれだったからとりあえず直打ちした
    wrapT: WEBGL_CONST.REPEAT, // TODO: だいたいこれだった
  }));
};

const toOutputTextures = (
  outputImages: Array<OutputImage>
): Array<OutputTexture> => {
  return outputImages.map((_, index) => ({
    sampler: 0, // TODO: 全パターンでindexなのか不明
    source: index, // TODO: 全パターンでindexなのか不明
  }));
};

const toOutputScenes = (
  scene: Scene | Group,
  outputNodes: Array<OutputNode>
): Array<OutputScene> => {
  const nodeNames = outputNodes.map((node) => node.name);
  return [
    {
      nodes: scene.children
        .filter(
          (child) =>
            child.type === VRMObjectType.Object3D ||
            child.type === VRMObjectType.SkinnedMesh ||
            child.type === VRMObjectType.Group ||
            child.type === VRMObjectType.Bone
        )
        .map((x) => nodeNames.indexOf(x.name)),
    },
  ];
};

const toOutputSecondaryAnimation = (
  springBone: VRMSpringBoneManager,
  nodeNames: Array<string>
): OutputSecondaryAnimation => {
  return {
    boneGroups:
      springBone.springBoneGroupList[0] &&
      springBone.springBoneGroupList[0].length > 0
        ? springBone.springBoneGroupList.map((group) => ({
            bones: group.map((e) => nodeNames.indexOf(e.bone.name)), // TODO: indexが入っているが4つあるのに対して2つしか入っていない
            center: group[0].center
              ? nodeNames.indexOf(group[0].center.name) // TODO: nullになっていて実際のデータはわからん
              : -1,
            colliderGroups: springBone.colliderGroups.map((_, index) => index), // TODO: とりあえずindex
            dragForce: group[0].dragForce, // TODO: それっぽいやつをいれた
            gravityDir: {
              x: group[0].gravityDir.x, // TODO: それっぽいやつをいれた
              y: group[0].gravityDir.y, // TODO: それっぽいやつをいれた
              z: group[0].gravityDir.z, // TODO: それっぽいやつをいれた
            },
            gravityPower: group[0].gravityPower, // TODO: それっぽいやつをいれた
            hitRadius: group[0].radius, // TODO: それっぽいやつをいれた
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
          ], // TODO: 2重に書いてしまった
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
