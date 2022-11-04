import styled from 'styled-components';

export const StyledContainer = styled.div`
    transition: visibility .6s;
    width: 100vw;
    height: 100vh;
    position: absolute;
    display: flex;
    pointer-events: ${props => props.active ? 
        "auto":
        "none"};
    visibility: ${props => props.active ? 
        "visible":
        "hidden"};
`
export const Title = styled.div`
    height: 40px;
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center;
    font-size:1.2rem;
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
        "blur(1rem)":
        "blur(0)"};
    background-color: ${props => props.active ? 
        "rgba(0, 0, 0, 0.5)":
        "rgba(0, 0, 0, 0)"};
    //transition: backdrop-filter blur(2rem) opacity(1) 3s ease;
    //backdrop-filter: blur(2rem);
`
export const StyledPopup = styled.div`
    width: 600px;
    height: 200px;
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