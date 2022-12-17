import styled from 'styled-components';
import React, { useEffect, useContext } from "react"
import { ApplicationContext } from "../context/ApplicationContext"
import useSound from "use-sound"
import bgm from "../../public/sound/cc_bgm_balanced.wav"
import svgSoundOn from '../../public/ui/soundon.svg'
import svgSoundOff from '../../public/ui/soundoff.svg'

const SquareButton = styled.div`
    transition : .3s;
    font-family : Proxima;
    background-repeat: no-repeat;
    background-position: center;
    margin: auto;
    color : rgba(255, 255, 255, 0.5);
    width: ${props => props.width || '74px'};
    height: ${props => props.height || '74px'};
    border: 1px solid #434B58;
    backdrop-filter: blur(22.5px);
    border-radius: 5px;
    display : flex;
    justify-content : center;
    align-items : center;
    box-sizing: border-box;
    opacity : 0.8;
    user-select : none;
    cursor:pointer;
    &:hover {
        backdrop-filter: blur(1.5px);
        border-color : white;
        opacity : 1.0;
        color:white;
    }
`

const StyledAudioButton = styled(SquareButton)`
    z-index: 1000;
    background-size: 35px;
    background-image: ${props => props.isMute ? 
        'url(' + svgSoundOff + ');' : 
        'url(' + svgSoundOn + ');'};
`;

const BottomRightMenu = styled.div`
  display : flex;
  bottom : 37px;
  right:  ${props => props.right || '44px'};
  position : absolute;
  gap :20px;
`

export default function AudioButton() {
  const {isMute, setMute} = useContext(ApplicationContext)
  const [backWav, {}] = useSound(bgm, { volume: 1.0, loop: true })

  useEffect(() => {
    backWav()
  }, [])

  return (
    <BottomRightMenu>
      <StyledAudioButton
        isMute={isMute}
        onClick={() => {
          setMute(!isMute)
        }}
      />
    </BottomRightMenu>
  )
}
