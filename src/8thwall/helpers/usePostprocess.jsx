import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useEffect, useMemo } from 'react'
import shaderFbo from '../shaders/shaderFbo'
import { getFullscreenTriangle } from '../helpers/getFullScreen'
import { disposeAll } from '../helpers/disposeAll'

export default function usePostProcess() {
  const { scene, camera, size, gl } = useThree()

  const [renderTarget, postScene, postCamera] = useMemo(() => {
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const renderTarget = new THREE.WebGLRenderTarget(512, 512)

    renderTarget.texture.generateMipmaps = false
    renderTarget.depthBuffer = true
    renderTarget.depthTexture = new THREE.DepthTexture()
    renderTarget.depthTexture.format = THREE.DepthFormat
    renderTarget.depthTexture.type = THREE.UnsignedShortType

    renderTarget.stencilBuffer = false
    renderTarget.texture.format = THREE.RGBFormat
    renderTarget.samples = 4

    shaderFbo.uniforms.tDiffuse.value = renderTarget.texture
    shaderFbo.uniforms.tDepth.value = renderTarget.depthTexture

    shaderFbo.uniforms.uRes.value = new THREE.Vector2(size.width, size.height)

    // Fullscreen triangle
    const postScene = new THREE.Scene()

    const postGeometry = getFullscreenTriangle()

    const screen = new THREE.Mesh(postGeometry, shaderFbo)
    screen.frustumCulled = false
    postScene.add(screen)
    postScene.background = new THREE.Color(0x212121)

    return [renderTarget, postScene, postCamera]
  }, [])

  useEffect(() => {
    return () => {
      renderTarget.dispose()
      disposeAll(postScene)
    }
  }, [])
  useEffect(() => {
    renderTarget.setSize(size.width, size.height)
    shaderFbo.uniforms.uRes.value = new THREE.Vector2(size.width, size.height)
  }, [renderTarget, size])

  window.XR8.addCameraPipelineModule({
    name: 'fbo',
    onRender() {
      gl.setRenderTarget(renderTarget)
      gl.render(scene, camera)

      gl.setRenderTarget(null)
      gl.render(postScene, postCamera)
    },
  })

  return {
    renderTarget: renderTarget,
  }
}
