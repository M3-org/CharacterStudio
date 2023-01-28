import React, { useState } from 'react';
import styles from "./Resizable.module.css"

const ResizableDiv = () => {
    
    const [initialPos,   setInitialPos] = useState(null);
    const [initialSize, setInitialSize] = useState(null);
  
    const initialFrame = (e) => {
        let draggable = document.getElementById('Screenshot-block');
        let resizable = document.getElementById('Resizable');
        console.log(resizable.offsetWidth)

        draggable.style.paddingLeft = e.clientX - resizable.offsetWidth/2;
        draggable.style.paddingTop = e.clientY - resizable.offsetHeight/2;

        
        setInitialPos({x:e.clientX, y:e.clientY});

    }

    const dragFrame = (e) => {
        let draggable = document.getElementById('Screenshot-block');
        let resizable = document.getElementById('Resizable');

        if (e.clientY > 5)
            draggable.style.paddingTop = `${e.clientY - resizable.offsetHeight/2}px`

        if (e.clientX > 5)
           draggable.style.paddingLeft = `${e.clientX - resizable.offsetWidth/2}px`

    }
    


    const initial = (e) => {
        
        let resizable = document.getElementById('Resizable');

        setInitialPos({x:e.clientX, y:e.clientY});
        setInitialSize({width:resizable.offsetWidth, height:resizable.offsetHeight});

    }   
    
    const resize = (e) => {

        let resizable = document.getElementById('Resizable');

        const newWidth = parseInt(initialSize.width) + parseInt(e.clientX - initialPos.x)
        const newHeight = parseInt(initialSize.height) + parseInt(e.clientY - initialPos.y)
        if (newWidth > 50)
            resizable.style.width = `${newWidth}px`;
        if (newHeight > 50)
            resizable.style.height = `${newHeight}px`;
    }
    
    return(
        <div id = "Screenshot-block" className = {styles["Block"]}>
            <div id = "Resizable" className = {styles["Resizable"]}
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