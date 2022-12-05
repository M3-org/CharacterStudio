import styled from 'styled-components';
import { SquareButton } from './Globals.styled';
import svgSoundOn from '../../src/ui/rotate.png'
import svgSoundOff from '../../src/ui/rotate-cancel.png'

export const AutoRotationButton = styled(SquareButton)`
    background-size: 35px;
    background-image: ${props => props.isRotate ? 
        'url(' + svgSoundOff + ');' : 
        'url(' + svgSoundOn + ');'};
`;