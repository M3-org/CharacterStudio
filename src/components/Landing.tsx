/* eslint-disable react/no-unknown-property */
/* eslint-disable no-inline-styles/no-inline-styles */

import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring'
import useSound from 'use-sound';
import LoadingOverlayCircularStatic from './LoadingOverlay';
import logo from '../ui/landing/logo.png'
import passUrl from "../sound/class_pass.wav"
import clickUrl from "../sound/class_click.wav"
import { LandingPop } from './LandingPop';
import { useMuteStore, useModelingStore, useDefaultTemplates, usePreModelClass } from '../store'
import { StyledLanding } from '../styles/landing.styled.js'

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { NoToneMapping, TextureLoader } from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { VRM  } from "@pixiv/three-vrm"
import { sceneService } from '../services/scene'
import { AnimationManager } from '../library/animations/animationManager';

export default function Landing(props){

    const isMute = useMuteStore((state) => state.isMute)
    const setMute = useMuteStore((state) => state.setMute)

    const isModeling = useModelingStore((state) => state.isModeling)
    const isComplete = useModelingStore((state) => state.isComplete)
    const defaultTemplates = useDefaultTemplates((state) => state.defaultTemplates)
    const setPreModelClass = usePreModelClass((state) => state.setPreModelClass)

    const [controls, setControls] = useState<object>(Object);
    const [drophunter, setDrophunter] = useState<object>(Object);
    const [neurohacker, setNeurohacker] = useState<object>(Object);

    const [clicked, setClicked] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
   
    const f_dropHunter = "../3d/models/landing/drop-noWeapon.vrm"
    const m_dropHunter = "../3d/models/landing/landing_m_drophunter.vrm"

    const f_neuroHacker = "../3d/models/landing/f_neurohacker.vrm"
    const m_neuroHacker = "../3d/models/landing/neuro-noWeapon.vrm"

    const [cameraFov, setCameraFov] = useState(20);
    const [cameraPositionX, setCameraPositionX] = useState(0);
    const [cameraPositionY, setCameraPositionY] = useState(-1.45);
    const [cameraPositionZ, setCameraPositionZ] = useState(3.1);

    const anim_female = "../3d/animations/idle_webaverse.fbx";
    const anim_male = "../3d/animations/idle_male.fbx";

    const [hovering, setHovering] = useState('');

    // get ref camera

    const camera = React.useRef();

    const [cardAnimation, setCardAnimation] = useSpring(() => ({
     from: { x: 0, opacity : 1 },
    }))
    
    //should be included in templates
    const [modelArr, setModelArr] = useState([
        {
            index: 1,
            model: f_dropHunter,
            text: 'Dropunter',
            animation: anim_female
        },
        {
            index: 2,
            model: m_neuroHacker,
            text: 'Neurohacker',
            animation: anim_male
        },
        
    ]);

    const [backgroundAnimation, setBackgroundAnimation] = useState(false)
    const [isHovering, setIsHovering] = useState(false);
    const [musicStatus, setMusicStatus] = useState(false);
    const [loadingPercent, setLoadingPercent] = useState(0);

    const [titleAnimation, setTitleAnimation] = useSpring(() => ({
     from: { y: 0 },
    }))

    const handleLoading = () => {
        setIsLoading(false);
        console.log("isloading")
    }


    /////////////////////////////

    useEffect(() => {
        (async () => {
            async function createModel(item){
                const animManager = new AnimationManager();
                const vrm = await sceneService.loadModel(item.model);
                await animManager.loadAnimations(item.animation);
                return {vrm, animManager}
            }

            await (async () => {
                const {vrm, animManager} = await createModel(modelArr[0]);
                animManager.startAnimation(vrm)
                setDrophunter(vrm.scene)
            })();

            await (async () => {
                const {vrm, animManager} = await createModel(modelArr[1]);
                animManager.startAnimation(vrm)
                setNeurohacker(vrm.scene)
            })();


            setIsLoading(false)
            })()
      }, [])

      ////////////////////////////


    useEffect(() => {
        setIsLoading(true)
        // window.addEventListener("load", handleLoading);
    }, [])

    useEffect(() => {
        let sum = 0;
        isModeling.map((item, idx) => {
            if(item !== undefined)
            sum += item;
        })
        
        setLoadingPercent(sum / modelArr.length)
    }, [isModeling])

    useEffect(() => {
        let sum = 0;
        isComplete.map((item, idx) => {
            if(item !== undefined)
            sum += 1;
        })
        
        if(sum === modelArr.length) {
            setIsLoading(false)
        }
    }, [isComplete])

    const [play] = useSound(
        passUrl,
        { volume: 1.0 }
      );

    const [click] = useSound(
        clickUrl,
        { volume: 1.0 }
    );

    const handleClick = (type)=> {
        if(!isMute)
            click();
        setCardAnimation.start({
          from: {
            opacity : 1,
            x: 0,
          },
          to: {
            opacity : 0,
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
        setBackgroundAnimation(true)
        setTimeout(() => {
            setPreModelClass(type)    
        }, 500)
    }
    return (
        <StyledLanding>
            {
                isLoading && (
                    <LoadingOverlayCircularStatic
                        loadingModelProgress={loadingPercent}
                        background={true}
                        title={"Loading Avatars"}
                    />
                )
            }

                    <div className="drophunter" style={{
                        position: "absolute",
                        bottom: "40px",
                        right: "0px",
                        opacity: hovering === 'neurohacker' ? 1 : 0.5,
                        zIndex: 10
                    }}

                    onMouseEnter={() => {
                        setHovering('neurohacker')
                    }}

                    onMouseLeave={() => {
                        if(hovering === 'neurohacker'){
                            setHovering('');
                        }
                    }}

                    // on mouse click
                    onClick={() => {
                        handleClick(1)
                    }}
                    >
                        <img src={"public/DropHunter.svg"} />
                    </div>

                    <div className="neurohacker" style={{
                        position: "absolute",
                        bottom: "40px",
                        left: "0px",
                        opacity: hovering === 'drophunter' ? 1 : 0.5,
                        zIndex: 10
                    }}
                    
                    onMouseEnter={() => {
                        setHovering('drophunter')
                    }}

                    onMouseLeave={() => {
                        if(hovering === 'drophunter'){
                            setHovering('');
                        }
                    }}

                    // on mouse click
                    onClick={() => {
                        handleClick(2)
                    }}
                    >
                        <img src={"public/NeuralHacker.svg"} />
                    </div>

        <animated.div style = {{...titleAnimation}}>
                    <div className="topBanner" >     

                        <img className ="webaverse-text" src={logo} />
                        <div className='studio' >Character Studio</div>
                    </div>
                    <div className="subTitle" >
                        <div className='subTitle-text'>Pick a Class
                            <div className="subTitle-desc"> You'll be able to customize in a moment.</div>
                        </div>

                    </div>
        </animated.div>

            {/* simple floating div with sliders to control setCameraFov and setCameraPosition */}
            <div style={{position: "absolute", top: 0, left: 0, zIndex: 1000}}>
            </div>
                <Canvas
                style = {{
                    // width: "calc(100%)",
                    // position: "absolute",
                    width : '100vw',
                    height : '100vh',
                    position: 'fixed',
                }}
                camera={{ fov: cameraFov }}
                gl={{ antialias: true, toneMapping: NoToneMapping }}
                //linear
                //className="canvas"
                >
                <directionalLight 
                    //castShadow = {true}
                    intensity = {1} 
                    color = {[0.6,.8,1]}
                    position = {[-2, 3, 6]} 
                    intensity={.2}
                    shadow-mapSize = {[1024, 1024]}>
                </directionalLight>
                <ambientLight
                    color={[0.6,0.9,1]}
                intensity={0.5}
                />
                <PerspectiveCamera
                    ref={camera}
                    fov={20}
                    position = {[cameraPositionX, cameraPositionY, cameraPositionZ]}
                    rotation = {[-0,0,0]}
                    onUpdate = {self => self.updateProjectionMatrix()}
                >
                <mesh position={[.4, 0, 0]} rotation={[0, -1, 0]}>
                    <primitive object={drophunter} />
                </mesh>
                <mesh position={[-.4, 0, 0]} rotation={[0, 1, 0]}>
                <primitive object={neurohacker} />
                </mesh>

                </PerspectiveCamera>
            </Canvas>
        </StyledLanding>)}
