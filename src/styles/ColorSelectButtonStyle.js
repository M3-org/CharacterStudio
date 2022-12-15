import styled from 'styled-components';

const style = styled.div`
    {
        background: rgba(81, 90, 116, 0.25);
        border: 2px solid #434B58;
        border-radius: 78px;
        box-sizing: border-box;
        width : 180px;
        height: 50px;
        text-align : center;
        font-family: 'Proxima';
        font-style: normal;
        font-weight: 400;
        font-size: 20px;
        line-height: 50px;
        cursor: pointer;
        color: rgba(255, 255, 255, 0.3);
        :hover {
            border: 2px solid #4EB0C0;
            color: #FFFFFF;
        }
        ${props => props.selected && `
            border: 2px solid #4EB0C0;
            color: #FFFFFF;
        `}
    }
`

export default style;