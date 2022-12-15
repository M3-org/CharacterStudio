import styled from 'styled-components'

export const SideMenu = styled.div`
    position: absolute;
    left: 50px;
    top: 10%;
    width: 100px;
    background-color: rgba(23, 22, 31, 0.35);
    border: 1px solid #38404E;
    border-radius : 5px;
    backdrop-filter: blur(22.5px); 
    box-sizing : border-box;
    transform: perspective(400px) rotateY(5deg);
    user-select : none;
`
export const LineDivision = styled.div`
    border: 1px solid #3A7484;
    width: 98%;
    opacity: 0.5;
    margin-bottom: ${props => props.bottom || '0'};
    margin-top: ${props => props.top || '0'};
`
export const MenuOption = styled.div`
    display: inline-block;
    margin: 5px auto 5px auto;
    padding: 5px;
    height: 3em;
    width: 3em;
    opacity: ${props => props.selected ? 1 : 0.3};
    user-select: none;
    text-align: center;
    cursor:pointer;
    border-right: ${props => props.selected ? '4px solid #61E5F9' : ''};
`
export const MenuImg = styled.img`
    margin:auto;
    height: ${props => props.height || '100%'};
    src: ${props => props.src || ''};
   
`
export const ShuffleOption = styled(MenuOption)`
    border-right: '';
    opacity: 1;
    height: 30px;

`
export const MenuTitle = styled.div`
    display: inline-block;
    text-align: center;
    height: 70px;
    margin: 5px auto 5px auto;
    user-select: none;
    
`