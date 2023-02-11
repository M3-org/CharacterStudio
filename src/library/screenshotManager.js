import * as THREE from "three"
import { Buffer } from "buffer";

const localVector = new THREE.Vector3();

export class ScreenshotManager {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true
    });
    this.renderer.outputEncoding = THREE.sRGBEncoding

    const width = 500;
    const height = 750;

    this.renderer.setSize(width, height);

    this.camera = new THREE.PerspectiveCamera(
      30,
      width / height,
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
      this.blinkManager.setEyeOpen();
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
      return blob;
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