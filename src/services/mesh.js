import axios from "axios";
export const meshService = {
    initialLoad,
    setMeshType,
    setPose,
    setStand,
    updateMesh,
    getMeshType,
    setDefaultBoneRotations,
    getBoneRotation,
};
async function initialLoad(bones) {
    await axios.get("models/poses/default.json").then((res) => {
        window.loadDefaultMeshes(bones, res.data);
        return res.data;
    });
}
async function setMeshType(meshType) {
    if (meshType) {
        window.selectedMesh(meshType);
    }
}
async function setPose(selection, bones) {
    if (selection) {
        let poseData;
        await axios.get("models/poses/" + selection.file + ".json").then((res) => {
            poseData = res.data;
            window.loadPose(poseData, bones);
            return poseData;
        });
    }
}
async function setStand(selection) {
    if (selection) {
        window.changeStand(selection.file);
    }
}
async function updateMesh(category, selection, isLeft, bones, pose) {
    window.changeMesh(category, selection, isLeft, bones, pose);
}
async function getBoneRotation(bone) {
    return await window.getRotation(bone);
}
async function setDefaultBoneRotations() {
    const dbRotations = {
        Torso_Hip: window.getRotation("Torso_Hip"),
        Torso_Spine: window.getRotation("Torso_Spine"),
        Torso_Chest: window.getRotation("Torso_Chest"),
        Torso_Neck: window.getRotation("Torso_Neck"),
        Torso_Sholder_L: window.getRotation("Torso_Sholder_L"),
        Torso_UpperArm_L: window.getRotation("Torso_UpperArm_L"),
        ArmL_LowerArm_L: window.getRotation("ArmL_LowerArm_L"),
        ArmL_Hand_L: window.getRotation("ArmL_Hand_L"),
        Torso_Sholder_R: window.getRotation("Torso_Sholder_R"),
        Torso_UpperArm_R: window.getRotation("Torso_UpperArm_R"),
        ArmR_LowerArm_R: window.getRotation("ArmR_LowerArm_R"),
        ArmR_Hand_R: window.getRotation("ArmR_Hand_R"),
        Torso_UpperLeg_L: window.getRotation("Torso_UpperLeg_L"),
        LegL_LowerLeg_L: window.getRotation("LegL_LowerLeg_L"),
        LegL_Foot_L: window.getRotation("LegL_Foot_L"),
        Torso_UpperLeg_R: window.getRotation("Torso_UpperLeg_R"),
        LegR_LowerLeg_R: window.getRotation("LegR_LowerLeg_R"),
        LegR_Foot_R: window.getRotation("LegR_Foot_R"),
    };
    return dbRotations;
}
async function getMeshType(category, isLeft) {
    let MeshType;
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
