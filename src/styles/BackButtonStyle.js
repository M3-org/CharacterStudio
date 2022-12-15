import styled from 'styled-components';
import backButton from '../../src/ui/backButton_gray.png'
import hoverButton from '../../src/ui/backButton_white.png'

const style = styled.div`
    {   //'url(' + svgSoundOff + ');' : 
        background : ${'url('+ backButton + ') center center no-repeat;'};
        background-size: 45% 55%;
        width: 74px;
        height: 74px;
        backdrop-filter: blur(22.5px);
        border-radius: 5px;
        box-sizing: border-box;
        opacity : 0.4;
        user-select : none;
        position : absolute;
        :hover {
            opacity : 1.0;
            cursor : pointer;
            background : ${'url('+ hoverButton + ') center center no-repeat;'};
            background-size: 45% 55%;

        }
    }
`

export default style;