/* eslint-disable react/no-unknown-property */
import {
  BrightnessContrast,
  EffectComposer,
  Glitch
} from "@react-three/postprocessing"
import { GlitchMode } from "postprocessing"
import React, { useContext, useEffect, useState } from "react"
import useSound from "use-sound"
import clickUrl from "../../public/sound/class_click.wav"
import passUrl from "../../public/sound/class_pass.wav"
import { AudioContext } from "../context/AudioContext"

import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera"
import { Canvas } from "@react-three/fiber"
import { SceneContext } from "../context/SceneContext"
import { ViewContext, ViewStates } from "../context/ViewContext"
import { AnimationManager } from "../library/animationManager"

import CustomButton from "./custom-button"
import styles from "./Landing.module.css"

const dropHunter = "../3d/models/landing/drop-noWeapon.vrm"
const neuroHacker = "../3d/models/landing/neuro-noWeapon.vrm"

const anim_drophunter = "../3d/animations/idle_drophunter.fbx"
const anim_neurohacker = "../3d/animations/idle_neurohacker.fbx"

const Classes = {
  DROPHUNTER: {
    index: 0,
    model: dropHunter,
    text: "Dropunter",
    animation: anim_drophunter,
  },
  NEUROHACKER: {
    index: 1,
    model: neuroHacker,
    text: "Neurohacker",
    animation: anim_neurohacker,
  },
}

export default function Landing() {
  const { setCurrentTemplate, currentTemplate, loadModel } =
    useContext(SceneContext)
  const { currentView, setCurrentView } = useContext(ViewContext)
  const { isMute } = useContext(AudioContext)

  const [drophunter, setDrophunter] = useState(null)
  const [neurohacker, setNeurohacker] = useState(null)
  const [selectedAvatar, setSelectedAvatar] = useState(null)

  const camera = React.useRef()

  useEffect(() => {
    async function createModel(item) {
      const animManager = new AnimationManager()
      const vrm = await loadModel(item.model)
      await animManager.loadAnimations(item.animation)
      return { vrm, animManager }
    }
    createModel(Classes.DROPHUNTER).then(({ vrm, animManager }) => {
      animManager.startAnimation(vrm)
      setDrophunter(vrm.scene)
    })
    createModel(Classes.NEUROHACKER).then(({ vrm, animManager }) => {
      animManager.startAnimation(vrm)
      setNeurohacker(vrm.scene)
    })
    return () => {
      // cleanup the models from the scene
      // remove drop hunter
      if (drophunter !== null) {
        const { scene } = drophunter
        scene.parent.remove(scene)
      }

      // remove neurohacker
      if (neurohacker !== null) {
        const { scene } = neurohacker
        scene.parent.remove(scene)
      }

      setDrophunter(null)
      setNeurohacker(null)
    }
  }, [])

  const [play] = useSound(passUrl, { volume: 1.0 })

  const [click] = useSound(clickUrl, { volume: 1.0 })

  const handleClick = (type) => {
    if (!isMute) click()
    console.log("type is", type)
    setCurrentTemplate(type)
    console.log("ViewStates.CREATOR_LOADING", ViewStates.CREATOR_LOADING)
    setCurrentView(ViewStates.CREATOR_LOADING)
  }

  useEffect(() => {
    if (
      !neurohacker ||
      !drophunter ||
      currentView !== ViewStates.LANDER_LOADING
    )
      return
    setCurrentView(ViewStates.LANDER)
    console.log("ViewStates.LANDER", ViewStates.LANDER)
  }, [neurohacker, drophunter, currentView])

  console.log("currentView", currentView)

  return (
    currentView &&
    neurohacker &&
    drophunter &&
    currentTemplate === null &&
    currentView.includes("LANDER") && (
      <div className={styles["StyledLanding"]}>
        <div
          className={[styles["selection-box"], styles["right"]].join(" ")}
          onMouseEnter={() => {
            setSelectedAvatar(drophunter)
          }}
          onMouseLeave={() => {
            if (selectedAvatar === drophunter) {
              setSelectedAvatar(null)
            }
          }}
        >
          <div className={styles.backdrop} />
          <div className={styles["box"]}>
            <h2>Drop Hunter</h2>
            <p>
              +ATK +SPD // SUPERCHARGER
            </p>
            <CustomButton
              theme="light"
              text="Select"
              icon="classDropHunter"
              size={16}
              onClick={() => {
                handleClick(Classes.DROPHUNTER)
              }}
            />
          </div>
        </div>
        <div
          className={[styles["selection-box"], styles["left"]].join(" ")}
          onMouseEnter={() => {
            setSelectedAvatar(neurohacker)
          }}
          onMouseLeave={() => {
            if (selectedAvatar === neurohacker) {
              setSelectedAvatar(null)
            }
          }}
        >
          <div className={styles.backdrop} />
          <div className={styles["box"]}>
            <h2>Neuro Hacker</h2>
            <p>
              +ATK +SPR // STEALTH ATTACK
            </p>
            <CustomButton
              theme="light"
              text="Select"
              icon="classNeuralHacker"
              size={16}
              onClick={() => {
                handleClick(Classes.NEUROHACKER)
              }}
            />
          </div>
        </div>

        <div className={styles["subTitle-text"]}>
          Pick a Class
          <div className={styles["subTitle-desc"]}>
            {" "}
            You will be able to customize in a moment.
          </div>
        </div>
        <Canvas
          style={{
            width: "100vw",
            height: "100vh",
            position: "fixed",
            top: 0
          }}
          camera={{ fov: 20 }}
          linear={false}
          gl={{ antialias: true }}
        >
          <EffectComposer>
            <BrightnessContrast
              brightness={0} // brightness. min: -1, max: 1
              contrast={0.2} // contrast: min -1, max: 1
            />
            <Glitch
              delay={[1.5, 6.0]} // min and max glitch delay
              duration={[0.08, 0.3]} // min and max glitch duration
              strength={[0.1, 0.3]} // min and max glitch strength
              mode={GlitchMode.SPORADIC} // glitch mode
              active // turn on/off the effect (switches between "mode" prop and GlitchMode.DISABLED)
              ratio={0.3} // Threshold for strong glitches, 0 - no weak glitches, 1 - no strong glitches.
            />
          </EffectComposer>

          <directionalLight
            intensity={0.5}
            position={[3, 1, 5]}
            shadow={false}
          />
          <PerspectiveCamera
            ref={camera}
            fov={20}
            position={[0, -1.45, 3.1]}
            rotation={[-0, 0, 0]}
            onUpdate={(self) => self.updateProjectionMatrix()}
          >
            <mesh position={[0.4, 0, 0]} rotation={[0, -1, 0]}>
              <primitive object={drophunter} />
            </mesh>
            <mesh position={[-0.4, 0, 0]} rotation={[0, 1, 0]}>
              <primitive object={neurohacker} />
            </mesh>
          </PerspectiveCamera>
        </Canvas>
      </div>
    )
  )
}
