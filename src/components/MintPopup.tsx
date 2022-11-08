import { StyledBackground, StyledPopup,StyledContainer, Button1, Title, Buttons } from '../styles/MintPopup.styled.js'
import React, { useState, useEffect } from "react";

export default function MintPopup(props: any) {
    const {setConfirmWindow, confirmWindow, mintStatus, mintLoading} = props;
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