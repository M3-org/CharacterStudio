import * as THREE from 'three'

export default class TextureImageDataRenderer {
  width
  height
  cameraRTT = null
  sceneRTT = null
  material = null
  quad = null
  renderer = null
  rtTexture = null
  constructor(width, height) {
    this.width = width
    this.height = height
  }

  render(texture, multiplyColor, clearColor, width, height, isTransparent,sRGBEncoding = true) {
    // if texture is null or undefined, create a texture only with clearColor (that is color type)
    if (!texture) {
      texture = TextureImageDataRenderer.createSolidColorTexture(clearColor, width, height)
    }

    if (this.renderer == null) {
      this.sceneRTT = new THREE.Scene()
      this.cameraRTT = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -10000, 10000)
      this.cameraRTT.position.z = 100

      this.sceneRTT.add(this.cameraRTT)

      this.material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
        color: new THREE.Color(1, 1, 1),
      })

      const plane = new THREE.PlaneGeometry(1, 1)
      this.quad = new THREE.Mesh(plane, this.material)
      this.quad.scale.set(width, height, 1)
      this.sceneRTT.add(this.quad)

      this.renderer = new THREE.WebGLRenderer()
      this.renderer.setPixelRatio(1)
      this.renderer.setSize(width, height)
      //renderer.setClearColor(new Color(1, 1, 1), 1);
      this.renderer.autoClear = false
    } else {
      if(this.cameraRTT){
        this.cameraRTT.left = -width / 2
        this.cameraRTT.right = width / 2
        this.cameraRTT.top = height / 2
        this.cameraRTT.bottom = -height / 2
  
        this.cameraRTT.updateProjectionMatrix()
      }

      this.quad?.scale.set(width, height, 1)

      this.renderer.setSize(width, height)
    }

    this.rtTexture = new THREE.WebGLRenderTarget(width, height)
    this.rtTexture.texture.colorSpace = sRGBEncoding ? THREE.SRGBColorSpace : THREE.NoColorSpace;

    if(this.material){
      this.material.map = texture
      this.material.color = multiplyColor.clone()

    }
    // set opacoty to 0 if texture is transparent
    this.renderer.setClearColor(clearColor.clone(), isTransparent ? 0 : 1)

    this.renderer.setRenderTarget(this.rtTexture)
    this.renderer.clear()
    if(this.sceneRTT && this.cameraRTT){
      this.renderer.render(this.sceneRTT, this.cameraRTT)
    }

    let buffer = new Uint8ClampedArray(this.rtTexture.width * this.rtTexture.height * 4)
    this.renderer.readRenderTargetPixels(this.rtTexture, 0, 0, width, height, buffer)
    const imgData = new ImageData(buffer, width, height)

    return imgData
  }

  destroy() {
    this.cameraRTT = null
    this.sceneRTT?.clear()
    this.sceneRTT = null
    this.material = null
    this.quad = null
    this.renderer?.dispose()
    this.renderer = null
    this.rtTexture = null
  }

  static createSolidColorTexture (color, width, height) {
    const size = width * height
    const data = new Uint8Array(4 * size)
  
    const r = Math.floor(color.r * 255)
    const g = Math.floor(color.g * 255)
    const b = Math.floor(color.b * 255)
  
    for (let i = 0; i < size; i++) {
      const stride = i * 4
      data[stride] = r
      data[stride + 1] = g
      data[stride + 2] = b
      data[stride + 3] = 255
    }
  
    // used the buffer to create a DataTexture
    const texture = new THREE.DataTexture(data, width, height)
    texture.needsUpdate = true
    return texture
  }
}
