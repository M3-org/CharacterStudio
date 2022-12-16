import StyleWarapper from '../styles/BackButtonStyle';
import React from "react"

export const BackButton = (props) =>{
    return (
        <StyleWarapper 
            className = {props.className}
            {...props}
        >
        </StyleWarapper>
    )
}