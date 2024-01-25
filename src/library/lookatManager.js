import * as THREE from 'three'

const localVector = new THREE.Vector3();

export class LookAtManager {
  constructor (screenViewPercentage, canvasID, camera){
    // this.neckBones = []
    // this.spineBones = []
    // this.leftEyeBones = []
    // this.rightEyesBones = []

    this.bonesInfo = [];

    this.curMousePos = new THREE.Vector2()

    this.hotzoneSection  = getHotzoneSection()
    this.enabled = false;
    this.userActivated = false;
    this.lookInterest = 1
    this.hasInterest = true
    this.interestSpeed = 0.3

    this.onCanvas = true;

    this.camera = camera;
    
    this.maxLookPercent = {
      neck: {maxy:15, miny:10,maxx:30, minx:10},
      spine: {maxy:0, miny:0,maxx:30, minx:10},
      left: {maxy:15, miny:20,maxx:35, minx:35},
      right: {maxy:15, miny:20,maxx:35, minx:35},
    }
    window.addEventListener("mousemove", (e)=>{
      this.curMousePos = {x:e.clientX, y: e.clientY}
    })
    const canvasRef = document.getElementById(canvasID)
    if (canvasRef){
      canvasRef.addEventListener("mouseleave", ()=>{
        this.onCanvas = false;
      })
      canvasRef.addEventListener("mouseenter", ()=>{
        this.onCanvas = true;
      })
    }
    window.addEventListener("resize", () => {
      this.hotzoneSection  = getHotzoneSection()
    });

    function getHotzoneSection(){
      const width = window.innerWidth * screenViewPercentage / 100
      const halfLimit = (window.innerWidth - width) / 2
      return {
        xStart: halfLimit, 
        xEnd: window.innerWidth-halfLimit, 
        yStart: 50, 
        yEnd: window.innerHeight-80
      }
    }
    // setInterval(() => {
    //   this.update();
    // }, 1000/60);
  }
  setActive(active){
    console.log("is activating")
    this.userActivated = active;
  }
  setCamera(camera){
    this.camera = camera
  }

  addVRM(vrm){
    const isVRM0 = vrm.data.isVRM0 || false;
    const bones = vrm.humanoid.humanBones // if vrm0 location of bones is dfferent

    if (!isVRM0){
      bones.neck.node.userData.inverseLookAt = true;
      bones.spine.node.userData.inverseLookAt = true;
      if (bones.leftEye)
        bones.leftEye.node.userData.inverseLookAt = true;
      if (bones.rightEye)
        bones.rightEye.node.userData.inverseLookAt = true;
    }

    const vrmInfo = {
      vrm: vrm,
      neckBone: bones.neck.node,
      spineBone: bones.spine.node,
      leftEyeBone: bones.leftEye ? bones.leftEye.node : null,
      rightEyeBone: bones.rightEye ? bones.rightEye.node : null,
    };

    this.bonesInfo.push(vrmInfo);
  }

  removeVRM(vrm) {
    const vrmInfoToRemove = this.bonesInfo.find((vrmInfo) => vrmInfo.vrm === vrm);

    if (vrmInfoToRemove) {
        const index = this.bonesInfo.indexOf(vrmInfoToRemove);
        this.bonesInfo.splice(index, 1);
    }
  }

  _getMouseDegrees (x, y, degreeLimit){
    let dx = 0,
      dy = 0,
      xdiff,
      xPercentage,
      ydiff,
      yPercentage

    let w = { x: window.innerWidth, y: window.innerHeight }
    if (x <= w.x / 2) {
      // 2. Get the difference between middle of screen and cursor position
      xdiff = w.x / 2 - x
      // 3. Find the percentage of that difference (percentage toward edge of screen)
      xPercentage = ((xdiff / (w.x / 2)) ) * 100
      // 4. Convert that to a percentage of the maximum rotation we allow for the neck
      dx = ((degreeLimit.maxx * xPercentage) / 100) * -1
    }
    if (x >= w.x / 2) {
      xdiff = x - w.x / 2
      xPercentage = ((xdiff / (w.x / 2))) * 100
      dx = (degreeLimit.minx * xPercentage) / 100
    }

    if (y <= w.y / 2) {
      ydiff = w.y / 2 - y
      yPercentage = (ydiff / (w.y / 2)) * 100
      // Note that I cut degreeLimit in half when she looks up
      dy = ((degreeLimit.maxy * 0.5 * yPercentage) / 100) * -1
    }
    if (y >= w.y / 2) {
      ydiff = y - w.y / 2
      yPercentage = (ydiff / (w.y / 2)) * 100
      dy = ((degreeLimit.miny) * yPercentage) / 100
    }
    return { x: dx, y: dy }
  }

  lerp(a, b, t) {
    return (1 - t) * a + t * b;
  }

  _moveJoint(joint, degreeLimit){
    const yMult = joint.userData.inverseLookAt === true ? 1:-1;
    if (Object.keys(joint).length !== 0) {
      const ymodifier = (this.camera.position.y - 1.8) * window.innerHeight / 2;
      let degrees = this._getMouseDegrees(this.curMousePos.x, this.curMousePos.y - ymodifier, degreeLimit);
      const rotationLerp = 0.8;
      joint.rotation.y = this.lerp(THREE.MathUtils.degToRad(degrees.x), joint.rotation.y, rotationLerp); 
      joint.rotation.x = this.lerp(THREE.MathUtils.degToRad(degrees.y *  yMult), joint.rotation.x, rotationLerp);
    }
  }

  update(){
    localVector.set(0, 0, 1);
    localVector.applyQuaternion(this.camera.quaternion);
    const cameraRotationThreshold = localVector.z > 0.; // if camera rotation is not larger than 90
    
    if (this.curMousePos.x > this.hotzoneSection.xStart && this.curMousePos.x < this.hotzoneSection.xEnd &&
      this.curMousePos.y > this.hotzoneSection.yStart && this.curMousePos.y < this.hotzoneSection.yEnd &&
      cameraRotationThreshold && this.enabled && this.userActivated) {

        this.bonesInfo.forEach(boneInfo => {
          this._moveJoint(boneInfo.neckBone, this.maxLookPercent.neck)
          this._moveJoint(boneInfo.spineBone, this.maxLookPercent.spine)
          this._moveJoint(boneInfo.leftEyeBone, this.maxLookPercent.left)
          this._moveJoint(boneInfo.rightEyeBone, this.maxLookPercent.right)
        })
    }
  }
}
