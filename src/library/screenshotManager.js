import * as THREE from "three"
import { Buffer } from "buffer";

const screenshotSize = 4096;

const localVector = new THREE.Vector3();

const textureLoader = new THREE.TextureLoader();
const backgroundTexture = textureLoader.load(`/assets/backgrounds/main-background2.jpg`);
backgroundTexture.wrapS = backgroundTexture.wrapT = THREE.RepeatWrapping;

export class ScreenshotManager {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true
    });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setSize(screenshotSize, screenshotSize);

    this.camera = new THREE.PerspectiveCamera( 30, 1, 0.1, 1000 );
  }

  setCamera(headPosition, playerCameraDistance) {
    this.camera.position.copy(headPosition);

    localVector.set(0, 0, -1);
    this.cameraDir = localVector.applyQuaternion(this.camera.quaternion);
    this.cameraDir.normalize();
    this.camera.position.x -= this.cameraDir.x * playerCameraDistance;
    this.camera.position.z -= this.cameraDir.z * playerCameraDistance;

  }

  saveAsImage(imageName) {
    let imgData;
    try {
      this.scene.background = backgroundTexture;
      this.renderer.render(this.scene, this.camera);
      const strDownloadMime = "image/octet-stream";
      const strMime = "image/png";
      imgData = this.renderer.domElement.toDataURL(strMime);

      const base64Data = Buffer.from(
        imgData.replace(/^data:image\/\w+;base64,/, ""),
        "base64"
      );
      const blob = new Blob([base64Data], { type: "image/jpeg" });
      
      this.saveFile(imgData.replace(strMime, strDownloadMime), imageName);
      this.scene.background = null;
      return blob;
    } catch (e) {
      console.log(e);
      return false;
    }

  }

  _createImage(width, height){
    this.renderer.setSize(width, height);
    try {
      this.scene.background = backgroundTexture;
      this.renderer.render(this.scene, this.camera);
      const strMime = "image/png";
      let imgData = this.renderer.domElement.toDataURL(strMime);
      this.scene.background = null;
      return  imgData
    } catch (e) {
      console.log(e);
      return null;
    }
  }
  saveScreenshot(imageName,width, height){
    const imgData =  this._createImage(width, height)
    const strDownloadMime = "image/octet-stream";
    const strMime = "image/png";
    this.saveFile(imgData.replace(strMime, strDownloadMime), imageName);
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