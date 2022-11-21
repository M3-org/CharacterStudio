import StyleWarapper from './ColorSelectButtonStyle';

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