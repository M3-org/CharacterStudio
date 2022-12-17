import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring'
import useSound from 'use-sound';
import logo from '../../public/ui/landing/logo.png'
import passUrl from "../../public/sound/class_pass.wav"
import clickUrl from "../../public/sound/class_click.wav"
import { useModelingStore, useModelClass, useLoading } from '../store'
import { StyledLanding } from '../styles/landing.styled.js'

import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
import { NoToneMapping } from 'three';
import { sceneService } from '../services/scene'
import { AnimationManager } from '../library/animations/animationManager';

export default function Landing({models}) {
    const setModelClass = useModelClass((state) => state.setModelClass)
    const setLoading = useLoading((state) => state.setLoading)
    const [drophunter, setDrophunter] = useState(Object);
    const [neurohacker, setNeurohacker] = useState(Object);
    const [hovering, setCurrentAvatar] = useState('');

    // get ref camera

    const camera = React.useRef();

    const [cardAnimation, setCardAnimation] = useSpring(() => ({
        from: { x: 0, opacity: 1 },
    }))

    const [titleAnimation, setTitleAnimation] = useSpring(() => ({
        from: { y: 0 },
    }))

    
    const [runOnce, setRunOnce] = useState(false);
    let _runOnce = false;
    useEffect(() => {
        if(runOnce) {
            console.log('runOnce', runOnce)
            Error.stackTraceLimit = 100;
            const stack = new Error().stack;
            console.log(stack);
        }
        if(_runOnce) {
            console.log('_runOnce', _runOnce)
            Error.stackTraceLimit = 100;
            const stack = new Error().stack;
            console.log(stack);
        }
        _runOnce = true;
        setRunOnce(true);
        (async () => {
            async function createModel(item) {
                const animManager = new AnimationManager();
                const vrm = await sceneService.loadModel(item.model);
                await animManager.loadAnimations(item.animation);
                return { vrm, animManager }
            }
            {
                const { vrm, animManager } = await createModel(models[0]);
                animManager.startAnimation(vrm)
                setDrophunter(vrm.scene)
            }
            {
                const { vrm, animManager } = await createModel(models[1]);
                animManager.startAnimation(vrm)
                setNeurohacker(vrm.scene)
            }
            setLoading(false)
        })()
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
        setModelClass(type)
    }
    return (
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
                    setCurrentAvatar('drophunter')
                }}

                onMouseLeave={() => {
                    if (hovering === 'drophunter') {
                        setCurrentAvatar('');
                    }
                }}

                // on mouse click
                onClick={() => {
                    handleClick(1)
                }}
            >
                <div className="drophunter" style={{
                    position: "absolute",
                    bottom: "40px",
                    right: "0px",
                    opacity: hovering === 'drophunter' ? 1 : 0.5,
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
                    setCurrentAvatar('neurohacker')
                }}

                onMouseLeave={() => {
                    if (hovering === 'neurohacker') {
                        setCurrentAvatar('');
                    }
                }}

                // on mouse click
                onClick={() => {
                    handleClick(2)
                }}
            >
                <div className="neurohacker" style={{
                    position: "absolute",
                    bottom: "40px",
                    opacity: hovering === 'neurohacker' ? 1 : 0.5,
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

            {/* simple floating div with sliders to control setCameraFov and setCameraPosition */}
            <div style={{ position: "absolute", top: 0, left: 0, zIndex: 1000 }}>
            </div>
            <Canvas
                style={{
                    width: '100vw',
                    height: '100vh',
                    position: 'fixed',
                }}
                camera={{ fov: 20 }}
                linear={true}
                gl={{ antialias: true, toneMapping: NoToneMapping }}
            >
            <ambientLight
              color={[1,1,1]}
              intensity={0.5}
            />
            
            <directionalLight 
              intensity = {0.5} 
              position = {[3, 1, 5]} 
              shadow-mapSize = {[1024, 1024]}>
              <orthographicCamera 
                attach="shadow-camera" 
                left={-20} 
                right={20} 
                top={20} 
                bottom={-20}/>
            </directionalLight>
            
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
