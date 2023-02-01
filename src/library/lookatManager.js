import * as THREE from 'three'

export class LookAtManager {
  constructor (screenViewPercentage){
    this.neckBones = []
    this.spineBones = []
    this.leftEyeBones = []
    this.rightEyesBones = []
    this.curMousePos = new THREE.Vector2()

    this.hotzoneSection  = getHotzoneSection()
    this.enabled = true
    this.lookInterest = 1
    this.hasInterest = true
    this.interestSpeed = 0.3

    this.clock = new THREE.Clock()
    this.deltaTime = 0
    
    this.maxLookPercent = {
      neck: 40,
      spine: 20,
      left: 60,
      right: 60,
    }
    window.addEventListener("mousemove", (e)=>{
        this.curMousePos = {x:e.clientX, y: e.clientY}
    })
    window.addEventListener("resize", () => {
      this.hotzoneSection  = getHotzoneSection()
    });

    function getHotzoneSection(){
      const width = window.innerWidth * screenViewPercentage / 100
      const halfLimit = (window.innerWidth - width) / 2
      return {xStart: halfLimit, xEnd: window.innerWidth-halfLimit}
    }
    setInterval(() => {
      this.update();
    }, 1000/30);
  }

  addVRM(vrm){
    vrm.scene.traverse((child) => {
      if (child.isBone) { 
        switch (child.name){
          case 'neck':
            this.neckBones.push(child)
            break
          case 'spine':
            this.spineBones.push(child)
            break
          case 'leftEye':
            this.leftEyeBones.push(child)
            break
          case 'rightEye':
            this.rightEyesBones.push(child)
            break
        }     
      }
    })
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
      xPercentage = (xdiff / (w.x / 2)) * 100
      // 4. Convert that to a percentage of the maximum rotation we allow for the neck
      dx = ((degreeLimit * xPercentage) / 100) * -1
    }
    if (x >= w.x / 2) {
      xdiff = x - w.x / 2
      xPercentage = (xdiff / (w.x / 2)) * 100
      dx = (degreeLimit * xPercentage) / 100
    }
    if (y <= w.y / 2) {
      ydiff = w.y / 2 - y
      yPercentage = (ydiff / (w.y / 2)) * 100
      // Note that I cut degreeLimit in half when she looks up
      dy = ((degreeLimit * 0.5 * yPercentage) / 100) * -1
    }
    if (y >= w.y / 2) {
      ydiff = y - w.y / 2
      yPercentage = (ydiff / (w.y / 2)) * 100
      dy = (degreeLimit * yPercentage) / 100
    }
    return { x: dx, y: dy }
  }

  _moveJoint(joint, degreeLimit){
    if (Object.keys(joint).length !== 0) {
      let degrees = this._getMouseDegrees(this.curMousePos.x, this.curMousePos.y, degreeLimit)
      joint.rotation.y = THREE.MathUtils.degToRad(degrees.x) * this.lookInterest
      joint.rotation.x = THREE.MathUtils.degToRad(degrees.y) * this.lookInterest
    }
  }

  _setInterest(){
    if (this.curMousePos.x > this.hotzoneSection.xStart && this.curMousePos.x < this.hotzoneSection.xEnd)
      this.hasInterest = true
    else
      this.hasInterest = false

    if (this.hasInterest && this.lookInterest < 1){
      const newInterest =  this.lookInterest + this.deltaTime/this.interestSpeed
      this.lookInterest = newInterest > 1 ? 1 : newInterest
    }
    if (!this.hasInterest && this.lookInterest > 0){
      const newInterest =  this.lookInterest - this.deltaTime/this.interestSpeed
      this.lookInterest = newInterest < 0 ? 0 : newInterest
    }

  }

  update(){
    this.deltaTime = this.clock.getDelta()
    this._setInterest();
    
    if (this.enabled){
      this.neckBones.forEach(neck => {
        this._moveJoint(neck, this.maxLookPercent.neck)
      })
      this.spineBones.forEach(spine => {
        this._moveJoint(spine, this.maxLookPercent.spine)
      })
      this.leftEyeBones.forEach(leftEye => {
        this._moveJoint(leftEye, this.maxLookPercent.left)
      })
      this.rightEyesBones.forEach(rightEye => {
        this._moveJoint(rightEye, this.maxLookPercent.right)
      })
    }
  }
}
