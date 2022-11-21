import styled from 'styled-components';
import { SquareButton } from './Globals.styled';
import svgSoundOn from '../../src/ui/soundon.svg'
import svgSoundOff from '../../src/ui/soundoff.svg'

export const MusicButton = styled(SquareButton)`
    background-size: 35px;
    background-image: ${props => props.isMute ? 
        'url(' + svgSoundOff + ');' : 
        'url(' + svgSoundOn + ');'};
`;