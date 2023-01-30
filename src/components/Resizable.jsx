import React, { useState } from 'react';
import styles from "./Resizable.module.css"

const ResizableDiv = ({setScreenshotPosition, screenshotPosition}) => {
    
    const [initialPos,   setInitialPos] = useState(null);
    const [initialSize, setInitialSize] = useState(null);

    const [moving, setMoving] = useState(false)
    const [scaling, setScaling] = useState(false)

    const handleMouseMove = (e) => { 
        //console.log(moving)
        if (moving){
            let draggable = document.getElementById('Screenshot-block');
            let resizable = document.getElementById('screenshots');

            const posX = (e.clientX - resizable.offsetWidth/2)// + initialPos.x
            const posY = (e.clientY - resizable.offsetHeight/2)// + initialPos.y
        
            draggable.style.paddingTop = `${posY}px`

            draggable.style.paddingLeft = `${posX}px`

            setScreenshotPosition({...screenshotPosition, ...{x:posX, y:posY}});
        }

        if (scaling){
            let resizable = document.getElementById('screenshots');

            const newWidth = parseInt(initialSize.width) + parseInt(e.clientX - initialPos.x)
            const newHeight = parseInt(initialSize.height) + parseInt(e.clientY - initialPos.y)
    
            const sameRatio = newWidth >= newHeight ? newWidth : newHeight
            if (newWidth > 50 && newHeight > 50){
                resizable.style.width = `${sameRatio}px`;
                resizable.style.height = `${sameRatio}px`;
                setScreenshotPosition({...screenshotPosition,...{width:newWidth, height:newHeight}});
            }
        }
    }
  
    const initialFrame = (e) => {
        setMoving(true)
        let draggable = document.getElementById('Screenshot-block');
        let resizable = document.getElementById('screenshots');

        const leftPos = e.clientX - draggable.style.paddingLeft;

        draggable.style.paddingTop = e.clientY - resizable.offsetHeight/2;

        
        setInitialPos({x:leftPos, y:e.clientY});
        
    }

    const initial = (e) => {
        setScaling(true)
        let resizable = document.getElementById('screenshots');

        setInitialPos({x:e.clientX, y:e.clientY});
        setInitialSize({width:resizable.offsetWidth, height:resizable.offsetHeight});

    }   

    const endInteraction = () => {
        setScaling(false)
        setMoving(false)
    }
    
    return(
        <div className = {styles["FullScreen"]}
            onMouseMove={(ev)=> handleMouseMove(ev)}
            onMouseLeave = {endInteraction}
            onMouseUp = {endInteraction}
            onTouchEnd = {endInteraction}
            onTouchCancel = {endInteraction}>
                
            <div id = "Screenshot-block" className = {styles["Block"]}>
                <div id = "screenshots" className = {styles["Resizable"]}
                    onMouseDown = {initialFrame} 
                    onTouchStart = {initialFrame}
                />
                <div id = "draggable" className = {styles["Draggable"]}
                    onMouseDown = {initial} 
                    onTouchStart = {initial}
                />
            </div>
        </div>
    );
    
}

export default ResizableDiv;