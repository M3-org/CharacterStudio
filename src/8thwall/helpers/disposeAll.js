export const disposeAll = (scene) => {
  scene.traverse((object) => {
    if (!object.isMesh) return

    object.geometry.dispose()
    if (object.material.isMaterial) {
      cleanMaterial(object.material)
    } else {
      // an array of materials
      for (const material of object.material) cleanMaterial(material)
    }
  })
}

const cleanMaterial = (material) => {
  // dispose textures
  for (const key of Object.keys(material)) {
    const value = material[key]

    if (value && typeof value === 'object' && 'minFilter' in value) {
      value.dispose()
    }
  }
  material.dispose()
}
