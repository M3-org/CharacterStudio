import React, { useState } from 'react';
import styles from "./Resizable.module.css"

const ResizableDiv = ({setScreenshotPosition, screenshotPosition}) => {
    
    const [initialPos,   setInitialPos] = useState(null);
    const [initialSize, setInitialSize] = useState(null);

    const [moving, setMoving] = useState(false)
    const [scaling, setScaling] = useState(false)

    React.useEffect (() => {
        let resizable = document.getElementById('screenshots');
        let draggable = document.getElementById('Screenshot-block');

        resizable.style.width = `${screenshotPosition.width}px`;
        resizable.style.height = `${screenshotPosition.height}px`;

        draggable.style.paddingTop = `${screenshotPosition.y+20}px`
        draggable.style.paddingLeft = `${screenshotPosition.x}px`


        updateMask()
    },[])

    const handleMouseMove = (e) => { 
        //console.log(moving)
        if (moving){
            let draggable = document.getElementById('Screenshot-block');
            let resizable = document.getElementById('screenshots');

            const posX = (e.clientX - resizable.offsetWidth/2)// + initialPos.x
            const posY = (e.clientY - resizable.offsetHeight/2)// + initialPos.y
        
            draggable.style.paddingTop = `${posY+20}px`

            draggable.style.paddingLeft = `${posX}px`

            //moveMask(posX, posY, resizable.offsetWidth, resizable.offsetHeight);
            updateMask();
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

                //resizeMask()
                updateMask();
                
                setScreenshotPosition({...screenshotPosition,...{width:sameRatio, height:sameRatio}});
            }
        }
    }
    const updateMask = () =>{
        const fscreen = document.getElementById('fscreen-div');

        const maskLeft = document.getElementById('maskLeft');
        const maskTop = document.getElementById('maskTop');
        const maskRight = document.getElementById('maskRight');
        const maskBottom = document.getElementById('maskBottom');

        const clientHeight = fscreen.clientHeight;
        const clientWidth = fscreen.clientWidth;

        maskLeft.style.width = `${screenshotPosition.x}px`

        maskTop.style.left = `${screenshotPosition.x}px`
        maskTop.style.height = `${screenshotPosition.y}px`
        maskTop.style.width = `${screenshotPosition.width}px`

        maskRight.style.width = `${clientWidth - screenshotPosition.x - screenshotPosition.width}px`
        
        maskBottom.style.left = `${screenshotPosition.x}px`
        maskBottom.style.height = `${clientHeight - screenshotPosition.y - screenshotPosition.height}px`
        maskBottom.style.width = `${screenshotPosition.width}px`
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
        <div id = "fscreen-div" className = {styles["FullScreen"]}
            onMouseMove={(ev)=> handleMouseMove(ev)}
            onMouseLeave = {endInteraction}
            onMouseUp = {endInteraction}
            onTouchEnd = {endInteraction}
            onTouchCancel = {endInteraction}>
                <div id = "maskLeft" className = {styles["leftBlock"]}></div>
                <div id = "maskRight" className = {styles["rightBlock"]}></div>
                <div id = "maskTop" className = {styles["topBlock"]}></div>
                <div id = "maskBottom" className = {styles["lowerBlock"]}></div>
            
            <div id = "Screenshot-block" className = {styles["Block"]}>
                <div id = "screenshots"
                    draggable = 'false'
                    onMouseDown = {initialFrame} 
                    onTouchStart = {initialFrame}
                />
                <div id = "draggable" className = {styles["Draggable"]}
                    draggable = 'false'
                    onMouseDown = {initial} 
                    onTouchStart = {initial}
                />
            </div>
        </div>
    );
    
}

export default ResizableDiv;