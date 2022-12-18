import { MeshReflectorMaterial } from "@react-three/drei/core/MeshReflectorMaterial"
import { OrbitControls } from "@react-three/drei/core/OrbitControls"
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera"
import { Canvas } from "@react-three/fiber"
import React, { useRef, useState, useContext, useEffect } from "react"
import { NoToneMapping } from "three"
import Editor from "./Editor"
import Selector from "./Selector"
import { animated, useSpring } from "react-spring"
import { addModelData, getSkinColor } from "../library/utils"
import * as THREE from "three"
import { SceneContext } from "../context/SceneContext"

import { AnimationManager } from "../library/animationManager"

import logo from "../../public/ui/weba.png"

import styled from 'styled-components';
import pngMainBackground from "../../public/ui/mainBackground.png"
import { ViewContext, ViewStates } from "../context/ViewContext"

const FitParentContainer = styled.div`
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow : hidden;
`

const ScreenSizeContainer = styled.div`
    height: 100vh;
    width: 100vw;
    position: absolute;
    top: 0;
`

const Background = styled(ScreenSizeContainer)`
  background : url(${pngMainBackground});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  overflow: hidden;
`

export default function Scene({template}) {
  const {
    scene,
    setScene,
    setCamera,
    loadModel,
    currentTemplateId,
    model,
    setModel,
  } = useContext(SceneContext)
  const {currentView, setCurrentView} = useContext(ViewContext)

  const [loading, setLoading] = useState(false)
  const controls = useRef()
  const templateInfo = template && template[currentTemplateId]

  // if currentView is CREATOR_LOADING, show loading screen
  // load the assets
  // once templateInfo, currentTemplateId, and models are loaded, move to CREATOR view

  useEffect(() => {
    if(!templateInfo || currentTemplateId === null || currentView !== ViewStates.CREATOR_LOADING) {
      if(!loading) setLoading(true)
      return
    }

    loadModel(templateInfo.file).then(async (vrm) => {
      const animationManager = new AnimationManager(templateInfo.offset)
      addModelData(vrm, { animationManager: animationManager })

      if (templateInfo.animationPath) {
        await animationManager.loadAnimations(templateInfo.animationPath)
        animationManager.startAnimation(vrm)
      }
      addModelData(vrm, { cullingLayer: 0 })

      getSkinColor(vrm.scene, templateInfo.bodyTargets)
      setModel(vrm)

      scene.add(vrm.scene)

      setCurrentView(ViewStates.CREATOR)
    })
    
    return () => {
      if(model) {
        setModel(null)
        setScene(new THREE.Scene())
      }
    }

  }, [templateInfo, currentTemplateId])

  const animatedStyle = useSpring({
    from: { opacity: "0" },
    to: { opacity: "1" },
    config: { duration: "2500" },
  })

  const canvasStyle = { width: "100vw", display: "flex", position: "absolute" }

  return (
  currentView === ViewStates.CREATOR) && (
    <animated.div style={animatedStyle}>
      <FitParentContainer>
        <Background>
          <div
            id={"webamark"}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100vw",
              height: "100vh",
            }}
          >
            <img
              src={logo}
              style={{
                // place in the center of the screen
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "100vh",
                height: "100vh",
                opacity: 0.05,
              }}
            />
          </div>
          <Canvas
            id="editor-scene"
            style={canvasStyle}
            gl={{ antialias: true, toneMapping: NoToneMapping }}
            camera={{ fov: 30, position: [0, 1.3, 2] }}
          >
            <ambientLight color={[1, 1, 1]} intensity={0.5} />

            <directionalLight
              intensity={0.5}
              position={[3, 1, 5]}
              shadow-mapSize={[1024, 1024]}
            >
              <orthographicCamera
                attach="shadow-camera"
                left={-20}
                right={20}
                top={20}
                bottom={-20}
              />
            </directionalLight>

            <OrbitControls
              ref={controls}
              minDistance={1}
              maxDistance={4}
              maxPolarAngle={Math.PI / 2 - 0.1}
              enablePan={true}
              autoRotateSpeed={5}
              enableDamping={true}
              dampingFactor={0.1}
              target={[0, 1.1, 0]}
            />

            <PerspectiveCamera
              ref={setCamera}
              aspect={1200 / 600}
              fov={30}
              onUpdate={(self) => self.updateProjectionMatrix()}
            >

            <mesh>
              <primitive object={scene} />
            </mesh>

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
                <circleGeometry args={[0.6, 64]} />
                <MeshReflectorMaterial
                  blur={[100, 100]}
                  opacity={1}
                  resolution={1024}
                  mixBlur={0}
                  mixStrength={10}
                  depthScale={0.5}
                  minDepthThreshold={1}
                  color="#ffffff"
                  metalness={0.9}
                  roughness={1}
                />
              </mesh>
            </PerspectiveCamera>
          </Canvas>
        </Background>
        <Selector templateInfo={templateInfo} />
        <Editor templateInfo={templateInfo} controls={controls.current} />

      </FitParentContainer>
    </animated.div>
  )
}