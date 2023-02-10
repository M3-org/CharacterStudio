import * as THREE from "three"

const localVector = new THREE.Vector3();

export class ScreenshotManager {
  constructor() {
    this.frameRate = 1000 / 30;
    
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true
    });

    this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    this.renderTarget.texture.encoding = THREE.sRGBEncoding;

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
  }

  setCamera(height, playerCameraDistance) {
    this.camera.position.y = height;

    localVector.set(0, 0, -1);
    this.cameraDir = localVector.applyQuaternion(this.camera.quaternion);
    this.cameraDir.normalize();
    this.camera.position.x = -this.cameraDir.x * playerCameraDistance;
    this.camera.position.z = -this.cameraDir.z * playerCameraDistance;

  }

  saveAsImage(imageName) {
    let imgData;
    try {
      this.renderer.render(this.scene, this.camera);
      const strDownloadMime = "image/octet-stream";
      const strMime = "image/png";
      imgData = this.renderer.domElement.toDataURL(strMime);
      this.saveFile(imgData.replace(strMime, strDownloadMime), imageName);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }

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
      location.replace(uri);
    }
  }

}