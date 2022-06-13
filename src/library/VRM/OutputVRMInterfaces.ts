type Vector2 = [number, number];
type Vector3 = [number, number, number];
type Vector4 = [number, number, number, number];

export interface OutputVRM {
  accessors: Array<OutputAccessor>;
  asset: OutputExporterInfo;
  buffers: [
    {
      byteLength: number;
    }
  ];
  bufferViews: Array<OutputBufferView>;
  extensions: {
    VRM: OutputVRMExtension;
  };
  extensionsUsed: Array<string>;
  images: Array<OutputImage>;
  materials: Array<OutputMaterial>;
  meshes: Array<OutputMesh>;
  nodes: Array<OutputNode>;
  samplers: Array<OutputSampler>;
  scene: number;
  scenes: Array<OutputScene>;
  skins: Array<OutputSkin>;
  textures: Array<OutputTexture>;
}

export interface OutputExporterInfo {
  generator: string;
  version: string;
}

export interface OutputAccessor {
  bufferView: number;
  byteOffset: number;
  componentType: number;
  count: number;
  max: Vector3 | undefined;
  min: Vector3 | undefined;
  normalized: boolean;
  type: string;
}

export interface OutputBufferView {
  buffer: number;
  byteLength: number;
  byteOffset: number;
  target?: number | undefined;
}

export interface OutputImage {
  bufferView: number;
  mimeType: string;
  name: string;
}

export interface OutputMaterial {
  alphaCutoff?: number | undefined;
  alphaMode: string;
  doubleSided: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  extensions?: { KHR_materials_unlit: {} } | undefined;
  name: string;
  pbrMetallicRoughness: {
    baseColorFactor?: Vector4 | undefined;
    baseColorTexture?: OutputBaseTexture | undefined;
    metallicFactor: number;
    roughnessFactor: number;
  };
}

export interface OutputBaseTexture {
  extensions: {
    KHR_texture_transform: {
      offset: Vector2;
      scale: Vector2;
    };
  };
  index: number;
  texCoord: number;
}

export interface OutputMesh {
  extras: {
    targetNames: Array<string>;
  };
  name: string;
  primitives: Array<OutputPrimitive>;
}

export interface OutputPrimitive {
  attributes: {
    JOINTS_0: number;
    NORMAL: number;
    POSITION: number;
    TEXCOORD_0: number;
    WEIGHTS_0: number;
  };
  extras: {
    targetNames: Array<string>;
  };
  indices: number;
  material: number;
  mode: number;
  targets?:
    | Array<{
        NORMAL: number;
        POSITION: number;
      }>
    | undefined;
}

export interface OutputNode {
  children?: Array<number> | undefined;
  skin?: number | undefined;
  mesh?: number | undefined;
  name: string;
  rotation: Vector4;
  scale: Vector3;
  translation: Vector3;
}

export interface OutputSampler {
  magFilter: number;
  minFilter: number;
  wrapS: number;
  wrapT: number;
}

export interface OutputScene {
  nodes: Array<number>;
}

export interface OutputSkin {
  inverseBindMatrices: number;
  joints: Array<number>;
  skeleton: number;
}

export interface OutputTexture {
  sampler: number;
  source: number;
}

export interface OutputVRMExtension {
  blendShapeMaster: OutputBlendShapeMaster;
  exporterVersion: string;
  firstPerson: OutputFirstPerson;
  humanoid: OutputHumanoid;
  materialProperties: Array<OutputMaterialProperty>;
  meta: OutputVRMMeta;
  secondaryAnimation: OutputSecondaryAnimation;
  specVersion: string; // TODO: numberかもしれない
}

export interface OutputBlendShapeMaster {
  blendShapeGroups: Array<OutputBlendShapeGroup>;
}

export interface OutputBlendShapeGroup {
  binds: [];
  isBinary: boolean;
  materialValues: [];
  name: string;
  presetName: string;
}

export interface OutputFirstPerson {
  firstPersonBone: number;
  firstPersonBoneOffset: {
    x: number;
    y: number;
    z: number;
  };
  lookAtHorizontalInner: LookAt;
  lookAtHorizontalOuter: LookAt;
  lookAtTypeName: string;
  lookAtVerticalDown: LookAt;
  lookAtVerticalUp: LookAt;
  meshAnnotations: Array<{
    firstPersonFlag: string;
    mesh: number;
  }>;
}

interface LookAt {
  curve: Array<number>;
  xRange: number;
  yRange: number;
}

export interface OutputHumanoid {
  armStretch?: number | undefined;
  feetSpacing?: number | undefined;
  hasTranslationDoF?: boolean | undefined;
  humanBones: Array<{
    bone: string;
    node: number;
    useDefaultValues: boolean;
  }>;
  legStretch?: number | undefined;
  lowerArmTwist?: number | undefined;
  lowerLegTwist?: number | undefined;
  upperArmTwist?: number | undefined;
  upperLegTwist?: number | undefined;
}

export interface OutputMaterialProperty {
  // eslint-disable-next-line @typescript-eslint/ban-types
  floatProperties: {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  keywordMap: {};
  name: string;
  renderQueue: number;
  shader: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  tagMap: {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  textureProperties: {};
  // eslint-disable-next-line @typescript-eslint/ban-types
  vectorProperties: {};
}

export interface OutputVRMMeta {
  allowedUserName?: string | undefined;
  author?: string | undefined;
  commercialUssageName?: string | undefined;
  contactInformation?: string | undefined;
  licenseName?: string | undefined;
  otherLicenseUrl?: string | undefined;
  otherPermissionUrl?: string | undefined;
  reference?: string | undefined;
  sexualUssageName?: string | undefined;
  texture?: number | undefined;
  title?: string | undefined;
  version?: string | undefined;
  violentUssageName?: string | undefined;
}

export interface OutputSecondaryAnimation {
  boneGroups: Array<OutputBoneGroup>;
  colliderGroups: Array<OutputColliderGroup>;
}

export interface OutputBoneGroup {
  bones: Array<number>;
  center: number;
  colliderGroups: Array<number>;
  dragForce: number;
  gravityDir: {
    x: number;
    y: number;
    z: number;
  };
  gravityPower: number;
  hitRadius: number;
  stiffiness: number;
}

export interface OutputColliderGroup {
  colliders: Array<{
    offset: {
      x: number;
      y: number;
      z: number;
    };
    radius?: number | undefined;
  }>;
  node: number;
}