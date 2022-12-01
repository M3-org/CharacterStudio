
import React, { useState, useEffect } from 'react';
import { useSpring, animated } from 'react-spring'
import useSound from 'use-sound';
import LoadingOverlayCircularStatic from './LoadingOverlay';
import logo from '../ui/landing/logo.png'
import passUrl from "../sound/class_pass.wav"
import clickUrl from "../sound/class_click.wav"
import ModelCanvas from './ModelCanvas';
import { LandingPop } from './LandingPop';
import { useMuteStore, useModelingStore, useDefaultTemplates } from '../store'
import { StyledLanding } from '../styles/landing.styled.js'


export default function Landing(props){

    const {
        onSetModel,
    }:any = props;
    
    const isMute = useMuteStore((state) => state.isMute)
    const setMute = useMuteStore((state) => state.setMute)

    const isModeling = useModelingStore((state) => state.isModeling)
    const isComplete = useModelingStore((state) => state.isComplete)
    const defaultTemplates = useDefaultTemplates((state) => state.defaultTemplates)

    const [clicked, setClicked] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
   
    const f_dropHunter = "../3d/models/f_drophunter_v1.vrm"
    const m_dropHunter = "../3d/models/m_drophunter_v1.vrm"

    const f_neuroHacker = "../3d/models/f_neurohacker_v1.vrm"
    const m_neuroHacker = "../3d/models/m_neurohacker_v1.vrm"

    const anims = "../3d/animations/idle_sword.fbx";
    const [cardAnimation, setCardAnimation] = useSpring(() => ({
     from: { x: 0, opacity : 1 },
    }))
    
    //should be included in templates
    const [modelArr, setModelArr] = useState([
        {
            index: 1,
            model: f_dropHunter,
            text: 'Drop Hunter',
            animation: anims
        },
        {
            index: 2,
            model: m_dropHunter,
            text: 'Drop Hunter',
            animation: anims
        },
        {
            index: 3,
            model: f_neuroHacker,
            text: 'Neuro Hacker',
            animation: anims
        },
        {
            index: 4,
            model: m_neuroHacker,
            text: 'Neuro Hacker',
            animation: anims
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
        <StyledLanding>
            {
                isLoading && (
                    <LoadingOverlayCircularStatic
                        loadingModelProgress={loadingPercent}
                        background={true}
                    />
                )
            }
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
            <animated.div 
                className="imgs"
                style={{
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
                            <ModelCanvas 
                                modelPath={item.model} 
                                animation = {item.animation} 
                                order = {item.index} 
                            />
                        </div>
                    ))
                }
            </animated.div>
        </StyledLanding>)}
