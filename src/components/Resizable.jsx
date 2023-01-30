import React, { useState } from 'react';
import styles from "./Resizable.module.css"

const ResizableDiv = ({setScreenshotPosition, screenshotPosition}) => {
    
    const [initialPos,   setInitialPos] = useState(null);
    const [initialSize, setInitialSize] = useState(null);

    // React.useEffect(() => {
    //     let draggable = document.getElementById('Screenshot-block');
    //     let resizable = document.getElementById('screenshots');
    //     console.log(draggable)
    //     console.log(screenshotPosition)
    //     draggable.style.paddingTop = screenshotPosition.y
    //     draggable.style.paddingLeft = screenshotPosition.x
    //     resizable.style.width = screenshotPosition.width
    //     resizable.style.height = screenshotPosition.height
    // },[])

    const initialFrame = (e) => {
        let draggable = document.getElementById('Screenshot-block');
        let resizable = document.getElementById('screenshots');

        const leftPos = e.clientX - draggable.style.paddingLeft;

        draggable.style.paddingTop = e.clientY - resizable.offsetHeight/2;

        
        setInitialPos({x:leftPos, y:e.clientY});
        
    }

    const dragFrame = (e) => {

        if (e.clientY > 5 && e.clientX > 5){
            let draggable = document.getElementById('Screenshot-block');
            let resizable = document.getElementById('screenshots');

            const posX = (e.clientX - resizable.offsetWidth/2)// + initialPos.x
            const posY = (e.clientY - resizable.offsetHeight/2)// + initialPos.y
            
        
            draggable.style.paddingTop = `${posY}px`

            draggable.style.paddingLeft = `${posX}px`

            setScreenshotPosition({...screenshotPosition, ...{x:posX, y:posY}});
        }

    }
    


    const initial = (e) => {
        
        let resizable = document.getElementById('screenshots');

        setInitialPos({x:e.clientX, y:e.clientY});
        setInitialSize({width:resizable.offsetWidth, height:resizable.offsetHeight});

    }   
    
    const resize = (e) => {

        
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
    
    return(
        <div id = "Screenshot-block" className = {styles["Block"]}>
            <div id = "screenshots" className = {styles["Resizable"]}
                draggable   = 'true'
                onDragStart = {initialFrame} 
                onDrag      = {dragFrame}
            />
            <div id = "Draggable" className = {styles["Draggable"]}
                draggable   = 'true'
                onDragStart = {initial} 
                onDrag      = {resize}
            />
        </div>
    );
    
}

export default ResizableDiv;