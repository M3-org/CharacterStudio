import { StyledBackground, StyledPopup,StyledContainer, Button1, Title, Buttons, Header, ButtonPanel,TraitDetail, TraitImage,TraitText, TraitBox } from '../styles/MintPopup.styled.js'
import React, { useState, useEffect } from "react";
import {useAvatar, useConfirmWindow, useMintLoading, useMintStatus, useTemplateInfo, useColorStatus, useDefaultTemplates, useModelClass, useMintDone } from "../store";
import MintModal from './MintModal';
import walletErrorImage from '../ui/mint/walletError.png'
import mintPopupImage from '../ui/mint/mintPopup.png'
import StyledButton from '../styles/ColorSelectButtonStyle';
export default function MintPopup({
    connectWallet,
    connected,
    mintAsset
}) {
    const confirmWindow = useConfirmWindow((state) => state.confirmWindow)
    const setConfirmWindow = useConfirmWindow((state) => state.setConfirmWindow)
    const mintLoading = useMintLoading((state) => state.mintLoading)
    const mintStatus = useMintStatus((state) => state.mintStatus)
    const templateInfo = useTemplateInfo((state) => state.templateInfo)
    const avatar = useAvatar((state) => state.avatar)
    const colorStatus = useColorStatus((state) => state.colorStatus)
    const mintDone = useMintDone((state) => state.mintDone)
    const showTrait = (trait) => {
        if(trait.name in avatar){
            if('traitInfo' in avatar[trait.name]){
                return avatar[trait.name].traitInfo.name;
            } else return "No " + trait.name;
        }else return colorStatus;
    }
    const onMintClick = () => {
        setConfirmWindow(true);
        mintAsset()
    }
    return (
        (
            !connected ?  ( <StyledContainer active={confirmWindow}>
                <StyledBackground active={confirmWindow}/>
                    {confirmWindow &&(
                        <StyledPopup>
                            <Header >
                                <img src={walletErrorImage} className={mintStatus}/>
                            </Header>
                            <Title>{mintStatus}</Title>
                            <ButtonPanel >
                                <StyledButton onClick={() => setConfirmWindow(false)}>Cancel </StyledButton>
                                <StyledButton onClick={() => connectWallet()} >Connect Wallet </StyledButton>
                            </ButtonPanel>
                        </StyledPopup>
                    )}
            </StyledContainer>) : ( 
                <StyledContainer active={confirmWindow}>
                  <StyledBackground active={confirmWindow}/>
                  {confirmWindow &&(
                        <StyledPopup>
                          <Header >
                                <img src={mintPopupImage} className={mintStatus}/>
                                <div className='mintTitle'>Mint Avatar</div>
                            </Header>
                            <MintModal/>
                            <TraitDetail>
                            { templateInfo.selectionTraits && templateInfo.selectionTraits.map((item, index)=> (
                                    <TraitBox key={index}>
                                        <TraitImage src = {templateInfo.traitIconsDirectory + item.icon} />
                                        <TraitText >{showTrait(item)}</TraitText>
                                    </TraitBox>
                                ))}
                            </TraitDetail>
                            <TraitText >{mintStatus}</TraitText>
                            <ButtonPanel >
                                <StyledButton onClick={() => setConfirmWindow(false)}> {!mintDone? "Cancel": "Ok" }</StyledButton>
                               {!mintDone ? (<StyledButton onClick={() => onMintClick()} >Mint </StyledButton>) : <></>}
                            </ButtonPanel>
                        </StyledPopup>
                    )
                }
                </StyledContainer>
               )
        )
    )
}