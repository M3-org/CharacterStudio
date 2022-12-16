import { VRM } from "@pixiv/three-vrm"

export function renameMecanimBones(vrm){
    //const boneArr:Array <string> = [];

    const renArr = [
        'spine', 'mixamorigSpine',
        'chest', 'mixamorigSpine1',
        'upperChest', 'mixamorigSpine2',
        'neck', 'mixamorigNeck',
        'head', 'mixamorigHead',
        'hips', 'mixamorigHips',

        'leftEye', 'mixamorigLeftEye',

        'leftShoulder', 'mixamorigLeftShoulder',
        'leftUpperArm', 'mixamorigLeftArm',
        'leftLowerArm', 'mixamorigLeftForeArm',
        'leftHand', 'mixamorigLeftHand',

        'leftUpperLeg', 'mixamorigLeftUpLeg',
        'leftLowerLeg', 'mixamorigLeftLeg',
        'leftFoot', 'mixamorigLeftFoot',
        'leftToes', 'mixamorigLeftToeBase',

        'leftIndexDistal', 'mixamorigLeftHandIndex3',
        'leftIndexIntermediate', 'mixamorigLeftHandIndex2',
        'leftIndexProximal', 'mixamorigLeftHandIndex1',

        'leftLittleDistal', 'mixamorigLeftHandPinky3',
        'leftLittleIntermediate', 'mixamorigLeftHandPinky2',
        'leftLittleProximal', 'mixamorigLeftHandPinky1',

        'leftMiddleDistal', 'mixamorigLeftHandMiddle3',
        'leftMiddleIntermediate', 'mixamorigLeftHandMiddle2',
        'leftMiddleProximal', 'mixamorigLeftHandMiddle1',

        'leftRingDistal', 'mixamorigLeftHandRing3',
        'leftRingIntermediate', 'mixamorigLeftHandRing2',
        'leftRingProximal', 'mixamorigLeftHandRing1',

        'leftThumbDistal', 'mixamorigLeftHandThumb3',
        'leftThumbMetacarpal', 'mixamorigLeftHandThumb2',
        'leftThumbProximal', 'mixamorigLeftHandThumb1',


        'rightEye', 'mixamorigRightEye',

        'rightShoulder', 'mixamorigRightShoulder',
        'rightUpperArm', 'mixamorigRightArm',
        'rightLowerArm', 'mixamorigRightForeArm',
        'rightHand', 'mixamorigRightHand',

        'rightUpperLeg', 'mixamorigRightUpLeg',
        'rightLowerLeg', 'mixamorigRightLeg',
        'rightFoot', 'mixamorigRightFoot',
        'rightToes', 'mixamorigRightToeBase',

        'rightIndexDistal', 'mixamorigRightHandIndex3',
        'rightIndexIntermediate', 'mixamorigRightHandIndex2',
        'rightIndexProximal', 'mixamorigRightHandIndex1',

        'rightLittleDistal', 'mixamorigRightHandPinky3',
        'rightLittleIntermediate', 'mixamorigRightHandPinky2',
        'rightLittleProximal', 'mixamorigRightHandPinky1',

        'rightMiddleDistal', 'mixamorigRightHandMiddle3',
        'rightMiddleIntermediate', 'mixamorigRightHandMiddle2',
        'rightMiddleProximal', 'mixamorigRightHandMiddle1',

        'rightRingDistal', 'mixamorigRightHandRing3',
        'rightRingIntermediate', 'mixamorigRightHandRing2',
        'rightRingProximal', 'mixamorigRightHandRing1',

        'rightThumbDistal', 'mixamorigRightHandThumb3',
        'rightThumbMetacarpal', 'mixamorigRightHandThumb2',
        'rightThumbProximal', 'mixamorigRightHandThumb1'

    ]

    const bones = vrm.firstPerson.humanoid.humanBones;
    for (let i =0;i< renArr.length;i+=2){
        const bone = bones[renArr[i]];
        if (bone){
            bone.node.name = renArr[i+1];
        }
    }
}