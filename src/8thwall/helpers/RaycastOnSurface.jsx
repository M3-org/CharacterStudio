import * as THREE from 'three'
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import useStore, { setState } from './store'
import { GradientMaterial } from './GradientMaterial'

extend({ GradientMaterial })

export const RayCastSurface = () => {
  const surface = useRef(null)
  useEffect(() => {
    setState({ surface })
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position-y={-0.001} ref={surface}>
      <planeBufferGeometry args={[100, 100]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

export const AttachRaycastOnSurface = forwardRef(({ children, ...props }, ref) => {
  const localRef = useRef(null)
  const selector = useRef(null)
  const surface = useStore((s) => s.surface)
  const [maxBbox, setMaxBbox] = useState(1)
  const dummy = useMemo(() => new THREE.Vector3(), [])
  const dummySelector = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const dummySize = useMemo(() => new THREE.Vector3(), [])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const { camera } = useThree()

  useEffect(() => {
    if (localRef.current) {
      const bbox = new THREE.Box3().setFromObject(localRef.current)
      bbox.getSize(dummySize)
      // divide by 2 because it's a the radius
      setMaxBbox(Math.max(dummySize.x, dummySize.z) / 2)

      dummy.copy(localRef.current.position)
      dummySelector.copy(localRef.current.position)
    }
  }, [ref])

  useFrame(() => {
    const { setPos, setScale, mousePos, idActive } = useStore.getState()
    camera.position.y = 3
    if (localRef.current.id !== idActive) return

    if (setPos) {
      // Update the picking ray with the camera and tap position.
      raycaster.setFromCamera({ x: mousePos.x, y: mousePos.y }, camera)

      const intersects = raycaster.intersectObject(surface.current)

      if (intersects.length === 1 && intersects[0].object === surface.current) {
        dummy.set(intersects[0].point.x, 0.2, intersects[0].point.z)
      }
    } else {
      dummy.y = 0
    }
    localRef.current.position.lerp(dummy, 0.14)
    localRef.current.scale.setScalar(THREE.MathUtils.lerp(localRef.current.scale.x, setScale, 0.14))
    dummySelector.copy(dummy)

    if (selector.current.material) {
      selector.current.material.uniforms.opacity.value = THREE.MathUtils.lerp(
        selector.current.material.uniforms.opacity.value,
        Math.abs(localRef.current.scale.x - setScale) > 0.05 ? 0.7 : 0.7,
        0.14,
      )
      selector.current.material.uniforms.shadow.value = THREE.MathUtils.lerp(selector.current.material.uniforms.shadow.value, setPos ? 0 : 1, 0.33)
    }
  })
  return (
    <group
      ref={localRef}
      {...props}
      onPointerDown={() => {
        setState({ idActive: localRef.current.id })
      }}>
      {children}
      <mesh ref={selector} rotation-x={-Math.PI / 2} position-y={-1}>
        <circleBufferGeometry args={[maxBbox, 32]} />
        <gradientMaterial key={GradientMaterial.key} transparent uniforms-opacity-value={0} blending={THREE.NormalBlending} />
      </mesh>
    </group>
  )
})
