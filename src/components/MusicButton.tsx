import StyleWarapper from './MusicButtonStyle';

export const MusicButton = (props) =>{
    return (
        <StyleWarapper className = {props.className}>
            <input 
                type="checkbox" 
                className="toggle"
                checked={!props.isMute}
                onChange={(e) => {
                    props.setMute(!e.target.checked)
                }}
            ></input>
        </StyleWarapper>
    )
}