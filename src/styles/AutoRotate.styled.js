import styled from 'styled-components';
import { SquareButton } from './Globals.styled';
import rotateOn from '../../public/ui/rotate.png'
import rotateOff from '../../public/ui/rotate-cancel.png'

export const AutoRotationButton = styled(SquareButton)`
    background-size: 35px;
    background-image: ${props => props.isRotate ? 
        'url(' + rotateOff + ');' : 
        'url(' + rotateOn + ');'};
`;