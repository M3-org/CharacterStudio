
import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring'
import { Triangle } from 'react-loader-spinner'
import useSound from 'use-sound';
import dropHunter from '../ui/landing/drophunter.png'
import neuroHacker from '../ui/landing/neurohacker.png'
import LoadingOverlayCircularStatic from './LoadingOverlay';
import logo from '../ui/landing/logo.png'
import passUrl from "../sound/class_pass.wav"
import clickUrl from "../sound/class_click.wav"
import bgm from "../sound/cc_bgm_balanced.wav"
import {useMuteStore, useModelingStore} from '../store'

import ModelCanvas from './ModelCanvas';
import { LandingPop } from './LandingPop';

export default function Landing({
    onSetModel
    }){
    const isMute = useMuteStore((state) => state.isMute)
    const setMute = useMuteStore((state) => state.setMute)

    const isModeling = useModelingStore((state) => state.isModeling)
    const isComplete = useModelingStore((state) => state.isComplete)

    const [clicked, setClicked] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
   
    const dropHunterModel = "../3d/models/landing_model_1.vrm"
    const neuroHackerModel = "../3d/models/landing_model_2.vrm"
    const [cardAnimation, setCardAnimation] = useSpring(() => ({
     from: { x: 0, opacity : 1 },
    }))
    
    const [modelArr, setModelArr] = useState([
        {
            index: 1,
            model: dropHunterModel,
            text: 'Drop Hunter'
        },
        {
            index: 2,
            model: neuroHackerModel,
            text: 'Neuro Hacker'
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
    }
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
        
        console.log('$$$', sum / modelArr.length)
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
            onSetModel(type)    
        }, 500)
    }
    return (
        <div 
            style = {{
                height: '100vh',
                backgroundSize : 'cover',
                display : 'flex',
                flexDirection : 'column',
                alignItems : 'center',
                overflow : 'hidden',
            }
            }
            >
                {
                    isLoading && (
                        <LoadingOverlayCircularStatic
                            loadingModelProgress={loadingPercent}
                            background={true}
                        />
                    )
                }
                <animated.div style = {{...titleAnimation}}>
                       <div className="topBanner" style={{
                       }} >     
                            <img 
                                src={logo} 
                                style = {{
                                    display: 'inline-block',
                                    margin: '41px auto auto',
                                    userSelect : "none"
                                }}
                            />
                            <div className='studio' >Character Studio</div>
                        </div>
                        <div className="subTitle" >
                            <div style={{
                                fontWeight : '1200',
                                userSelect : "none"
                            }}>Pick a Class
                                <div 
                                    style={{
                                        fontStyle: 'normal',
                                        fontWeight: '400',
                                    }}
                                    className="subTitle-desc"
                                > You'll be able to customize in a moment 
                                </div>
                            </div>
                        </div>
                </animated.div>
                <animated.div 
                    className="imgs"
                    style={{
                        display : 'flex',
                        gap: '50px',
                        userSelect : "none",                        
                        marginTop: '30px',
                          ...cardAnimation,
                    }}
                >
                    {
                        modelArr.map((item, idx) => (
                            <div className='characterGroup' key={idx}
                                onMouseEnter={() => {
                                    setIsHovering(true);
                                    if(!isMute)
                                        play();
                                }}
                                onMouseLeave={() => {
                                    setIsHovering(false);
                                    stop();
                            }}
                            onClick = {() => handleClick(item.index)}
                            >
                                <LandingPop className="landingPop" text={item.text} />
                                <ModelCanvas modelPath={item.model} order = {item.index} />
                            </div>
                        ))
                    }
                </animated.div>
            </div>)
    }
