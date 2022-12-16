import styled from 'styled-components';
import { SquareButton } from './Globals.styled';
import svgSoundOn from '../../public/ui/soundon.svg'
import svgSoundOff from '../../public/ui/soundoff.svg'

export const MusicButton = styled(SquareButton)`
    z-index: 1000;
    background-size: 35px;
    background-image: ${props => props.isMute ? 
        'url(' + svgSoundOff + ');' : 
        'url(' + svgSoundOn + ');'};
`;