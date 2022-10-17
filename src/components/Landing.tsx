
import { textAlign } from "@mui/system";
import React, { useState } from 'react';
import { useSpring, animated } from 'react-spring'

export default function Landing({
    onSetModel
    }){

    const [clicked, setClicked] = useState(false);

    const [cardAnimation, setCardAnimation] = useSpring(() => ({
     from: { x: 0, opacity : 1 },
    }))

    const [titleAnimation, setTitleAnimation] = useSpring(() => ({
     from: { y: 0 },
    }))


    const handleClick = (type)=> {
        setTimeout (() => {
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
        }, 1000)
        onSetModel(type)
    }
    return <div style = {{
        background : `url("/background.png") no-repeat center center fixed`,
        height : "100vh",
        backgroundSize : 'cover',
        display : 'flex',
        flexDirection : 'column',
        alignItems : 'center',
        overflow : 'hidden'
    }
    }>
        <animated.div style = {{...titleAnimation}}>
               <div className="topBanner" style={{
               }} >     
                    <img 
                        src={"/logo.png"} 
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
                        > You'll be able to customzie in a moment 
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
             onClick = {() => handleClick(1)}>
             <div className="inner">
                <span className='characterTitle' >Drophunter</span>
                <img
                    src={'/drophunter.png'}
                    className = 'characterImage'
                />
            </div>
            </div>
            <div className='characterGroup'  
                onClick = {() => handleClick(2)}>
                <div className="inner">
                <span className='characterTitle'>Neurohacker</span>
                <img
                    src={'/neurohacker.png'}
                    className = 'characterImage'
                />
                </div>
            </div>
        </animated.div>
    </div>
}
