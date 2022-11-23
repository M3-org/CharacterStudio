import styled from 'styled-components';

export const SquareButton = styled.div`
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
export const TopRightMenu = styled.div`
  display : flex;
  top : 37px;
  right : 44px;
  position : absolute;
  gap :20px;
`
export const BottomRightMenu = styled.div`
  display : flex;
  bottom : 37px;
  right : 44px;
  position : absolute;
  gap :20px;
`

export const FitParentContainer = styled.div`
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow : hidden;
`
export const ScreenSizeContainer = styled.div`
    height: 100vh;
    width: 100vw;
    position: absolute;
    top: 0;
`
export const RightMenu = styled.div`
`
export const ResizeableCanvas = styled.div`
    position: absolute;
    overflow : hidden;
    transition : all 1s;
    width: ${props => props.left ? 'calc(100% - ' + props.left + ')' : '100%'};
    height: ${props => props.bottom ? 'calc(100% - ' + props.bottom + ')' : '100%'};
    right:  ${props => props.right || '0'};
    top: ${props => props.top || '0'};
`
