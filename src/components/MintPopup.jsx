import {
  StyledBackground,
  MintPriceBox,
  MintCost,
  StyledPopup,
  StyledContainer,
  Title,
  Header,
  ButtonPanel,
  TraitDetail,
  TraitImage,
  TraitText,
  TraitBox,
} from "../styles/MintPopup.styled.js"
import React, { useContext, Fragment } from "react"
import { ApplicationContext } from "../ApplicationContext"
import MintModal from "./MintModal"
import walletErrorImage from "../../public/ui/mint/walletError.png"
import mintPopupImage from "../../public/ui/mint/mintPopup.png"
import polygonIcon from "../../public/ui/mint/polygon.png"
import StyledButton from "../styles/ColorSelectButtonStyle"

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
