export const meshService = {
  setMeshType,
  // setPose,
  setStand,
  updateMesh,
  getMeshType,
  setDefaultBoneRotations,
  getBoneRotation,
};

async function setMeshType(meshType: any) {
  if (meshType) {
    (window as any).selectedMesh(meshType);
  }
}

// async function setPose(selection: any, bones: any) {
//   if (selection) {
//     let poseData: any;
//     await axios.get("models/poses/" + selection.file + ".json").then((res) => {
//       poseData = res.data;
//       (window as any).loadPose(poseData, bones);
//       return poseData;
//     });
//   }
// }

async function setStand(selection: any) {
  if (selection) {
    (window as any).changeStand(selection.file);
  }
}

async function updateMesh(
  category: any,
  selection: any,
  isLeft: any,
  bones: any,
  pose: any
) {
  (window as any).changeMesh(category, selection, isLeft, bones, pose);
}

async function getBoneRotation(bone: any) {
  return await (window as any).getRotation(bone);
}

async function setDefaultBoneRotations() {
  const dbRotations = {
    Torso_Hip: (window as any).getRotation("Torso_Hip"),
    Torso_Spine: (window as any).getRotation("Torso_Spine"),
    Torso_Chest: (window as any).getRotation("Torso_Chest"),
    Torso_Neck: (window as any).getRotation("Torso_Neck"),
    Torso_Sholder_L: (window as any).getRotation("Torso_Sholder_L"),
    Torso_UpperArm_L: (window as any).getRotation("Torso_UpperArm_L"),
    ArmL_LowerArm_L: (window as any).getRotation("ArmL_LowerArm_L"),
    ArmL_Hand_L: (window as any).getRotation("ArmL_Hand_L"),
    Torso_Sholder_R: (window as any).getRotation("Torso_Sholder_R"),
    Torso_UpperArm_R: (window as any).getRotation("Torso_UpperArm_R"),
    ArmR_LowerArm_R: (window as any).getRotation("ArmR_LowerArm_R"),
    ArmR_Hand_R: (window as any).getRotation("ArmR_Hand_R"),
    Torso_UpperLeg_L: (window as any).getRotation("Torso_UpperLeg_L"),
    LegL_LowerLeg_L: (window as any).getRotation("LegL_LowerLeg_L"),
    LegL_Foot_L: (window as any).getRotation("LegL_Foot_L"),
    Torso_UpperLeg_R: (window as any).getRotation("Torso_UpperLeg_R"),
    LegR_LowerLeg_R: (window as any).getRotation("LegR_LowerLeg_R"),
    LegR_Foot_R: (window as any).getRotation("LegR_Foot_R"),
  };

  return dbRotations;
}

async function getMeshType(category: any, isLeft: any) {
  let MeshType: any;
  switch (category) {
    case "head":
      MeshType = "Head";
      break;
    case "hand":
      MeshType = isLeft ? "HandL" : "HandR";
      break;
    case "arm":
      MeshType = isLeft ? "ArmL" : "ArmR";
      break;
    case "torso":
      MeshType = "Torso";
      break;
    case "foot":
      MeshType = isLeft ? "FootL" : "FootR";
      break;
    case "leg":
      MeshType = isLeft ? "LegL" : "LegR";
      break;
    case "pose":
      MeshType = "pose";
      break;
    case "stand":
      MeshType = "Stand";
      break;
    default:
      MeshType = undefined;
  }
  return MeshType;
}
