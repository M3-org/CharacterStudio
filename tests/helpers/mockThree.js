import { vi } from 'vitest'

// Enhanced Three.js mocks for testing
export const mockThree = {
  Object3D: class MockObject3D {
    constructor() {
      this.children = []
      this.parent = null
      this.position = { x: 0, y: 0, z: 0, set: vi.fn() }
      this.rotation = { x: 0, y: 0, z: 0, set: vi.fn() }
      this.scale = { x: 1, y: 1, z: 1, set: vi.fn() }
      this.userData = {}
      this.uuid = Math.random().toString(36).substr(2, 9)
    }
    
    add(child) {
      this.children.push(child)
      child.parent = this
    }
    
    remove(child) {
      const index = this.children.indexOf(child)
      if (index > -1) {
        this.children.splice(index, 1)
        child.parent = null
      }
    }
    
    traverse(callback) {
      callback(this)
      this.children.forEach(child => child.traverse(callback))
    }
    
    dispose() {
      this.children.forEach(child => child.dispose?.())
    }
  },

  Vector3: class MockVector3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x
      this.y = y
      this.z = z
    }
    
    set(x, y, z) {
      this.x = x
      this.y = y
      this.z = z
      return this
    }
    
    copy(v) {
      this.x = v.x
      this.y = v.y
      this.z = v.z
      return this
    }
    
    clone() {
      return new this.constructor(this.x, this.y, this.z)
    }
  },

  Mesh: class MockMesh extends mockThree.Object3D {
    constructor(geometry, material) {
      super()
      this.geometry = geometry
      this.material = material
      this.isMesh = true
    }
    
    dispose() {
      super.dispose()
      this.geometry?.dispose()
      this.material?.dispose()
    }
  },

  BufferGeometry: class MockBufferGeometry {
    constructor() {
      this.attributes = {}
      this.index = null
    }
    
    dispose() {
      // Mock dispose
    }
    
    setAttribute(name, attribute) {
      this.attributes[name] = attribute
    }
  },

  Material: class MockMaterial {
    constructor() {
      this.type = 'Material'
      this.uuid = Math.random().toString(36).substr(2, 9)
    }
    
    dispose() {
      // Mock dispose
    }
  },

  GLTFLoader: class MockGLTFLoader {
    constructor() {
      this.load = vi.fn()
      this.parse = vi.fn()
    }
  },

  AnimationMixer: class MockAnimationMixer {
    constructor(root) {
      this.root = root
      this.clipAction = vi.fn().mockReturnValue({
        play: vi.fn(),
        stop: vi.fn(),
        setLoop: vi.fn(),
        setDuration: vi.fn(),
      })
    }
    
    update(deltaTime) {
      // Mock update
    }
  },

  Clock: class MockClock {
    constructor() {
      this.startTime = 0
      this.oldTime = 0
      this.elapsedTime = 0
      this.running = false
    }
    
    start() {
      this.running = true
      this.startTime = Date.now()
    }
    
    stop() {
      this.running = false
    }
    
    getDelta() {
      return this.running ? 0.016 : 0 // 60fps
    }
    
    getElapsedTime() {
      return this.running ? (Date.now() - this.startTime) / 1000 : 0
    }
  }
}

// Mock VRM related classes
export const mockVRM = {
  VRMLoaderPlugin: class MockVRMLoaderPlugin {
    constructor() {
      this.parser = {
        parse: vi.fn().mockResolvedValue({
          scene: new mockThree.Object3D(),
          userData: { vrm: {} },
        })
      }
    }
  },

  VRMSpringBoneCollider: class MockVRMSpringBoneCollider {
    constructor(shape) {
      this.shape = shape
    }
  },

  VRMExporter: class MockVRMExporter {
    constructor() {
      this.export = vi.fn().mockResolvedValue(new ArrayBuffer(1024))
    }
  }
}

// Mock Web APIs
export const mockWebAPIs = {
  FileReader: class MockFileReader {
    constructor() {
      this.onload = null
      this.onerror = null
      this.result = null
    }
    
    readAsArrayBuffer(file) {
      setTimeout(() => {
        this.result = new ArrayBuffer(file.size || 1024)
        this.onload?.({ target: this })
      }, 0)
    }
    
    readAsDataURL(file) {
      setTimeout(() => {
        this.result = `data:${file.type || 'application/octet-stream'};base64,dGVzdA==`
        this.onload?.({ target: this })
      }, 0)
    }
  },

  URL: {
    createObjectURL: vi.fn((blob) => `blob:${blob.type}`),
    revokeObjectURL: vi.fn(),
  },

  HTMLCanvasElement: {
    getContext: vi.fn(() => ({
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1,
      })),
      putImageData: vi.fn(),
      drawImage: vi.fn(),
      toDataURL: vi.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='),
    })),
  },
}

// Export combined mocks
export const setupMocks = () => {
  global.THREE = mockThree
  global.FileReader = mockWebAPIs.FileReader
  global.URL = mockWebAPIs.URL
  global.HTMLCanvasElement.prototype.getContext = mockWebAPIs.HTMLCanvasElement.getContext
}