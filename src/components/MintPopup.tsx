import { StyledBackground, StyledPopup,StyledContainer, Button1, Title, Buttons } from '../styles/MintPopup.styled.js'
import React, { useState, useEffect } from "react";
import {useConfirmWindow, useMintLoading, useMintStatus } from "../store";

export default function MintPopup() {
    const confirmWindow = useConfirmWindow((state) => state.confirmWindow)
    const setConfirmWindow = useConfirmWindow((state) => state.setConfirmWindow)
    const mintLoading = useMintLoading((state) => state.mintLoading)
    const mintStatus = useMintStatus((state) => state.mintStatus)
    return (
        (
            <StyledContainer active={confirmWindow}>
                <StyledBackground active={confirmWindow}/>
                {confirmWindow && (
                    <StyledPopup>
                        <Title>{mintStatus}</Title>
                        {!mintLoading ? 
                        (<Buttons>
                            <Button1 onClick={() => setConfirmWindow(false)}>close</Button1>
                        </Buttons>):("")
                        }
                    </StyledPopup>
                )}
            </StyledContainer>
        )
    )
}