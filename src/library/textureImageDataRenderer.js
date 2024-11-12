import * as THREE from 'three'
import { getAsArray } from './utils'
export default class TextureImageDataRenderer {
  width
  height
  cameraRTT = null
  sceneRTT = null
  materials = []
  quads = []
  renderer = null
  rtTexture = null
  constructor(width, height) {
    this.width = width
    this.height = height
  }

  /**
   * 
   * @param {THREE.Texture} texture 
   * @param {number} positionIndex 
   * @returns 
   */
  _addPlane(texture,positionIndex=0) {
    if(!this.sceneRTT){
      return
    }
    const material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 1,
      color: new THREE.Color(1, 1, 1),
    })
    this.materials.push(material)
    const plane = new THREE.PlaneGeometry(1, 1)
    const m = new THREE.Mesh(plane, material)
    m.position.z = positionIndex*0.0001
    m.scale.set(this.width, this.height, 1)
    this.quads.push(m)
    this.sceneRTT.add(m)
  }

  render(texture, multiplyColor, clearColor, isTransparent,sRGBEncoding = true) {
    // if texture is null or undefined, create a texture only with clearColor (that is color type)
    const textures = getAsArray(texture)
    if (textures.length === 0) {
      texture = getAsArray(TextureImageDataRenderer.createSolidColorTexture(clearColor, this.width, this.height))
    }

    if (this.renderer == null) {
      this.sceneRTT = new THREE.Scene()
      this.cameraRTT = new THREE.OrthographicCamera(-this.width / 2, this.width / 2, this.height / 2, -this.height / 2, -10000, 10000)
      this.cameraRTT.position.z = 100

      this.sceneRTT.add(this.cameraRTT)

      for(let i = 0; i < textures.length; i++){
        const textureElement = textures[i]
        if(textureElement){
          this._addPlane(textureElement, i)
        }
      }

      this.renderer = new THREE.WebGLRenderer()
      this.renderer.setPixelRatio(1)
      this.renderer.setSize(this.width, this.height)
      //renderer.setClearColor(new Color(1, 1, 1), 1);
      this.renderer.autoClear = false
    } else {
      if(this.cameraRTT){
        this.cameraRTT.left = -this.width / 2
        this.cameraRTT.right = this.width / 2
        this.cameraRTT.top = this.height / 2
        this.cameraRTT.bottom = -this.height / 2
  
        this.cameraRTT.updateProjectionMatrix()
      }

      this.quads.forEach((quad) => {
        quad?.scale.set(this.width, this.height, 1)
      })

      this.renderer.setSize(this.width, this.height)
    }

   /**
     * If the number of textures is greater than the number of materials, add a plane for each texture
     */
    if(textures.length > this.materials.length){
      const diff = textures.length - this.materials.length
      for(let i = 0; i < diff; i++){
        const textureElement = textures[i]
        this._addPlane(textureElement, i)
      }
    }else{
      this.materials.length = textures.length
      if(this.quads.length > textures.length){
        for(let i = textures.length; i < this.quads.length; i++){
          this.sceneRTT?.remove(this.quads[i])
        }
      }
      this.quads.length = textures.length
    }

    this.rtTexture = new THREE.WebGLRenderTarget(this.width, this.height)
    this.rtTexture.texture.colorSpace = sRGBEncoding ? THREE.SRGBColorSpace : THREE.NoColorSpace;

    for(let i = 0; i < textures.length; i++){
      const textureElement = textures[i]
      if(textureElement){
        this.materials[i].map = textureElement
        this.materials[i].color = multiplyColor.clone()
      }
    }
    // set opacoty to 0 if texture is transparent
    this.renderer.setClearColor(clearColor.clone(), isTransparent ? 0 : 1)

    this.renderer.setRenderTarget(this.rtTexture)
    this.renderer.clear()
    if(this.sceneRTT && this.cameraRTT){
      this.renderer.render(this.sceneRTT, this.cameraRTT)
    }

    let buffer = new Uint8ClampedArray(this.rtTexture.width * this.rtTexture.height * 4)
    this.renderer.readRenderTargetPixels(this.rtTexture, 0, 0, this.width, this.height, buffer)
    const imgData = new ImageData(buffer, this.width, this.height)

    return imgData
}


  clearRenderer() {
    this.rtTexture?.dispose()
    this.rtTexture = null
    if(this.materials?.length){
      this.materials.forEach((material) => {
        material.map?.dispose()
        material.map = null
      })
    }
  }

  destroy() {
    this.cameraRTT = null
    this.sceneRTT?.clear()
    this.sceneRTT = null

    this.materials.forEach((material) => {
      material.map?.dispose()
      material.map = null
    })
    this.quads.forEach((quad) => {
      this.sceneRTT?.remove(quad)
      quad = null
    })
    this.materials.length = 0
    this.quads.length = 0
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
