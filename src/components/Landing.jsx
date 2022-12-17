import { BrightnessContrast, EffectComposer, Glitch } from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import React, { useEffect, useContext, useState } from 'react';
import { animated, useSpring } from 'react-spring';
import useSound from 'use-sound';
import clickUrl from "../../public/sound/class_click.wav";
import passUrl from "../../public/sound/class_pass.wav";
import logo from '../../public/ui/landing/logo.png';
import { AudioContext } from "../context/AudioContext";

import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { Canvas } from "@react-three/fiber";
import { AnimationManager } from '../library/animationManager';
import { SceneContext } from "../context/SceneContext"
import { ViewContext, ViewStates } from "../context/ViewContext"

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

import styled from "styled-components";

const StyledLanding = styled.div `
    height: 100vh;
    width: 100vw;
    background-size : cover; 
    position : fixed;
    align-items : center;
    overflow : hidden;
    top:0;
    left:0;
    right:0;
    bottom:0;
    overflow: hidden;

    .topBanner {
        background : radial-gradient(49.5% 173.11% at 50.84% -79.89%, #95414E 30.36%, rgba(137, 61, 73, 0) 100%);
        width : 1377px;
        top : 0px;
        display : flex;
        flex-direction : column;
        animation: fadeIn 1s ease-in both;
        user-selector : none;
    
        .webaverse-text {
            width: calc(400vh * 0.118);
            height: calc(148.83vh * 0.118);
            display: inline-block;
            margin: 41px auto auto;
            userSelect : none
        }
    
        .studio { 
            color : #61E5F9;
            font-family : 'Proxima';
            font-style : normal; 
            font-weight : 800;
            font-size : calc(30vh * 0.118);
            line-height : calc(49vh * 0.118);
            text-align : center;
            margin-top : calc(12vh * 0.118);
        }
    }
    .subTitle{
        color : white;
        font-family : Proxima;
        font-style : normal;
        font-weight : 400;
        font-size : calc(30vh * 0.118);
        line-height : calc(49vh * 0.118);
        text-align : center;
        margin-top : calc(20vh * 0.118);
        animation: fadeIn 1s ease-in both;
        user-selector : none;
    
        .subTitle-text{
            font-weight : 1200;
            user-select : none;

            .subTitle-desc {
                font-size : calc(20vh * 0.118);
                line-height : calc(37vh * 0.118);
                font-style: normal;
                font-weight: 400;
            }
        }
    }

    .imgs{
        display : flex;
        user-select : none;                        
        margin-top: 30px;
        
        .characterGroup {
                animation-name : fadeleft;
                animation-duration: 0.5s;
                animation-timing-function: ease-in-out; 
                animation-fill-mode: both;
                user-selector : none;
                position: relative;
        }
    }
    
    @font-face {
        font-family: 'Proxima';
        src: url('./font/Proxima/Proxima.otf')  format("opentype");
      }
     
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translate3d(0, -50%, 0);
        }
        to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
        }
    }
    
    @keyframes fadeleft {
        from {
            opacity: 0;
            transform: translate3d(-100%, 0, 0);
        }
        to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
        }
    }
    
    @keyframes fadeRight {
        from {
            opacity: 1;
            transform: skewX(-15deg);
            transform: translate3d(0%, 0, 0);
        }
        to {
            opacity: 0;
            transform: translate3d(1005, 0, 0);
            transform: skewX(-15deg);
        }
    }
`

export default function Landing() {
    const {setCurrentTemplateId, currentTemplateId} = useContext(SceneContext);
    
    const [drophunter, setDrophunter] = useState(null);
    const [neurohacker, setNeurohacker] = useState(null);
    const [selectedAvatar, setSelectedAvatar] = useState(null);

    const { setCurrentView } = useContext(ViewContext);
    const { isMute } = useContext(AudioContext);
    const { loadModel } = useContext(SceneContext);
    const camera = React.useRef();
    const [titleAnimation, setTitleAnimation] = useSpring(() => ({
        from: { y: 0 },
    }))

    useEffect(() => {
        async function createModel(item) {
            const animManager = new AnimationManager();
            const vrm = await loadModel(item.model);
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
            if (!isMute) click();
        setTitleAnimation.start({
            from: {
                y: 0,
            },
            to: {
                y: -window.innerHeight,
            }
        })
        setCurrentTemplateId(type)
        setCurrentView(ViewStates.CREATOR_LOADING)
    }

    useEffect(() => {
        if(!neurohacker || !drophunter) return;
       // setCurrentView(ViewStates.Landing) // TODO, replace with proper load?
    }, [neurohacker, drophunter])

    return neurohacker && drophunter && currentTemplateId === null && (
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
