import StyleWarapper from './BackButtonStyle';

export const BackButton = (props) =>{
    return (
        <StyleWarapper 
            className = {props.className}
            {...props}
        >
        </StyleWarapper>
    )
}