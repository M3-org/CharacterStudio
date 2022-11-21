import styled from 'styled-components';

const style = styled.div`
    {   
        background : url('../../src/ui/download.svg') center center no-repeat;
        transform: rotate(90deg);
        width: 74px;
        height: 74px;
        border: 1px solid #434B58;
        backdrop-filter: blur(22.5px);
        border-radius: 5px;
        box-sizing: border-box;
        opacity : 0.4;
        user-select : none;
        position : absolute;
        :hover {
            opacity : 1.0;
            cursor : pointer;
        }
    }
`

export default style;