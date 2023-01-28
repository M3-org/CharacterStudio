import React, { useState } from 'react';
import styles from "./Resizable.module.css"

const ResizableDiv = () => {
    
    const [initialPos,   setInitialPos] = useState(null);
    const [initialSize, setInitialSize] = useState(null);
  
    const initial = (e) => {
        
        let resizable = document.getElementById('Resizable');

        setInitialPos({x:e.clientX, y:e.clientY});
        setInitialSize({width:resizable.offsetWidth, height:resizable.offsetHeight});

        //setInitialPos(e.clientX);
        //setInitialSize(resizable.offsetWidth);

    }   
    
    const resize = (e) => {

        let resizable = document.getElementById('Resizable');


        resizable.style.width = `${parseInt(initialSize.width) + parseInt(e.clientX - initialPos.x)}px`;
        resizable.style.height = `${parseInt(initialSize.height) + parseInt(e.clientY - initialPos.y)}px`;

      
    }
    
    return(
        <div className = {styles["Block"]}>
            <div id = "Resizable" className = {styles["Resizable"]}/>
            <div id = "Draggable" className = {styles["Draggable"]}
                draggable   = 'true'
                onDragStart = {initial} 
                onDrag      = {resize}
            />
        </div>
    );
    
}

export default ResizableDiv;