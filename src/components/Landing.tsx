
import { textAlign } from "@mui/system";
import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring'
import { Triangle } from 'react-loader-spinner'
import useSound from 'use-sound';
import dropHunter from '../ui/landing/drophunter.png'
import neuroHacker from '../ui/landing/neurohacker.png'
import logo from '../ui/landing/logo.png'
import passUrl from "../sound/class_pass.wav"
import clickUrl from "../sound/class_click.wav"
import bgm from "../sound/cc_bgm_balanced.wav"
import {useMuteStore} from '../store'

export default function Landing({
    onSetModel
    }){
    const isMute = useMuteStore((state) => state.isMute)
    const setMute = useMuteStore((state) => state.setMute)

    const [clicked, setClicked] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    
    const [cardAnimation, setCardAnimation] = useSpring(() => ({
     from: { x: 0, opacity : 1 },
    }))

    const [backgroundAnimation, setBackgroundAnimation] = useState(false)
    const [isHovering, setIsHovering] = useState(false);
    const [musicStatus, setMusicStatus] = useState(false);

    const [titleAnimation, setTitleAnimation] = useSpring(() => ({
     from: { y: 0 },
    }))

    const handleLoading = () => {
        setIsLoading(false);
    }
    useEffect(() => {
        window.addEventListener("load", handleLoading);
    }, [])

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
    return !isLoading ? (
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
                    <div className='characterGroup' 
                    onMouseEnter={() => {
                        setIsHovering(true);
                        if(!isMute)
                            play();
                    }}
                    onMouseLeave={() => {
                        setIsHovering(false);
                        stop();
                    }}
                     onClick = {() => handleClick(1)}>
                     <div className="inner">
                        <span className='characterTitle' >Drophunter</span>
                        <img
                            src={dropHunter}
                            className = 'characterImage'
                        />
                    </div>
                    </div>
                    <div className='characterGroup'  
                        onMouseEnter={() => {
                            setIsHovering(true);
                            if(!isMute)
                                play();
                        }}
                        onMouseLeave={() => {
                            setIsHovering(false);
                            stop();
                        }}
                        onClick = {() => handleClick(2)}>
                        <div className="inner">
                        <span className='characterTitle'>Neurohacker</span>
                        <img
                            src={neuroHacker}
                            className = 'characterImage'
                        />
                        </div>
                    </div>
                </animated.div>
            </div>
    ):(
        <Triangle
            height="80"
            width = "80"
            radius = "9"
            color = "green"
            ariaLabel = "Lodaing"
            wrapperStyle = {{
                justifyContent: "center",
                alignItems : "center",
                height : "100vh"
            }}
            wrapperClass= ""
            visible = {true}
            />
    
)}
