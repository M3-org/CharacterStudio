import StyleWarapper from './MusicButtonStyle';
import onButton from '../../src/ui/soundon.png'
import offButton from '../../src/ui/soundoff.png'

export const MusicButton = (props) =>{
    return (
        <StyleWarapper className = {props.className}>
            <img 
                className = "buttonImg"
                src = {props.isMute ? offButton : onButton} 
                // checked={!props.isMute}
                onClick={(e) => {
                    props.setMute(!props.isMute)
                }}
            ></img>
        </StyleWarapper>
    )
}