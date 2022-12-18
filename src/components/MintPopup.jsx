import React, { useContext, Fragment } from "react"
import MintModal from "./MintModal"
import walletErrorImage from "../../public/ui/mint/walletError.png"
import mintPopupImage from "../../public/ui/mint/mintPopup.png"
import polygonIcon from "../../public/ui/mint/polygon.png"

import styled from "styled-components"
import { SceneContext } from "../context/SceneContext"
import { ViewStates, ViewContext } from "../context/ViewContext"

const mintCost = 0.0

const StyledButton = styled.div`
   {
    background: rgba(81, 90, 116, 0.25);
    border: 2px solid #434b58;
    border-radius: 78px;
    box-sizing: border-box;
    width: 180px;
    height: 50px;
    text-align: center;
    font-family: "Proxima";
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 50px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.3);
    :hover {
      border: 2px solid #4eb0c0;
      color: #ffffff;
    }
    ${(props) =>
      props.selected &&
      `
            border: 2px solid #4EB0C0;
            color: #FFFFFF;
        `}
  }
`
const StyledContainer = styled.div`
  transition: visibility 0.6s;
  width: 100vw;
  height: 100vh;
  position: absolute;
  display: flex;
`
const Title = styled.div`
  display: flex;
  justify-content: center;
  text-align: center;
  align-items: center;
  font-size: 1.2rem;
  font-size: ${(props) => props.fontSize || "1.2rem"};
  padding: ${(props) => props.padding || "45px"};
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
`
const Buttons = styled.div`
  display: flex;
  text-align: center;
  width: 100%;
  justify-content: space-evenly;
`
const StyledBackground = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  transition: all 0.6s;
  //transition: backdrop-filter blur(2rem) opacity(1) 3s ease;
  //backdrop-filter: blur(2rem);
`
const StyledPopup = styled.div`
  width: 550px;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #1716168d;
  border-color: #38404e;
  border-style: solid;
  border-width: 2px;
  border-radius: 5px;
  align-items: center;
  margin: auto;
  padding: 10px 0 30px;
  border-radius: 10px;
  color: white;
  text-align: center;
  justify-content: space-evenly;
  display: flex;
  flex-flow: column wrap;
`
const Header = styled.div`
  border-bottom: 3px solid #3a7484;
  width: 100%;
  padding: 5px 0px;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  .mintStatus {
    display: flex;
  }
  .mintTitle {
    font-family: "Proxima";
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
  height: ${(props) => props.height || "100%"};
  src: ${(props) => props.src || ""};
  padding: 5px;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
`

const TraitText = styled.span`
  font-family: "Proxima";
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  margin: 5px;
  line-height: 91.3%;
  color: #ffffff;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
`

const MintCost = styled.span`
  font-family: "Proxima";
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  margin: 0px;
  line-height: 91.3%;
  color: #ffffff;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
`

const TraitBox = styled.div`
  width: 190px;
  height: 40px;
  display: flex;
  justify-content: left;
  align-items: center;
`

const MintPriceBox = styled.div`
  width: 390px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`

export default function MintPopup({
  connectWallet,
  connected,
  mintAsset,
  mintStatus,
  template
}) {
  const { avatar, colorStatus } = useContext(SceneContext)

  const { currentView, setCurrentView } = useContext(ViewContext)

  const showTrait = (trait) => {
    if (trait.name in avatar) {
      if ("traitInfo" in avatar[trait.name]) {
        return avatar[trait.name].traitInfo.name
      } else return "Default " + trait.name
    } else return colorStatus
  }
  const onMintClick = () => {
    setCurrentView()
    mintAsset()
  }

  const active = currentView === ViewStates.MINT_CONFIRM

  if (!active) return null

  return !connected ? (
    <StyledContainer>
      <StyledBackground />
      <StyledPopup>
        <Header>
          <img src={walletErrorImage} className={mintStatus} />
        </Header>
        <Title>{mintStatus}</Title>
        <ButtonPanel>
          <StyledButton onClick={() => setCurrentView(ViewStates.CREATOR)}>
            Cancel{" "}
          </StyledButton>
          <StyledButton onClick={() => connectWallet()}>
            Connect Wallet{" "}
          </StyledButton>
        </ButtonPanel>
      </StyledPopup>
    </StyledContainer>
  ) : (
    <StyledContainer>
      <StyledBackground />
      <StyledPopup>
        <Header>
          <img src={mintPopupImage} className={mintStatus} height={"50px"} />
          <div className="mintTitle">Mint Avatar</div>
        </Header>
        <MintModal />
        <TraitDetail>
          {template.selectionTraits &&
            template.selectionTraits.map((item, index) => (
              <TraitBox key={index}>
                <TraitImage
                  src={template.traitIconsDirectory + item.icon}
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
          <StyledButton onClick={() => setCurrentView(ViewStates.CREATOR)}>
            {" "}
            {currentView === ViewStates.MINT_COMPLETE ? "Ok" : "Cancel"}
          </StyledButton>
          {currentView !== ViewStates.MINT_COMPLETE && (
            <StyledButton onClick={() => onMintClick()}>Mint</StyledButton>
          )}
        </ButtonPanel>
      </StyledPopup>
    </StyledContainer>
  )
}
