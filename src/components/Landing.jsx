import { BrightnessContrast, EffectComposer, Glitch, Noise, ToneMapping, Vignette } from '@react-three/postprocessing';
import { Scanline } from '@react-three/postprocessing'
import { Environment } from "@react-three/drei";
import { HueSaturation } from '@react-three/postprocessing'

import { BlendFunction, GlitchMode } from 'postprocessing';
import React, { useEffect, useContext, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import useSound from 'use-sound';
import clickUrl from "../../public/sound/class_click.wav";
import passUrl from "../../public/sound/class_pass.wav";
import logo from '../../public/ui/landing/logo.png';
import { ApplicationContext } from "../ApplicationContext";
import { StyledLanding } from '../styles/landing.styled.js';

import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { Canvas } from "@react-three/fiber";
import { AnimationManager } from '../library/animations/animationManager';
import { sceneService } from '../services/scene';

const dropHunter = "../3d/models/landing/drop-noWeapon.vrm"
const neuroHacker = "../3d/models/landing/neuro-noWeapon.vrm"

const anim_drophunter = "../3d/animations/idle_drophunter.fbx";
const anim_neurohacker = "../3d/animations/idle_neurohacker.fbx";

const models = [
  {
      index: 0,
      model: dropHunter,
      text: 'Dropunter',
      animation: anim_drophunter
  },
  {
      index: 1,
      model: neuroHacker,
      text: 'Neurohacker',
      animation: anim_neurohacker
  }
];

export default function Landing() {
    const {setSelectedCharacterClass, selectedCharacterClass, setLoading} = useContext(ApplicationContext);
    const [drophunter, setDrophunter] = useState(null);
    const [neurohacker, setNeurohacker] = useState(null);
    const [selectedAvatar, setSelectedAvatar] = useState(null);

    // get ref camera

    const camera = React.useRef();

    const [cardAnimation, setCardAnimation] = useSpring(() => ({
        from: { x: 0, opacity: 1 },
    }))

    const [titleAnimation, setTitleAnimation] = useSpring(() => ({
        from: { y: 0 },
    }))

    useEffect(() => {
        async function createModel(item) {
            const animManager = new AnimationManager();
            const vrm = await sceneService.loadModel(item.model);
            await animManager.loadAnimations(item.animation);
            return { vrm, animManager }
        }
        createModel(models[0]).then(({ vrm, animManager }) => {
            animManager.startAnimation(vrm)
            setDrophunter(vrm.scene)
        });
        createModel(models[1]).then(({ vrm, animManager }) => {
            animManager.startAnimation(vrm)
            setNeurohacker(vrm.scene)
        });
    }, [])

    const [play] = useSound(
        passUrl,
        { volume: 1.0 }
    );

    const [click] = useSound(
        clickUrl,
        { volume: 1.0 }
    );

    const handleClick = (type) => {
            click();
        setCardAnimation.start({
            from: {
                opacity: 1,
                x: 0,
            },
            to: {
                opacity: 0,
                x: window.innerWidth,
            }
        })
        setTitleAnimation.start({
            from: {
                y: 0,
            },
            to: {
                y: -window.innerHeight,
            }
        })
        console.log('setSelectedCharacterClass', type)
        setSelectedCharacterClass(type)
    }

    useEffect(() => {
        if(!neurohacker || !drophunter) return;
        setLoading(false)
    }, [neurohacker, drophunter])

    return neurohacker && drophunter && selectedCharacterClass === null && (
        <StyledLanding>
            <div className='drophunter-container' style={{
                position: "absolute",
                right: "0px",
                zIndex: 10,
                marginTop: "30vh",
                height: "70vh",
                width: "40vw",
            }}

                onMouseEnter={() => {
                    setSelectedAvatar(drophunter)
                }}

                onMouseLeave={() => {
                    if (selectedAvatar === drophunter) {
                        setSelectedAvatar(null);
                    }
                }}

                // on mouse click
                onClick={() => {
                    handleClick(0)
                }}
            >
                <div className="drophunter" style={{
                    position: "absolute",
                    bottom: "40px",
                    right: "0px",
                    opacity: selectedAvatar === drophunter ? 1 : 0.5,
                }}
                >
                    <img
                        style={{
                            maxWidth: "30vh",
                            minWidth: "30em"
                        }}
                        src={"./DropHunter.svg"} />
                </div>
            </div>
            <div className='neurohacker-container' style={{
                position: "absolute",
                bottom: "0px",
                left: "0px",
                zIndex: 10,
                marginTop: "30vh",
                height: "70vh",
                width: "40vw",
            }}
                onMouseEnter={() => {
                    setSelectedAvatar(neurohacker)
                }}

                onMouseLeave={() => {
                    if (selectedAvatar === neurohacker) {
                        setSelectedAvatar(null);
                    }
                }}

                // on mouse click
                onClick={() => {
                    handleClick(1)
                }}
            >
                <div className="neurohacker" style={{
                    position: "absolute",
                    bottom: "40px",
                    opacity: selectedAvatar === neurohacker ? 1 : 0.5,
                }}
                >
                    <img
                        style={{
                            maxWidth: "30vh",
                            minWidth: "30em"
                        }}
                        src={"./Neurohacker.svg"}
                    />
                </div>
            </div>

            <animated.div style={{ ...titleAnimation }}>
                <div className="topBanner" >
                    <img className="webaverse-text" src={logo} />
                    <div className='studio' >Character Studio</div>
                </div>
                <div className="subTitle" >
                    <div className='subTitle-text'>Pick a Class
                        <div className="subTitle-desc"> You will be able to customize in a moment.</div>
                    </div>

                </div>
            </animated.div>

            <div style={{ position: "absolute", top: 0, left: 0, zIndex: 1000 }}>
            </div>

            <Canvas
                style={{
                    width: '100vw',
                    height: '100vh',
                    position: 'fixed',
                }}
                camera={{ fov: 20 }}
                linear={false}
                gl={{ antialias: true }}
            >

            <EffectComposer>
              <BrightnessContrast
              brightness={0} // brightness. min: -1, max: 1
              contrast={.2} // contrast: min -1, max: 1
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
              intensity = {0.5} 
              position = {[3, 1, 5]} 
              shadow={false}
            />            
                <PerspectiveCamera
                    ref={camera}
                    fov={20}
                    position={[0, -1.45, 3.1]}
                    rotation={[-0, 0, 0]}
                    onUpdate={self => self.updateProjectionMatrix()}
                >
                    <mesh position={[.4, 0, 0]} rotation={[0, -1, 0]}>
                        <primitive object={drophunter} />
                    </mesh>
                    <mesh position={[-.4, 0, 0]} rotation={[0, 1, 0]}>
                        <primitive object={neurohacker} />
                    </mesh>
                </PerspectiveCamera>
            </Canvas>
        </StyledLanding>)
}
