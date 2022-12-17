import React from "react";

import styled from "styled-components";
import { InjectedConnector } from "@web3-react/injected-connector";
import { ViewContext, ViewStates } from "../context/ViewContext";
import { useWeb3React } from "@web3-react/core";
import { AudioContext } from "../context/AudioContext";

const GateStyleBox = styled.div`
    position: fixed;
    z-index: 10000;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    display: flex;
    flex-direction :column;
    align-items: center;
    justify-content: center;
    user-select : none;
    overflow: hidden;
    background-color: #000000;
    .vh-centered{
        position: absolute;
        .vh-header{
            font-family: Proxima;
            font-style: normal;
            font-weight: 400;
            font-size: 18px;
            position: relative;
            top: -1em;
            line-height: 32px;
            text-align: center;
            color: #FFFFFF;
        }
        .vh-paragraph{
            font-family: Proxima;
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            position: relative;
            top: -1em;
            line-height: 32px;
            text-align: center;
            color: #FFFFFF;
        }
        .vh-button{
            font-family: Proxima;
            font-style: normal;
            font-weight: 400;
            font-size: 14px;
            position: relative;
            top: -1em;
            line-height: 32px;
            text-align: center;
            color: #FFFFFF;
            background: #645D8D;
            border-radius: 10px;
            padding: 10px;
            margin-right: auto;
            margin-left: auto;
            width: 10em;
            cursor: pointer;
        }
    }
    .logo-container {
        bottom: 0;
        position: absolute;
    }
`;

// full screen div with a centered div in the middle
// div in the middle has a header "WEBAVERSE HOLDERS ONLY"
// below that, a paragaph explaining that this is a preview alpha version, and that the user must log in with their MetaMask wallet to continue
// below that, a button that says "CONNECT WALLET" that calls the connectWallet function
// if the user has connected their wallet, show two buttons: Enter WITH music and enter WITHOUT music

export default function Gate() {
    const { active, account, library, connector, activate, deactivate } =
        useWeb3React();
    const injected = new InjectedConnector({
        supportedChainIds: [137, 1, 3, 4, 5, 42, 97],
    });
    const { currentView, setCurrentView } = React.useContext(ViewContext);
    
    const { enableAudio, disableAudio } = React.useContext(AudioContext);

    const connectWallet = async () => {
        console.log('connectWallet')
        await activate(injected);
    };

    const enterWithMusic = () => {
        enableAudio()
        setCurrentView("main")
    }

    const enterWithoutMusic = () => {
        disableAudio()
        setCurrentView("main")
    }

    return currentView === ViewStates.INTRO && (
        <GateStyleBox>
            <div className="vh-centered">
                <div className="vh-header">WEBAVERSE HOLDERS ONLY</div>
                <div className="vh-paragraph">
                    This is a preview alpha version of the Webaverse Metaverse. You must
                    connect your MetaMask wallet to continue.
                </div>

                {/*if the user is not logged in, show connect wallet, else show enter with music and enter without music*/}
                {!active && (
                    <div className="vh-button" onClick={connectWallet}>
                        CONNECT WALLET
                    </div>
                )}
                {active && (
                    <div>
                        <div className="vh-button" onClick={() => enterWithMusic()}>
                            ENTER WITH MUSIC
                        </div>
                        <div className="vh-button" onClick={() => enterWithoutMusic()}>
                            ENTER WITHOUT MUSIC
                        </div>
                    </div>
                )}
            </div>
        </GateStyleBox>
    );
}