import * as THREE from "three"
import { Buffer } from "buffer";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { RenderPixelatedPass } from "./shaders/RenderPixelatedPass";
import { PixelatePass } from "./shaders/PixelatePass"
import { CharacterManager } from "./characterManager";
import CameraFrameManager from "./cameraFrameManager";

const screenshotSize = 4096;

export type Shots = 'fullshot'|'cowboyshot'|'closeup'|'mediumcloseup'|'mediumshot'|'mediumcloseupshot'|'closeupshot';

const localVector = new THREE.Vector3();

class PixelRenderer{
  domElement:HTMLCanvasElement;
  _renderPixelPass:RenderPixelatedPass;
  _pixelPass:PixelatePass;

  renderer:THREE.WebGLRenderer;
  composer:EffectComposer;
  
  constructor(public scene:THREE.Scene|THREE.Object3D,public camera:THREE.Camera, public pixelSize:number ){
    const pixelRenderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: false,
      alpha: true,
    })
    
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
    composer.addPass( new RenderPass( scene as THREE.Scene, camera ) )

    this._renderPixelPass = new RenderPixelatedPass( renderResolution, scene, camera )
    this._pixelPass = new PixelatePass( renderResolution )

    
    composer.addPass( this._renderPixelPass )
    // let bloomPass = new UnrealBloomPass( screenResolution, .4, .1, .9 )
    // composer.addPass( bloomPass )
    composer.addPass( this._pixelPass )
    
    this.renderer = pixelRenderer;
    this.composer = composer;
  }
  setSize(width:number, height:number){
    const screenshotResolution = new THREE.Vector2(width,height);
    let renderResolution = screenshotResolution.clone().divideScalar( this.pixelSize )
    renderResolution.x |= 0
    renderResolution.y |= 0

    this.renderer.setSize(width, height);
    this._renderPixelPass.setResolution(renderResolution);
    this._pixelPass.setResolution(renderResolution);
  }
  setPixelSize(pixelSize:number){
    this.pixelSize = pixelSize;
  }
  render(){
    this.composer.render();
  }
}

export class ScreenshotManager {

  renderer:THREE.WebGLRenderer;

  textureLoader:THREE.TextureLoader;
  sceneBackground:THREE.Color | THREE.Texture;
  sceneBackgroundAlpha:number;
  frameOffset:{min:number,max:number};
  usesBackgroundImage:boolean;
  backgroundMaterial:THREE.MeshBasicMaterial;
  backgroundPlane:THREE.Mesh;
  pixelRenderer:PixelRenderer;

  cameraFrameManager: CameraFrameManager;

  constructor(public characterManager:CharacterManager, public scene:THREE.Scene) {
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true,
      alpha:true
    });
    this.renderer.setClearAlpha(0);
    (this.renderer as any).premultipliedAlpha = false;

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.renderer.setSize(screenshotSize, screenshotSize);

    const camera = new THREE.PerspectiveCamera( 30, 1, 0.1, 1000 );
    camera.frustumCulled = false;
    this.textureLoader = new THREE.TextureLoader();
    this.sceneBackground = new THREE.Color(0.1,0.1,0.1);
    this.sceneBackgroundAlpha = 1;
    this.frameOffset = {
      min:0.2,
      max:0.2,
    }
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

  get camera(){
    return this.cameraFrameManager.camera
  }

  setScene(scene:THREE.Scene){
    this.scene = scene;
  }

  setupCamera(cameraPosition:THREE.Vector3, lookAtPosition:THREE.Vector3, fieldOfView = 30){
    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(lookAtPosition)
    this.camera.fov = fieldOfView;
  }

  /**
   * Sets the background using either color or image.
   * 
   * @param {Array|string} background - If an array, assumed to be RGB values [r, g, b].
   *                                    If a string, assumed to be a URL for the background image.
   */
  setBackground(background:string|number[]){
    if (Array.isArray(background)){
      const alpha = background[3] == null ? 1 : background[3];

      this.setBackgroundColor(background[0],background[1],background[2],alpha)
    }
    else{
      this.setBackgroundImage(background);
    }
  }

  setBackgroundColor(r:number,g:number,b:number,a:number){
    //@ts-ignore FIX THIS
    const color = new THREE.Color(r,g,b,a);
    this.sceneBackground = color
    if (a == null) a = 1;
    if (a > 1) a = 1;
    if (a < 0) a = 0;
    this.sceneBackgroundAlpha = a;
    this.backgroundMaterial.color = color;
    this.usesBackgroundImage = false;
  }

  texureLoader:THREE.TextureLoader = new THREE.TextureLoader();
  setBackgroundImage(url:string){
    return new Promise(async (resolve, reject) => {
      try{
        const backgroundTexture = await this.texureLoader.load(url);
        if (backgroundTexture){
          backgroundTexture.wrapS = backgroundTexture.wrapT = THREE.RepeatWrapping;
          this.sceneBackground = backgroundTexture;
          this.usesBackgroundImage = true;
          this.sceneBackgroundAlpha = 1;
          resolve(true);
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
  getImageData(width: number, height: number, pixelSize = null, trimmed = false){
    return this._createImage(width, height, pixelSize, trimmed)
  }


  _createImage(width:number, height:number, pixelSize:number|null = null, base64Trimmed = false){
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
      if(base64Trimmed){
        // trim the base64 part of the string
        imgData = imgData.replace(/^data:image\/\w+;base64,/, "")
      }
      this._restoreBackground();
      return  imgData
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  savePixelScreenshot(imageName:string,width:number, height:number, pixelSize:number){
    this.pixelRenderer.setPixelSize(pixelSize);
    this.pixelRenderer.setSize(width,height);
    const imgData =  this._createImage(width, height, null)
    if(!imgData) throw new Error("savePixelScreenshot: Error creating image");
    const strDownloadMime = "image/octet-stream";
    const strMime = "image/png";
    this.saveFile(imgData.replace(strMime, strDownloadMime), imageName + ".png");
  }
  saveScreenshot(imageName:string,width:number, height:number){
    const imgData =  this._createImage(width, height)
    if(!imgData) throw new Error("saveScreenshot: Error creating image");
    const strDownloadMime = "image/octet-stream";
    const strMime = "image/png";
    this.saveFile(imgData.replace(strMime, strDownloadMime), imageName + ".png");
  }

  getScreenshotImage(width:number, height:number){
    const imgData = this._createImage(width, height);
    if(!imgData) throw new Error("getScreenshotImage: Error creating image");
    const img = new Image();
    img.src = imgData;
    return img;
  }
  getScreenshotTexture(width:number, height:number){
    const img = this.getScreenshotImage(width,height)
    const texture = new THREE.Texture(img);
    texture.needsUpdate = true;
    return texture;
  }
  getScreenshotBlob(width:number, height:number){
    const imgData = this._createImage(width, height)
    if(!imgData) throw new Error("getScreenshotBlob: Error creating image");
    const base64Data = Buffer.from(
      imgData.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const blob = new Blob([base64Data], { type: "image/jpeg" }); 
    return blob; 
  }
  saveFile (strData:string, filename:string) {
    const link = document.createElement('a');
    if (typeof link.download === 'string') {
      document.body.appendChild(link); //Firefox requires the link to be in the body
      link.download = filename;
      link.href = strData;
      link.click();
      document.body.removeChild(link); //remove the link when done
    } else {
      const win = window.open(strData, "_blank");
      if(!win){
        console.error("Error opening new window");
        return;
      }
      win.document.write("<title>" + filename + "</title><img src='" + strData + "'/>");
    }
  }

}
