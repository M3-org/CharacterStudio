import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import { ethers } from "ethers"
import React, { useEffect, useState } from "react"
import { AccountContext } from "../context/AccountContext"
import { AudioContext } from "../context/AudioContext"
import { ViewContext, ViewStates } from "../context/ViewContext"
import { DelegateCashContract, EternalProxyContract, OTCollectionAddress } from "./Contract"
import CustomButton from "./custom-button"

import styles from "./Gate.module.css"

export default function Gate() {
  const { active, account, activate } =
    useWeb3React()
  const injected = new InjectedConnector({
    supportedChainIds: [137, 1, 3, 4, 5, 42, 97],
  })
  const { currentView, setCurrentView } = React.useContext(ViewContext)

  const { enableAudio, disableAudio } = React.useContext(AudioContext)

  const [ pass, setPass ] =  useState(false)

  const [loading, setLoading] =  useState(true)

  const { setWalletAddress, setOTTokens, setConnected } = React.useContext(AccountContext)

  const connectWallet = async () => {
    console.log("connectWallet")
    await activate(injected)
    setConnected(true);
    setWalletAddress(account)
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

  useEffect(() => {
    if(account) {
      checkGatePass()
    }
  }, [active])

  const checkGatePass = async () => {
    if(await checkOTPass(account)) setPass(true)
    else if(await checkEternalProxyPass()) setPass(true)
    else if(await checkElegateCashPass()) setPass(true)
    else setPass(false)

    setLoading(false);
  }

  const checkOTPass = async () => {
    const testaccount = '0x6e58309CD851A5B124E3A56768a42d12f3B6D104';
    const network = "ETHEREUM"
    const OTTokenList = await fetch(`https://serverless-backend-blue.vercel.app/api/getOpenSeaNFTCollection?walletAddress=${testaccount}&collectionAddress=${OTCollectionAddress}&network=${network}`,
    {
            method: 'get',
            redirect: 'follow'
    }).then(response => response.json())
    if(OTTokenList.nftList.totalCount) {
      const OTTokenIds = OTTokenList.nftList.ownedNfts.map((token) => parseInt(token.id.tokenId))
      setOTTokens(OTTokenIds);
      return true;
    } else return false;
  }

  const checkEternalProxyPass = async () => {
    const signer = new ethers.providers.Web3Provider(
      window.ethereum,
    ).getSigner()
    const contract = new ethers.Contract(EternalProxyContract.address, EternalProxyContract.abi, signer);
    const proxyData = await contract.getColdAndDeliveryAddresses(account);
    if(proxyData.isProxied) {
      if(await checkOTPass(proxyData.cold)) return true;
      else return false;
    } else return false;
  }

  const checkElegateCashPass = async () => {
    DelegateCashContract
    const signer = new ethers.providers.Web3Provider(
      window.ethereum,
    ).getSigner()
    const contract = new ethers.Contract(DelegateCashContract.address, DelegateCashContract.abi, signer);
    const ElegationData = await contract.getDelegationsByDelegate(account);
    if(ElegationData === []) return false
    else {
      const ElegationOTToken = ElegationData.map((delegation) => {
        if(delegation.type === 'TOKEN' && delegation.contract === OTCollectionAddress) return delegation.tokenId
      })
      if(ElegationOTToken.length) {
        setOTTokens(ElegationOTToken)
        return true
      } else return false
    }
  }

  return (
    currentView === ViewStates.INTRO && (
      <div className={styles["GateStyleBox"]}>
          {/*if the user is not logged in, show connect wallet, else show enter with music and enter without music*/}
          {!active && (
            <div className={styles["vh-centered"]}>
              <div className={styles["vh-header"]}>
                GENESIS PASS HOLDERS ONLY
              </div>
              <div className={styles["vh-paragraph"]}>
                This version of the character creator is only for holders of the 
                <strong> Webaverse Genesis Pass</strong>. Please connect your
                wallet. We also check for delegated wallets with 
                <strong> EternalProxy</strong> and <strong>delegate.cash</strong>
              </div>
              <div className={styles["vh-button"]} onClick={connectWallet}>
                <CustomButton
                  theme="light"
                  icon="metamask"
                  text="Connect"
                  size={16}
                  onClick={connectWallet}
                />
              </div>
            </div>
          )}
          {!loading && active && !pass && (
            <div className={styles["vh-centered"]}>
              <div className={styles["vh-header"]}>
                GENESIS PASS HOLDERS ONLY
              </div>
              <div className={styles["vh-paragraph"]}>
                No Genesis Pass found in this wallet.
              </div>
              <div className={styles["vh-paragraph"]}>
                If you are concerned with adding a cold storage wallet, we recommend that you register with delegate.cash or EternalProxy
              </div>
            </div>
          )}
          {!loading && active && pass && (
            <div className={styles["vh-centered"]}>
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
                text="SILENT"
                icon="soundoff"
                size={16}
                onClick={() => enterWithoutMusic()}
              />
                <CustomButton
                  theme="light"
                  text="MUSIC"
                  icon="soundon"
                  size={16}
                  onClick={() => enterWithMusic()}
                />
              </div>
            </div>
          )}
      </div>
    )
  )
}
