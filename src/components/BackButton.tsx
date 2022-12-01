import StyleWarapper from '../styles/BackButtonStyle';

export const BackButton = (props) =>{
    return (
        <StyleWarapper 
            className = {props.className}
            {...props}
        >
        </StyleWarapper>
    )
}