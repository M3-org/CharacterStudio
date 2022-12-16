import StyleWarapper from '../styles/ColorSelectButtonStyle';
import React from "react"

export const ColorSelectButton = (props) =>{
    return (
        <StyleWarapper 
            className = {props.className}
            {...props}
        >
            {props.text}
        </StyleWarapper>
    )
}