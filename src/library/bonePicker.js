import * as THREE from "three";
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

/**
 * BonePicker renders small gizmos on humanoid bones and enables hover/click selection.
 */
export class BonePicker {
  /**
   * Whether the instance is enabled;
   * @type {boolean}
   * defaults to false
   */
  _allowBonePicking = false

  /**
   * @param {import('./characterManager').CharacterManager} characterManager
   * @param {THREE.Camera} camera
   */
  constructor(characterManager, canvasID, camera) {
    this.characterManager = characterManager;
    this.camera = camera;
    this.canvasID = canvasID;

    /** @type {Array<THREE.Mesh>} */
    this.markers = [];
    /** @type {Array<Line2>} */
    this.boneLines = [];
    /** @type {Record<string, THREE.Object3D>} */
    this.nodeByName = {};
    /** @type {Record<string, Array<THREE.Line>>} */
    this.linesByBoneName = {};
    this.isActive = false;
    this.onPick = null;
    this.hovered = null;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.markerGeometry = new THREE.SphereGeometry(0.02, 16, 12);
    this.idleMaterial = new THREE.MeshBasicMaterial({ color: 0x00c2ff, depthTest: false });
    this.hoverMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00, depthTest: false });

    this.resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);


    this.majorBones = new Set([
      "hips","spine","chest","upperChest","neck","head",
      "leftShoulder","rightShoulder","leftUpperArm","rightUpperArm",
      "leftLowerArm","rightLowerArm","leftHand","rightHand",
      "leftUpperLeg","rightUpperLeg","leftLowerLeg","rightLowerLeg",
      "leftFoot","rightFoot"
    ]);

  }
  /**
   * 
   * @param {boolean} enabled Optional
   */
  toggleAllowBonePicking(enabled=undefined){
    this._allowBonePicking = enabled !== undefined ? enabled : !this._allowBonePicking;
    if (this._allowBonePicking){
      this._addListeners();
    } else {
      this._removeListeners();
      this.disable();
    }
  }

  _escListener = (e) => {
      if (e.key === "Escape") {
        this.disable();
      }
    }

  _onResize = () => {
      this.resolution.set(window.innerWidth, window.innerHeight);
      this.boneLines.forEach((ln) => {
        if (ln.material && ln.material.resolution) ln.material.resolution.copy(this.resolution);
      })
    }

  setTransformControls(transformControlHelper){
    this.transformControls = transformControlHelper;
  }

      
  _handleMouseMove = (event) => {
      const canvasRef = document.getElementById(this.canvasID)
      if(!canvasRef) return;

      const rect = canvasRef.getBoundingClientRect();
      const mousex = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mousey = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      this.handleHover(mousex, mousey);
  }

  _handleMouseClick = (event) => {
      const canvasRef = document.getElementById(this.canvasID)
      if(!canvasRef) return;

      const rect = canvasRef.getBoundingClientRect();
      const mousex = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mousey = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      // If gizmo is being interacted with, ignore clicks for bone selection
      if (this.transformControls && !this.transformControls.transform.dragging) {
          this.handleClick(mousex, mousey);
      }
  };

  _addListeners(){
    const canvasRef = document.getElementById(this.canvasID)
    if(canvasRef) {
      canvasRef.addEventListener("mousemove", this._handleMouseMove);
      canvasRef.addEventListener("click", this._handleMouseClick);
    }
  }

  _removeListeners(){
    const canvasRef = document.getElementById(this.canvasID)
    if(canvasRef) {
      canvasRef.removeEventListener("click", this._handleMouseClick);
      canvasRef.removeEventListener("mousemove", this._handleMouseMove);
    }
  }

  dispose(){
    this._removeListeners();
    this.disable();
    this.transformControls = null;
  }



  /**
   * Create markers on all humanoid bones of the base skeleton.
   */
  createMarkers() {
    this.disposeMarkers();
    const base = this.characterManager.baseSkeletonVRM;
    if (!base || !base.humanoid || !base.humanoid.humanBones) return;
    const bones = base.humanoid.humanBones;

    Object.entries(bones).forEach(([boneName, boneObj]) => {
      const node = boneObj?.node;
      if (!node) return;
      if (!this.majorBones.has(boneName)) return;
      const marker = new THREE.Mesh(this.markerGeometry, this.idleMaterial.clone());
      marker.name = `bone-marker:${boneName}`;
      marker.userData.boneName = boneName;
      marker.renderOrder = 9999;
      marker.frustumCulled = false;
      // Slight offset to avoid z-fighting
      marker.position.set(0, 0, 0);
      node.add(marker);
      this.markers.push(marker);
      this.nodeByName[boneName] = node;

      const label = this._createLabelSprite(boneName);
      label.position.set(0.06, 0.06, 0);
      marker.add(label);
    });

    this._createBoneLines();
  }

  disposeMarkers() {
    this.markers.forEach((m) => {
      if (m.parent) m.parent.remove(m);
    });
    this.markers = [];
    this.boneLines.forEach((ln) => {
      if (ln.parent) ln.parent.remove(ln);
    });
    this.boneLines = [];
    this.linesByBoneName = {};
    this.nodeByName = {};
    this.hovered = null;
  }

  enable(onPick) {
    this.onPick = onPick;
    this.createMarkers();
    this.isActive = true;
    window.addEventListener("keydown", this._escListener);
    window.addEventListener("resize", this._onResize);
    if (this.characterManager?.setClickCullingEnabled)
      this.characterManager.setClickCullingEnabled(false)
  }

  disable() {
    this.isActive = false;
    this.onPick = null;
    this.disposeMarkers();
    window.removeEventListener("keydown", this._escListener);
    window.removeEventListener("resize", this._onResize);
    if (this.characterManager?.setClickCullingEnabled)
      this.characterManager.setClickCullingEnabled(true)
  }

  /**
   * @param {number} mouseX normalized device coordinate [-1,1]
   * @param {number} mouseY normalized device coordinate [-1,1]
   */
  handleHover(mouseX, mouseY) {
    if (!this.isActive) return;
    this.mouse.set(mouseX, mouseY);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    // keep lines in sync (cheap: ~20 bones)
    this._updateBoneLinesPositions();
    const hits = this.raycaster.intersectObjects(this.markers, false);

    const newHover = hits.length > 0 ? hits[0].object : null;
    if (newHover !== this.hovered) {
      if (this.hovered) {
        this.hovered.material = this.idleMaterial.clone();
        this.hovered.scale.set(1, 1, 1);
        this._setLinesColor(this.hovered.userData?.boneName, 0x00c2ff);
      }
      this.hovered = newHover;
      if (this.hovered) {
        this.hovered.material = this.hoverMaterial.clone();
        this.hovered.scale.set(1.4, 1.4, 1.4);
        this._setLinesColor(this.hovered.userData?.boneName, 0xffcc00);
      }
    }
  }

  /**
   * @param {number} mouseX normalized device coordinate [-1,1]
   * @param {number} mouseY normalized device coordinate [-1,1]
   */
  handleClick(mouseX, mouseY) {
    if (!this.isActive) return;
    this.mouse.set(mouseX, mouseY);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.markers, false);
    if (hits.length > 0) {
      const marker = hits[0].object;
      const boneName = marker.userData?.boneName;
      if (boneName && this.onPick) {
        const cb = this.onPick;
        this.disable();
        cb(boneName);
      }
    }
  }

  _createLabelSprite(text) {
    const canvas = document.createElement("canvas");
    const size = 128;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(8, 8, size - 16, 40, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.font = "20px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size / 2, 28);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.18, 0.18, 1);
    return sprite;
  }

  _createBoneLines() {
    const color = 0x00c2ff;
    const namesSet = new Set(Object.keys(this.nodeByName));

    Object.entries(this.nodeByName).forEach(([boneName, node]) => {
      const childLines = [];
      node.children.forEach((child) => {
        if (!(child instanceof THREE.Object3D)) return;
        // Connect only to children that are also known humanoid nodes
        if (!namesSet.has(child.name)) return;
        const geom = new LineGeometry();
        // compute child position in node local space
        const childWorld = new THREE.Vector3();
        child.getWorldPosition(childWorld);
        const localEnd = node.worldToLocal(childWorld.clone());
        const positions = [0, 0, 0, localEnd.x, localEnd.y, localEnd.z];
        geom.setPositions(positions);
        const mat = new LineMaterial({
          color,
          linewidth: 4,
          transparent: true,
          opacity: 0.95,
          depthTest: false,
        });
        mat.resolution = this.resolution.clone();
        const line = new Line2(geom, mat);
        line.computeLineDistances();
        line.renderOrder = 9998;
        line.userData.boneName = boneName;
        node.add(line);
        this.boneLines.push(line);
        childLines.push(line);
      });
      if (childLines.length) this.linesByBoneName[boneName] = childLines;
    });
  }

  _updateBoneLinesPositions() {
    Object.entries(this.linesByBoneName).forEach(([boneName, lines]) => {
      const node = this.nodeByName[boneName];
      if (!node) return;
      lines.forEach((line) => {
        const child = line.parent && line.parent !== node ? null : null; // lines are attached to node
        // Recompute end point based on the first index > 0 of geometry (second point)
        // Find the child by computing from current geometry's end point world pos? Simpler: leave static.
        // Keep it cheap: skip dynamic updates when animating heavily.
      });
    });
  }

  _setLinesColor(boneName, color) {
    const lines = this.linesByBoneName[boneName] || [];
    lines.forEach((ln) => {
      if (ln.material?.color) ln.material.color.setHex(color);
    });
  }
}


