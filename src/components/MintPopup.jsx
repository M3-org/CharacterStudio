import React, { useContext, Fragment } from "react"
import { ApplicationContext } from "../context/ApplicationContext"
import MintModal from "./MintModal"
import walletErrorImage from "../../public/ui/mint/walletError.png"
import mintPopupImage from "../../public/ui/mint/mintPopup.png"
import polygonIcon from "../../public/ui/mint/polygon.png"

import styled from 'styled-components';

const StyledButton = styled.div`
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

const StyledContainer = styled.div`
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
const Title = styled.div`
    display: flex;
    justify-content: center;
    text-align: center;
    align-items: center;
    font-size:1.2rem;
    font-size: ${props => props.fontSize || '1.2rem'};
    padding: ${props => props.padding || '45px'};
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none; 
`
const Buttons = styled.div`
    display: flex;
    text-align:center;
    width: 100%;
    justify-content: space-evenly;
`
const StyledBackground = styled.div`
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
const StyledPopup = styled.div`
    width: 550px;
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
    padding: 10px 0 30px;
    border-radius: 10px;
    color:white;
    text-align:center;
    justify-content: space-evenly;
    display: flex;
    flex-flow: column wrap;
`

const Button1 = styled.button`
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
const Header = styled.div`
        border-bottom: 3px solid #3A7484;
        width: 100%;
        padding: 5px 0px;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none; 
        .mintStatus{
            display : flex;
        }
        .mintTitle{
            font-family : 'Proxima';
            font-weight: 800;
            font-size: 20px;
            line-height: 32px;
        }
`
const ButtonPanel = styled.div`
        display: flex;
        justify-content: center;
        gap: 50px;
        margin: 10px;
`
const TraitDetail = styled.div`
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin: 20px 20px 10px 20px;
`

const TraitImage = styled.img`
    height: ${props => props.height || '100%'};
    src: ${props => props.src || ''};
    padding:5px;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none; 
`

const TraitText = styled.span`
    font-family: 'Proxima';
    font-style: normal;
    font-weight: 400;
    font-size: 15px;
    margin:5px;
    line-height: 91.3%;
    color: #FFFFFF;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none; 
`

const MintCost = styled.span`
    font-family: 'Proxima';
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    margin:0px;
    line-height: 91.3%;
    color: #FFFFFF;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none; 
`

const TraitBox = styled.div`
        width: 190px;
        height:40px;
        display: flex;
        justify-content: left;
        align-items: center;
`

const MintPriceBox = styled.div`
        width: 390px;
        height:50px;
        display: flex;
        justify-content: center;
        align-items: center;
`

export default function MintPopup({ connectWallet, connected, mintAsset }) {
  const {
    confirmWindow,
    setConfirmWindow,
    mintLoading,
    mintStatus,
    mintCost,
    templateInfo,
    avatar,
    colorStatus,
    mintDone,
  } = useContext(ApplicationContext)

  const showTrait = (trait) => {
    if (trait.name in avatar) {
      if ("traitInfo" in avatar[trait.name]) {
        return avatar[trait.name].traitInfo.name
      } else return "Default " + trait.name
    } else return colorStatus
  }
  const onMintClick = () => {
    setConfirmWindow(true)
    mintAsset()
  }
  return !connected ? (
    <StyledContainer active={confirmWindow}>
      <StyledBackground active={confirmWindow} />
      {confirmWindow && (
        <StyledPopup>
          <Header>
            <img src={walletErrorImage} className={mintStatus} />
          </Header>
          <Title>{mintStatus}</Title>
          <ButtonPanel>
            <StyledButton onClick={() => setConfirmWindow(false)}>
              Cancel{" "}
            </StyledButton>
            <StyledButton onClick={() => connectWallet()}>
              Connect Wallet{" "}
            </StyledButton>
          </ButtonPanel>
        </StyledPopup>
      )}
    </StyledContainer>
  ) : (
    <StyledContainer active={confirmWindow}>
      <StyledBackground active={confirmWindow} />
      {confirmWindow && (
        <StyledPopup>
          <Header>
            <img src={mintPopupImage} className={mintStatus} height={"50px"} />
            <div className="mintTitle">Mint Avatar</div>
          </Header>
          <MintModal />
          <TraitDetail>
            {templateInfo.selectionTraits &&
              templateInfo.selectionTraits.map((item, index) => (
                <TraitBox key={index}>
                  <TraitImage
                    src={templateInfo.traitIconsDirectory + item.icon}
                  />
                  <TraitText>{showTrait(item)}</TraitText>
                </TraitBox>
              ))}
          </TraitDetail>
          <MintPriceBox>
            <MintCost>{"Mint Price: "}</MintCost>
            <TraitImage src={polygonIcon} height={"40%"} />
            <MintCost>{mintCost}</MintCost>
          </MintPriceBox>
          <Title fontSize={"1rem"} padding={"10px 0 20px"}>
            {mintStatus}
          </Title>
          <ButtonPanel>
            <StyledButton onClick={() => setConfirmWindow(false)}>
              {" "}
              {!mintDone ? "Cancel" : "Ok"}
            </StyledButton>
            {!mintDone ? (
              <StyledButton onClick={() => onMintClick()}>Mint </StyledButton>
            ) : (
              <Fragment></Fragment>
            )}
          </ButtonPanel>
        </StyledPopup>
      )}
    </StyledContainer>
  )
}
