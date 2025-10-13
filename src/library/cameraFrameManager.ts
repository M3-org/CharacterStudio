import * as THREE from 'three'
import { Vector3 } from 'three';

const localVector = new THREE.Vector3()
type boneName = 'head' | 'neck' | 'chest' | 'hips' | 'spine' | 'leftUpperLeg' | 'leftLowerLeg' | 'leftFoot' | 'rightUpperLeg' | 'rightLowerLeg' | 'rightFoot'

/**
 *  @typedef {import('@pixiv/three-vrm').VRM} VRM
 *  @typedef {import('three')} THREE
 */

/**
 * Handles camera framing for different shot types.
 */
export default class CameraFrameManager {

  frameOffset: { min: number; max: number; }= {
    min: 0.2,
    max: 0.2,
  };

  boneOffsets: Record<boneName, { min: THREE.Vector3; max: THREE.Vector3; } | null>

  cameraDir = new THREE.Vector3()
  

  constructor(public camera:THREE.PerspectiveCamera) {
    this.camera = camera|| new THREE.PerspectiveCamera()


    this.boneOffsets = {
      head: null,
      neck: null,
      chest: null,
      hips: null,
      spine: null,
      leftUpperLeg: null,
      leftLowerLeg: null,
      leftFoot: null,
      rightUpperLeg: null,
      rightLowerLeg: null,
      rightFoot: null,
    }
  }

  setupCamera(cameraPosition: Vector3, lookAtPosition: Vector3, fieldOfView: number = 30) {
    this.camera.position.copy(cameraPosition)
    this.camera.lookAt(lookAtPosition)
    this.camera.fov = fieldOfView
  }

  /**
   * @param {THREE.Object3D} object
   * @param {number} minWeight 
   */
  async calculateBoneOffsets(object: THREE.Object3D, minWeight: number) {
    for (const boneName in this.boneOffsets) {
      // Use await to wait for the promise to resolve
      const result = await this._getMinMaxOffsetByBone(object, boneName as boneName, minWeight)
      console.log('result', result)
      // Store the result in the boneOffsets property
      this.boneOffsets[boneName as boneName] = result
    }
  }


  frameTarget: THREE.Object3D | null = null
  
  setFrameTarget(object:THREE.Object3D){
    this.frameTarget = object;
  }

  frameCloseupShot() {
    this.frameShot( 'head', 'head')
  }

  frameMediumShot() {
    this.frameShot( 'chest', 'head')
  }

  frameCowboyShot() {
    this.frameShot( 'hips', 'head')
  }

  frameFullShot() {
    this.frameShot('leftFoot', 'head')
  }
  /**
   * 
   * @param {string} minBoneName 
   * @param {string} maxBoneName 
   * @param {THREE.Vector3|null} cameraPosition 
   * @param {boolean} minGetsMaxVertex 
   * @param {boolean} maxGetsMaxVertex 
   */
  frameShot( minBoneName: boneName, maxBoneName: boneName, cameraPosition: Vector3 | null = null, minGetsMaxVertex: boolean = false, maxGetsMaxVertex: boolean = true) {
    if(!this.frameTarget){
        console.error("No target object provided, Call setFrameTarget() first;")
        return;
    }
    const min = this._getBoneWorldPositionWithOffset(this.frameTarget, minBoneName, minGetsMaxVertex)
    const max = this._getBoneWorldPositionWithOffset(this.frameTarget, maxBoneName, maxGetsMaxVertex)
    min.y -= this.frameOffset.max
    max.y += this.frameOffset.min

    cameraPosition = cameraPosition || new THREE.Vector3(0, 0, 0)

    this.positionCameraBetweenPoints(min, max, cameraPosition)
  }
  /**
   * 
   * @param {number} min 
   */
  setBottomFrameOffset(min:number) {
    this.frameOffset.min = min
  }
    /**
     *  
     * @param {number} max
     *  
     * */
  setTopFrameOffset(max:number) {
    this.frameOffset.max = max
  }
  /**
   *
   */
  _getBoneWorldPositionWithOffset(targetObject: THREE.Object3D,boneName: boneName, getMax: boolean) {
    const bone = this._getFirstBoneWithName( boneName,targetObject)
    if (!bone || !this.boneOffsets[boneName]) {
      console.error(`Bone with name '${boneName}' not found in the model.`)
      return new THREE.Vector3()
    }
    const boneWorldPosition = new THREE.Vector3()
    bone.getWorldPosition(boneWorldPosition)

    const offset = getMax ? this.boneOffsets[boneName].max : this.boneOffsets[boneName].min
    boneWorldPosition.y += offset.y

    return boneWorldPosition
  }

  _getFirstBoneWithName(boneName: boneName,targetObject: THREE.Object3D | undefined=undefined):THREE.Bone|null {
    /**
     * @type {Bone | null}
     */
    let resultBone= null
    const target= targetObject||this.frameTarget
    if(!target){
        console.error("_getFirstBoneWithName: No target object provided, Call setFrameTarget() first or provide a targetObject parameter;")
        return null;
    }
    target.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh) {
        if (!child.geometry) {
          console.error('Invalid skinned mesh found in children.')
          return
        }

        const boneIndex = child.skeleton.bones.findIndex((bone) => bone.name === boneName)

        if (boneIndex !== -1) {
          resultBone = child.skeleton.bones[boneIndex]
          // Break out of the loop since we found the bone
          return
        }
      }
    })
    return resultBone
  }
/**
 * 
 * @param {THREE.Object3D} parent
 * @param {string} boneName 
 * @param {number} minWeight 
 * @returns 
 */
  async _getMinMaxOffsetByBone(parent: THREE.Object3D, boneName: boneName, minWeight: number) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<{ min: Vector3, max: Vector3 }>( async (resolve, reject) => {
      // Ensure parent is valid
      if (!parent || !parent.traverse) {
        console.error('Invalid parent object provided.')
        reject(null)
      }

      // Initialize min and max offset vectors
      const minOffset = new THREE.Vector3(Infinity, Infinity, Infinity)
      const maxOffset = new THREE.Vector3(-Infinity, -Infinity, -Infinity)

      const prevPos: any[] = []
      parent.traverse(async (child) => {
        if (child instanceof THREE.SkinnedMesh) {
          prevPos.push(this._saveBonesPos(child.skeleton))
          child.skeleton.pose()
        }
      })
      let prevPosCount = 0

      const delay = (ms:number) => new Promise((res) => setTimeout(res, ms))
      await delay(10)
      // Traverse all children of the parent
      parent.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh) {
          // Ensure each THREE.SkinnedMesh has geometry
          if (!child.geometry) {
            console.error('Invalid skinned mesh found in children.')
            return
          }

          // Find the index of the bone by name
          const boneIndex = child.skeleton.bones.findIndex((bone) => bone.name === boneName)

          // Check if the bone with the given name exists
          if (boneIndex === -1) {
            console.error(`Bone with name '${boneName}' not found in one of the skinned meshes.`)
            return
          }

          const positionAttribute = child.geometry.getAttribute('position')
          const skinWeightAttribute = child.geometry.getAttribute('skinWeight')
          const skinIndexAttribute = child.geometry.getAttribute('skinIndex')

          // Iterate through each vertex
          for (let i = 0; i < positionAttribute.count; i++) {
            const worldVertex = new THREE.Vector3().fromBufferAttribute(positionAttribute, i).applyMatrix4(child.matrixWorld)

            // Check the influence of the bone on the vertex
            const skinIndex = skinIndexAttribute.getX(i)

            if (skinIndex === boneIndex) {
              // Get the weight of the bone influence
              const influence = skinWeightAttribute.getX(i)

              // If the influence is above the minimum weight
              if (influence >= minWeight) {
                // Calculate offset from the bone's position difference
                const bone = child.skeleton.bones[boneIndex]
                const bonePosition = new THREE.Vector3().setFromMatrixPosition(bone.matrixWorld)
                const offset = worldVertex.clone().sub(bonePosition)

                // Update min and max offset vectors
                minOffset.min(offset)
                maxOffset.max(offset)
              }
            }
          }
          this._restoreSavedPose(prevPos[prevPosCount], child.skeleton)
          prevPosCount++
        }
      })

      // Resolve with min and max offset vectors
      resolve({ min: minOffset, max: maxOffset })
    })
  }
  /**
   * 
   * @param {THREE.Skeleton} skeleton 
   * @returns 
   */
  _saveBonesPos(skeleton: THREE.Skeleton) {
    /**
     * @type {{position: THREE.Vector3, rotation: THREE.Quaternion, scale: THREE.Vector3}[]}
     */
    let savedPose: { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3; }[] = []
    skeleton.bones.forEach((bone) => {
      savedPose.push({
        position: bone.position.clone(),
        rotation: bone.rotation.clone(),
        scale: bone.scale.clone(),
      })
    })
    return savedPose
  }

  _restoreSavedPose(savedPose: { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3; }[], skeleton: THREE.Skeleton) {
    if (savedPose) {
      skeleton.bones.forEach((bone, index) => {
        bone.position.copy(savedPose[index].position)
        bone.rotation.copy(savedPose[index].rotation)
        bone.scale.copy(savedPose[index].scale)
      })
    }
  }
  /**
   * 
   * @param {THREE.Vector3} vector1 
   * @param {THREE.Vector3} vector2 
   * @param {THREE.Vector3} cameraPosition 
   * @param {number} fieldOfView 
   */
  positionCameraBetweenPoints(vector1: THREE.Vector3, vector2: THREE.Vector3, cameraPosition: THREE.Vector3, fieldOfView: number = 30) {
    const boundingBox = new THREE.Box3()
    boundingBox.expandByPoint(vector1)
    boundingBox.expandByPoint(vector2)

    this.camera.fov = fieldOfView

    const verticalFOV = this.camera.fov * (Math.PI / 180)

    const diagonalDistance = boundingBox.getSize(new THREE.Vector3()).length()

    const distance = diagonalDistance / (2 * Math.tan(verticalFOV / 2))

    boundingBox.getCenter(localVector)
    // Set the camera's position and lookAt
    this.camera.position.copy(localVector)

    cameraPosition.y *= 0.5

    this.camera.lookAt(localVector.clone().sub(cameraPosition)) // adjust lookAt position if needed

    // Adjust the camera position based on the calculated distance
    const direction = new THREE.Vector3()
    this.camera.getWorldDirection(direction)
    this.camera.position.addScaledVector(direction, -distance)

    // Update the camera's projection matrix to ensure proper rendering
    this.camera.updateProjectionMatrix()
  }
  /**
   * 
   * @param {THREE.Vector3} headPosition 
   * @param {number} playerCameraDistance 
   * @param {number} fieldOfView 
   */
  setCamera(headPosition: THREE.Vector3, playerCameraDistance: number, fieldOfView: number = 30) {
    this.camera.position.copy(headPosition)
    this.camera.fov = fieldOfView
    localVector.set(0, 0, -1)
    this.cameraDir = localVector.applyQuaternion(this.camera.quaternion)
    this.cameraDir.normalize()
    this.camera.position.x -= this.cameraDir.x * playerCameraDistance
    this.camera.position.z -= this.cameraDir.z * playerCameraDistance
  }

  /**
   * 
   * @param {string} shotName 
   * @param {THREE.Vector3} vectorCameraPosition 
   */
  setCameraFrameWithName(shotName: string, vectorCameraPosition: THREE.Vector3){
    const shotNameLower = shotName.toLowerCase();
    switch (shotNameLower){
        case "fullshot":
            this.frameShot("leftFoot", "head",vectorCameraPosition)
            break;
        case "cowboyshot":
            this.frameShot("hips", "head",vectorCameraPosition)
            break;
        case "mediumshot":
            this.frameShot("chest", "head",vectorCameraPosition)
            break;
        case "mediumcloseup":
        case "mediumcloseupshot":
            this.frameShot("chest", "head",vectorCameraPosition,true)
            break;
        case "closeup":
        case "closeupshot":
            this.frameShot("head", "head",vectorCameraPosition)
            break;
        default:
            console.warn("unkown cameraFrame: " + shotName + ". Please use fullShot, cowboyShot, mediumShot, mediumCloseup or closeup")
            this.frameShot("leftFoot", "head",vectorCameraPosition)
            break;
    }
  }


}
