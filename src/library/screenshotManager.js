import * as THREE from "three"
import { Buffer } from "buffer";

const screenshotSize = 4096;

const localVector = new THREE.Vector3();

export class ScreenshotManager {
  constructor(characterManager) {
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      antialias: true
    });
    this.characterManager = characterManager;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setSize(screenshotSize, screenshotSize);
    this.camera = new THREE.PerspectiveCamera( 30, 1, 0.1, 1000 );
    this.textureLoader = new THREE.TextureLoader();
    this.sceneBackground = new THREE.Color(0.1,0.1,0.1);
  }

  setupCamera(cameraPosition, lookAtPosition, fieldOfView = 30){
    this.camera.position.copy(cameraPosition);
    this.camera.lookAt(lookAtPosition)
    this.camera.fov = fieldOfView;
    console.log("camera has been set");
  }

  positionCameraBetweenPoints(vector1, vector2,cameraPosition, fieldOfView = 30) {
    const boundingBox = new THREE.Box3();
    boundingBox.expandByPoint(vector1);
    boundingBox.expandByPoint(vector2);

    this.camera.fov = fieldOfView;

    const verticalFOV = this.camera.fov * (Math.PI / 180); 

    const diagonalDistance = boundingBox.getSize(new THREE.Vector3()).length();

    const distance = diagonalDistance / (2 * Math.tan(verticalFOV / 2));

    boundingBox.getCenter(localVector)
    // Set the camera's position and lookAt
    this.camera.position.copy(localVector);

    cameraPosition.y *= 0.5; 

    this.camera.lookAt(localVector.clone().sub(cameraPosition)); // adjust lookAt position if needed

    // Adjust the camera position based on the calculated distance
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    this.camera.position.addScaledVector(direction, -distance);

    // Update the camera's projection matrix to ensure proper rendering
    this.camera.updateProjectionMatrix();
  }

  setCamera(headPosition, playerCameraDistance,fieldOfView = 30) {
    this.camera.position.copy(headPosition);
    this.camera.fov = fieldOfView;
    localVector.set(0, 0, -1);
    this.cameraDir = localVector.applyQuaternion(this.camera.quaternion);
    this.cameraDir.normalize();
    this.camera.position.x -= this.cameraDir.x * playerCameraDistance;
    this.camera.position.z -= this.cameraDir.z * playerCameraDistance;

  }

  /**
   * Sets the background using either color or image.
   * 
   * @param {Array|string} background - If an array, assumed to be RGB values [r, g, b].
   *                                    If a string, assumed to be a URL for the background image.
   */
  setBackground(background){
    if (Array.isArray(background)){
      this.setBackgroundColor(background[0],background[1],background[2])
    }
    else{
      this.setBackgroundImage(background);
    }
  }

  setBackgroundColor(r,g,b){
    this.sceneBackground = new THREE.Color(r,g,b);
  }

  setBackgroundImage(url){
    return new Promise(async (resolve, reject) => {
      try{
        const backgroundTexture = await this.texureLoader.load(url);
        if (backgroundTexture){
          backgroundTexture.wrapS = backgroundTexture.wrapT = THREE.RepeatWrapping;
          this.sceneBackground = backgroundTexture;
          resolve();
        }
      }
      catch(error){
        console.error("Error loading background image: ", error)
        reject(error)
      }
    });
  }

  saveAsImage(imageName) {
    let imgData;
    try {
      this.scene.background = this.sceneBackground;
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
    const aspectRatio = width / height;
    this.renderer.setSize(width, height);
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();
    try {
      this.scene.background = this.sceneBackground;
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
