import React from "react";
import { InjectedConnector } from "@web3-react/injected-connector";
import { ViewContext, ViewStates } from "../context/ViewContext";
import { useWeb3React } from "@web3-react/core";
import { AudioContext } from "../context/AudioContext";

import styles from './Gate.module.css'

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
        setCurrentView(ViewStates.LANDER_LOADING)
        console.log('ViewStates.LANDER_LOADING', ViewStates.LANDER_LOADING)
    }

    const enterWithoutMusic = () => {
        disableAudio()
        setCurrentView(ViewStates.LANDER_LOADING)
        console.log('ViewStates.LANDER_LOADING', ViewStates.LANDER_LOADING)
    }

    return currentView === ViewStates.INTRO && (
        <div className={styles['GateStyleBox']}>
            <div className={styles["vh-centered"]}>
                <div className={styles["vh-header"]}>WEBAVERSE HOLDERS ONLY</div>
                <div className={styles["vh-paragraph"]}>
                    This is a preview alpha version of the Webaverse Metaverse. You must
                    connect your MetaMask wallet to continue.
                </div>

                {/*if the user is not logged in, show connect wallet, else show enter with music and enter without music*/}
                {!active && (
                    <div className={styles["vh-button"]} onClick={connectWallet}>
                        CONNECT WALLET
                    </div>
                )}
                {active && (
                    <div>
                        <div className={styles["vh-button"]} onClick={() => enterWithMusic()}>
                            ENTER WITH MUSIC
                        </div>
                        <div className={styles["vh-button"]} onClick={() => enterWithoutMusic()}>
                            ENTER WITHOUT MUSIC
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}