import { useFrame } from '@react-three/fiber'
import useStore, { getState, setState } from './store'
import { useSpring } from '@react-spring/core'

export default function useCameraPostProcess() {
  const startCameraPPAnim = useStore((s) => s.startCameraPPAnim)
  const { factor } = useSpring({
    factor: startCameraPPAnim ? 1 : 0,
    delay: 0,
    config: {
      duration: 1600,
    },
  })

  let time = 0
  useFrame((state, delta) => {
    time += delta
    setState({ time, factor: factor.get() })
  })

  let uFactor = null
  let uTime = null
  let initUniforms = false
  window.XR8.addCameraPipelineModule({
    name: 'camerafbo',
    onProcessCpu: ({ processGpuResult }) => {
      const { renderer } = window.XR8.Threejs.xrScene()
      const glc = renderer.getContext()
      const { shader } = processGpuResult.gltexturerenderer
      const { time, factor } = getState()

      glc.useProgram(shader)
      if (!initUniforms) {
        uFactor = glc.getUniformLocation(shader, 'factor')
        uTime = glc.getUniformLocation(shader, 'time')
        initUniforms = true
      }
      glc.uniform1f(uTime, time)
      glc.uniform1f(uFactor, factor)
    },
  })

  return null
}
