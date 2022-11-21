import styled from 'styled-components';
import { SquareButton } from './Globals.styled';
import svgSoundOn from '../../src/ui/soundon.svg'
import svgSoundOff from '../../src/ui/soundoff.svg'

export const AutoRotationButton = styled(SquareButton)`
    background-size: 35px;
    background-image: ${props => props.isRotate ? 
        'url(' + svgSoundOff + ');' : 
        'url(' + svgSoundOn + ');'};
`;