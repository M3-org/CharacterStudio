import styled from 'styled-components';

export const Tooltip = styled.div`
    {
        width: 120px;
        background-color: #1D2530;
        opacity: 0.53;
        color: #fff;
        border: 3px solid #665F91;
        border-radius: 6px;
        text-align: center;
        padding: 5px 0;
        margin-top:20px;
        position: absolute;
        z-index: 1;
        bottom: 150%;
        left: 50%;
        margin-left: -60px;
        transform: skewX(-15deg);
        :after
            {
                content: "";
                position: absolute;
                top: 100%;
                left: 50%;
                margin-left: -10px;
                border-width: 10px;
                border-style: solid;
                border-radius : 10px;
                border-color: #665F91 transparent transparent transparent;
            }

        .tooltipText{
            transform: skewX(15deg);
            color : #61E5F9;
            font-family: 'Proxima';
            font-style: normal;
            font-weight: 800;
            font-size: 15px;
        }
    }
`

