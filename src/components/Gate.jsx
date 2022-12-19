import React from "react"
import { InjectedConnector } from "@web3-react/injected-connector"
import { ViewContext, ViewStates } from "../context/ViewContext"
import { useWeb3React } from "@web3-react/core"
import { AudioContext } from "../context/AudioContext"
import CustomButton from "./custom-button"

import styles from "./Gate.module.css"

export default function Gate() {
  const { active, account, library, connector, activate, deactivate } =
    useWeb3React()
  const injected = new InjectedConnector({
    supportedChainIds: [137, 1, 3, 4, 5, 42, 97],
  })
  const { currentView, setCurrentView } = React.useContext(ViewContext)

  const { enableAudio, disableAudio } = React.useContext(AudioContext)

  const connectWallet = async () => {
    console.log("connectWallet")
    await activate(injected)
  }

  const enterWithMusic = () => {
    enableAudio()
    setCurrentView(ViewStates.LANDER_LOADING)
    console.log("ViewStates.LANDER_LOADING", ViewStates.LANDER_LOADING)
  }

  const enterWithoutMusic = () => {
    disableAudio()
    setCurrentView(ViewStates.LANDER_LOADING)
    console.log("ViewStates.LANDER_LOADING", ViewStates.LANDER_LOADING)
  }

  return (
    currentView === ViewStates.INTRO && (
      <div className={styles["GateStyleBox"]}>
        <div className={styles["vh-centered"]}>
          {/*if the user is not logged in, show connect wallet, else show enter with music and enter without music*/}
          {!active && (
            <>
              <div className={styles["vh-header"]}>
                GENESIS PASS HOLDERS ONLY
              </div>
              <div className={styles["vh-paragraph"]}>
                This version of the character creator is only for holders of the
                <strong>Webaverse Genesis Pass</strong>. Please connect your
                wallet. We also check for delegated wallets with
                <strong>EternalProxy</strong> and <strong>delegate.cash</strong>
              </div>
              <div className={styles["vh-button"]} onClick={connectWallet}>
                <CustomButton
                  theme="light"
                  icon="metamask"
                  text="Connect Wallet"
                  size={16}
                  onClick={connectWallet}
                />
              </div>
            </>
          )}
          {active && (
            <>
              <div className={styles["vh-header"]}>WELCOME, FRIEND</div>
              <div className={styles["vh-paragraph"]}>
                We have located your Genesis Pass. LFG!
              </div>
              <div className={styles["vh-paragraph"]}>
                We recommend the experience with sound enabled. We made a custom
                song just for this experience!
              </div>
              <div className={styles["vh-button"]}>
                <CustomButton
                  theme="light"
                  text="MUSIC"
                  size={16}
                  onClick={() => enterWithMusic()}
                />
                <CustomButton
                  theme="light"
                  text="NO MUSIC"
                  size={16}
                  onClick={() => enterWithoutMusic()}
                />
              </div>
            </>
          )}
        </div>
      </div>
    )
  )
}
