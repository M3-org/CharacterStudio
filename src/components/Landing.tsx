
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

        setTimeout(()=> {
            onSetModel(type)
        }, 1000)
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
                            width: '505.7px',
                            height: '148.83px',
                            display: 'inline-block',
                            margin: '41px auto auto'
                        }}
                    />
                    <div className='studio' >Character Studio</div>
                </div>
                <div className="subTitle" >
                    <div style={{
                        lineHeight : "49px",
                        fontWeight : '800',
                        fontSize : '40px'
                    }}>PICK A CLASS
                        <div style={{
                            fontStyle: 'normal',
                            fontWeight: '400',
                            fontSize: '30px',
                            lineHeight: '37px'
                            }}> You'll be able to customzie in a moment 
                        </div>
                    </div>
                </div>
        </animated.div>

        <animated.div 
            className="imgs"
            style={{
                display : 'flex',
                gap: '50px',
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


