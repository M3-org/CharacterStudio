import * as THREE from "three"
import { Buffer } from "buffer";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { RenderPixelatedPass } from "./shaders/RenderPixelatedPass";
import { PixelatePass } from "./shaders/PixelatePass"
import CameraFrameManager from "./cameraFrameManager";
/**
 * @typedef {import("./cameraFrameManager.js").default} CameraFrameManager
 */
const screenshotSize = 4096;

class PixelRenderer{
  constructor(scene,camera, pixelSize ){
    const pixelRenderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: false,
      alpha: true,
    })
    
    this.pixelSize = pixelSize;
    this.domElement = pixelRenderer.domElement;

    const screenshotResolution = new THREE.Vector2(screenshotSize,screenshotSize);
    pixelRenderer.setClearColor( 0x000000, 0);
    pixelRenderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    pixelRenderer.setSize(screenshotResolution.x, screenshotResolution.y);
    pixelRenderer.setPixelRatio(window.devicePixelRatio);
    //pixelRenderer.shadowMap.enabled = true
    

    let renderResolution = screenshotResolution.clone().divideScalar( pixelSize )
    renderResolution.x |= 0
    renderResolution.y |= 0

    const composer = new EffectComposer( pixelRenderer )
    composer.addPass( new RenderPass( scene, camera ) )

    this._renderPixelPass = new RenderPixelatedPass( renderResolution, scene, camera )
    this._pixelPass = new PixelatePass( renderResolution )

    
    composer.addPass( this._renderPixelPass )
    composer.addPass( this._pixelPass )
    
    this.renderer = pixelRenderer;
    this.composer = composer;
  }
  setSize(width, height){
    const screenshotResolution = new THREE.Vector2(width,height);
    let renderResolution = screenshotResolution.clone().divideScalar( this.pixelSize )
    renderResolution.x |= 0
    renderResolution.y |= 0

    this.renderer.setSize(width, height);
    this._renderPixelPass.setResolution(renderResolution);
    this._pixelPass.setResolution(renderResolution);
  }
  setPixelSize(pixelSize){
    this.pixelSize = pixelSize;
  }
  render(){
    this.composer.render();
  }
}

export class ScreenshotManager {
/**
 * @typedef {import("./cameraFrameManager.js").default} CameraFrameManager
 * @type {CameraFrameManager}
 */
  cameraFrameManager

  constructor(characterManager, scene) {
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true,
      alpha:true
    });
    this.renderer.setClearAlpha(0);
    this.renderer.premultipliedAlpha = false;
    this.scene = scene;
    this.characterManager = characterManager;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.renderer.setSize(screenshotSize, screenshotSize);

    const camera = new THREE.PerspectiveCamera( 30, 1, 0.1, 1000 );
    this.textureLoader = new THREE.TextureLoader();
    this.sceneBackground = new THREE.Color(0.1,0.1,0.1);
    this.sceneBackgroundAlpha = 1;

    this.usesBackgroundImage = false;

    this.backgroundMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const geometry = new THREE.PlaneGeometry(1000, 1000); // Adjust size as needed
    const plane = new THREE.Mesh(geometry, this.backgroundMaterial);
    plane.renderOrder = -1
    this.backgroundPlane = plane;

    this.pixelRenderer = new PixelRenderer(scene, camera, 20);

    this.cameraFrameManager = new CameraFrameManager(camera);
    this.cameraFrameManager.setFrameTarget(this.characterManager.characterModel);
  }
  setScene(scene){
    this.scene = scene;
  }
  get camera(){
    return this.cameraFrameManager.camera
  }

  /**
   * 
   * @param {*} cameraPosition 
   * @param {*} lookAtPosition 
   * @param {*} fieldOfView 
   */
  setupCamera(cameraPosition, lookAtPosition, fieldOfView = 30){
    this.cameraFrameManager.setupCamera(cameraPosition, lookAtPosition, fieldOfView)

  }

  /**
   * @dev currently unused; @todo remove?
   */
  _getCharacterMinMax(){
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    this.characterManager.characterModel.traverse((o) => {
      if (o.geometry) {
        o.geometry.computeBoundingBox();
        
        // If boundingBox is available
        if (o.geometry.boundingBox) {
            o.geometry.boundingBox.applyMatrix4(o.matrixWorld);

            if (o.geometry.boundingBox.min.y < minY)
              minY = o.geometry.boundingBox.min.y

            if (o.geometry.boundingBox.max.y > maxY)
              maxY = o.geometry.boundingBox.max.y
        }
      }
    });
    return {minY, maxY}
  }


  /**
   * @dev UNUSED anywhere, maybe @todo remove?
   * @param {string} boneName 
   * @param {THREE.Object3D|undefined} targetObject
   * @returns 
   */
  _getBoneWorldPosition(boneName,targetObject=undefined){
    const bone = this.cameraFrameManager._getFirstBoneWithName(boneName,targetObject);
    if (bone != null){
      return new THREE.Vector3().setFromMatrixPosition(bone.matrixWorld);
    }
    else{
      console.warn(`Bone with name '${boneName}' not found in one of the skinned meshes.`);
      return new THREE.Vector3(0,0,0);
    }
  }


  /**
   * Sets the background using either color or image.
   * 
   * @param {Array|string} background - If an array, assumed to be RGB values [r, g, b].
   *                                    If a string, assumed to be a URL for the background image.
   */
  setBackground(background){
    if (Array.isArray(background)){
      const alpha = background[3] == null ? 1 : background[3];

      this.setBackgroundColor(background[0],background[1],background[2],alpha)
    }
    else{
      this.setBackgroundImage(background);
    }
  }

  setBackgroundColor(r,g,b,a){
    const color = new THREE.Color(r,g,b,a);
    this.sceneBackground = color
    if (a == null) a = 1;
    if (a > 1) a = 1;
    if (a < 0) a = 0;
    this.sceneBackgroundAlpha = a;
    this.backgroundMaterial.color = color;
    this.usesBackgroundImage = false;
  }

  setBackgroundImage(url){
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      try{
        const backgroundTexture = await this.texureLoader.load(url);
        if (backgroundTexture){
          backgroundTexture.wrapS = backgroundTexture.wrapT = THREE.RepeatWrapping;
          this.sceneBackground = backgroundTexture;
          this.usesBackgroundImage = true;
          this.sceneBackgroundAlpha = 1;
          resolve();
        }
      }
      catch(error){
        console.error("Error loading background image: ", error)
        reject(error)
      }
    });
  }

  _setBackground() {
    if (this.usesBackgroundImage == false && this.sceneBackgroundAlpha != 1){
      if (this.sceneBackgroundAlpha == 0){
        this.scene.background = null;
      }
      else{
        this.scene.background = null;
        this.scene.add(this.backgroundPlane);
        this.backgroundPlane.position.copy(this.camera.position);
        var direction = new THREE.Vector3(0, 0, -1);  // Adjust the direction if needed
        direction.applyQuaternion(this.camera.quaternion);
        var distance = 100;  // Adjust the distance as needed
        this.backgroundPlane.position.addScaledVector(direction, distance);
        this.backgroundPlane.lookAt(this.camera.position);
      }
    }
    else{
      this.scene.background = this.sceneBackground;
    }
  }
  _restoreBackground(){
    this.scene.background = null;
    if (this.usesBackgroundImage == false && this.sceneBackgroundAlpha != 1){
      this.scene.remove(this.backgroundPlane);
    }
  }
  getImageData(width, height, pixelSize = null){
    return this._createImage(width, height, pixelSize).split("base64,")[1];
  }

  _createImage(width, height, pixelSize = null){
    const aspectRatio = width / height;

    if (typeof pixelSize === 'number'){
      this.pixelRenderer.setPixelSize(pixelSize);
    }
    this.renderer.setSize(width, height);
    this.pixelRenderer.setSize(width,height);
    const strMime = "image/png";

    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();
    const renderer = typeof pixelSize === 'number' ? this.pixelRenderer : this.renderer;
    try {
      
      this._setBackground();
      renderer.render(this.scene, this.camera);
      let imgData = renderer.domElement.toDataURL(strMime);
      this._restoreBackground();
      return  imgData
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  savePixelScreenshot(imageName,width, height, pixelSize){
    this.pixelRenderer.setPixelSize(pixelSize);
    this.pixelRenderer.setSize(width,height);
    const imgData =  this._createImage(width, height, true)
    const strDownloadMime = "image/octet-stream";
    const strMime = "image/png";
    this.saveFile(imgData.replace(strMime, strDownloadMime), imageName + ".png");
  }
  saveScreenshot(imageName,width, height){
    const imgData =  this._createImage(width, height)
    const strDownloadMime = "image/octet-stream";
    const strMime = "image/png";
    this.saveFile(imgData.replace(strMime, strDownloadMime), imageName + ".png");
  }

  getScreenshotImage(width, height){
    const imgData = this._createImage(width, height);
    const img = new Image();
    img.src = imgData;
    return img;
  }
  getScreenshotTexture(width, height){
    const img = this.getScreenshotImage(width,height)
    const texture = new THREE.Texture(img);
    texture.needsUpdate = true;
    return texture;
  }
  getScreenshotBlob(width, height){
    const imgData = this._createImage(width, height)
    const base64Data = Buffer.from(
      imgData.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const blob = new Blob([base64Data], { type: "image/jpeg" }); 
    return blob; 
  }
  saveFile (strData, filename) {
    const link = document.createElement('a');
    if (typeof link.download === 'string') {
      document.body.appendChild(link); //Firefox requires the link to be in the body
      link.download = filename;
      link.href = strData;
      link.click();
      document.body.removeChild(link); //remove the link when done
    } else {
      const win = window.open(strData, "_blank");
      win.document.write("<title>" + filename + "</title><img src='" + strData + "'/>");
    }
  }

}
