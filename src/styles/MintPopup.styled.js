import styled from 'styled-components';

export const StyledContainer = styled.div`
    transition: visibility .6s;
    width: 100vw;
    height: 100vh;
    position: absolute;
    display: flex;
    pointer-events: ${props => props.active ? 
        'auto':
        'none'};
    visibility: ${props => props.active ? 
        'visible':
        'hidden'};
`
export const Title = styled.div`
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center;
    font-size:1.2rem;
    padding: 45px;
`
export const Buttons = styled.div`
    display: flex;
    text-align:center;
    width: 100%;
    justify-content: space-evenly;
`
export const StyledBackground = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    transition: all 0.6s;
    backdrop-filter: ${props => props.active ? 
        'blur(1rem)':
        'blur(0)'};
    background-color: ${props => props.active ? 
        'rgba(0, 0, 0, 0.5)':
        'rgba(0, 0, 0, 0)'};
    //transition: backdrop-filter blur(2rem) opacity(1) 3s ease;
    //backdrop-filter: blur(2rem);
`
export const StyledPopup = styled.div`
    width: 600px;
    display:flex;
    flex-direction: column;
    position: relative;
    background-color: #1716168D;
    border-color: #38404E;
    border-style: solid;
    border-width: 2px;
    border-radius: 5px;
    align-items: center;
    margin: auto;
    border-radius: 10px;
    color:white;
    text-align:center;
    justify-content: space-evenly;
    display: flex;
    flex-flow: column wrap;
`

export const Button1 = styled.button`
    width: 200px;
    height: 60px;
    background-color: #17161F;
    opacity:0.5;
    border-color: #38404E;
    border-width: 2px;
    border-radius: 5px;
    margin: auto;
    color:white;
    font-size:1.2rem;
    text-align: center;
`
export const Header = styled.div`
        border-bottom: 3px solid #3A7484;
        width: 100%;
        padding: 5px 0px;
        .mintStatus{
            display : flex;
        }
        .mintTitle{
            font-family : 'Proxima';
            font-weight: 800;
            font-size: 32px;
            line-height: 32px;
        }
`
export const ButtonPanel = styled.div`
        display: flex;
        justify-content: center;
        gap: 50px;
        margin: 10px;
`
export const TraitDetail = styled.div`
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin: 20px;
`

export const TraitImage = styled.img`
    height: ${props => props.height || '100%'};
    src: ${props => props.src || ''};
   
`
export const TraitText = styled.span`
    font-family: 'Proxima';
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 91.3%;
    color: #FFFFFF;
`

export const TraitBox = styled.div`
        min-width: 246px;
        display: flex;
        justify-content: left;
        align-items: center;
`
