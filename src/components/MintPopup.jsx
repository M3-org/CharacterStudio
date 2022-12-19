import React, { Fragment, useContext, useEffect, useState } from "react"
import MintModal from "./MintModal"
import walletErrorImage from "../../public/ui/mint/walletError.png"
import mintPopupImage from "../../public/ui/mint/mintPopup.png"
import polygonIcon from "../../public/ui/mint/polygon.png"
import { ViewStates, ViewContext } from "../context/ViewContext"
import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import axios from "axios"
import { BigNumber, ethers } from "ethers"
import { SceneContext } from "../context/SceneContext"
import { getModelFromScene, getScreenShot } from "../library/utils"
import { CharacterContract } from "./Contract"
import { AccountContext } from "../context/AccountContext"

import styles from "./MintPopup.module.css"

const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY
const pinataSecretApiKey = import.meta.env.VITE_PINATA_SECRET_API_KEY

const mintCost = 0.0

export default function MintPopup({ template }) {
  const { currentView, setCurrentView } = useContext(ViewContext)
  const { ensName, setEnsName, connected, setConnected } =
    useContext(AccountContext)

  const { activate, deactivate, library, account } = useWeb3React()
  const injected = new InjectedConnector({
    supportedChainIds: [137, 1, 3, 4, 5, 42, 97],
  })

  const { avatar, skinColor, model } = useContext(SceneContext)

  const [mintStatus, setMintStatus] = useState("")

  useEffect(() => {
    if (account) {
      _setAddress(account)
      setConnected(true)
    } else {
      setConnected(false)
      setMintStatus("Please connect your wallet.")
    }
  }, [account])

  const _setAddress = async (address) => {
    const { name } = await getAccountDetails(address)
    console.log("ens", name)
    setEnsName(name ? name.slice(0, 15) + "..." : "")
  }

  const getAccountDetails = async (address) => {
    const provider = ethers.getDefaultProvider("mainnet", {
      alchemy: import.meta.env.VITE_ALCHEMY_API_KEY,
    })
    const check = ethers.utils.getAddress(address)

    try {
      const name = await provider.lookupAddress(check)
      if (!name) return {}
      return { name }
    } catch (err) {
      console.warn(err.stack)
      return {}
    }
  }

  const disconnectWallet = async () => {
    try {
      deactivate()
      setConnected(false)
    } catch (ex) {
      console.log(ex)
    }
  }

  const connectWallet = async () => {
    try {
      await activate(injected)
      setMintStatus("Your wallet has been connected.")
    } catch (ex) {
      console.log(ex)
    }
  }

  async function saveFileToPinata(fileData, fileName) {
    if (!fileData) return cosnole.warn("Error saving to pinata: No file data")
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`
    let data = new FormData()
    data.append("file", fileData, fileName)
    let resultOfUpload = await axios.post(url, data, {
      maxContentLength: "Infinity", //this is needed to prevent axios from erroring out with large files
      maxBodyLength: "Infinity", //this is needed to prevent axios from erroring out with large files
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    })
    return resultOfUpload.data
  }

  const getAvatarTraits = () => {
    let metadataTraits = []
    Object.keys(avatar).map((trait) => {
      if (Object.keys(avatar[trait]).length !== 0) {
        metadataTraits.push({
          traits: avatar[trait].traitInfo.name,
        })
      }
    })
    return metadataTraits
  }

  const mintAsset = async (avatar) => {
    if (account == undefined) {
      setMintStatus("Please connect the wallet")
      return
    }
    setCurrentView(ViewStates.MINT_CONFIRM)
    setMintStatus("Uploading...")

    const screenshot = await getScreenShot("mint-scene")
    if (!screenshot) {
      throw new Error("Unable to get screenshot")
    }

    const imageHash = await saveFileToPinata(
      screenshot,
      "AvatarImage_" + Date.now() + ".png",
    ).catch((reason) => {
      console.error(reason)
      setMintStatus("Couldn't save to pinata")
    })
    const glb = getModelFromScene(avatar.scene.clone(), "glb", skinColor)
    const glbHash = await saveFileToPinata(
      glb,
      "AvatarGlb_" + Date.now() + ".glb",
    )
    const attributes = getAvatarTraits()
    const metadata = {
      name: "Avatars",
      description: "Creator Studio Avatars.",
      image: `ipfs://${imageHash.IpfsHash}`,
      animation_url: `ipfs://${glbHash.IpfsHash}`,
      attributes,
    }
    const str = JSON.stringify(metadata)
    const metaDataHash = await saveFileToPinata(
      new Blob([str]),
      "AvatarMetadata_" + Date.now() + ".json",
    )
    const metadataIpfs = metaDataHash.IpfsHash

    setMintStatus("Minting...")
    const chainId = 5 // 1: ethereum mainnet, 4: rinkeby 137: polygon mainnet 5: // Goerli testnet
    if (window.ethereum.networkVersion !== chainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x5" }], // 0x4 is rinkeby. Ox1 is ethereum mainnet. 0x89 polygon mainnet  0x5: // Goerli testnet
        })
      } catch (err) {
        // notifymessage("Please check the Ethereum mainnet", "error");
        setMintStatus("Please check the Polygon mainnet")
        return false
      }
    }
    const signer = new ethers.providers.Web3Provider(
      window.ethereum,
    ).getSigner()
    const contract = new ethers.Contract(CharacterContract.address, CharacterContract.abi, signer)
    const isActive = await contract.saleIsActive()
    if (!isActive) {
      setMintStatus("Mint isn't Active now!")
    } else {
      const tokenPrice = await contract.tokenPrice()
      try {
        const options = {
          value: BigNumber.from(tokenPrice).mul(1),
          from: account,
        }
        const tx = await contract.mintToken(1, metadataIpfs, options)
        let res = await tx.wait()
        if (res.transactionHash) {
          setMintStatus("Mint success!")
          setCurrentView(ViewStates.MINT_COMPLETE)
        }
      } catch (err) {
        setMintStatus("Public Mint failed! Please check your wallet.")
      }
    }
  }

  const showTrait = (trait) => {
    if (trait.name in avatar) {
      if ("traitInfo" in avatar[trait.name]) {
        return avatar[trait.name].traitInfo.name
      } else return "Default " + trait.name
    } else return colorStatusmodel
  }

  return (
    currentView.includes("MINT") && (
      <div className={styles["StyledContainer"]}>
        <div className={styles["StyledBackground"]} />
        <div className={styles["StyledPopup"]}>
          {!connected && (
            <Fragment>
              <div className={styles["Header"]}>
                <img src={walletErrorImage} className={mintStatus} />
              </div>
              <div className={styles["Title"]}>{mintStatus}</div>
              <div className={styles["ButtonPanel"]}>
                <div
                  className={styles["StyledButton"]}
                  onClick={() => setCurrentView(ViewStates.CREATOR)}
                >
                  Cancel{" "}
                </div>
                <div className={styles["StyledButton"]} onClick={() => connectWallet()}>
                  Connect Wallet{" "}
                </div>
              </div>
            </Fragment>
          )}
          {connected && (
            <Fragment>
            <div className={styles["Header"]}>
              <img
                  src={mintPopupImage}
                  className={mintStatus}
                  height={"50px"}
                />
                <div className={styles["mintTitle"]}>Mint Avatar</div>
              </div>
              <MintModal model={model} />
              <div className={styles["TraitDetail"]}>
                {template.selectionTraits &&
                  template.selectionTraits.map((item, index) => (
                    <TraitBox key={index}>
                      <div className={styles["TraitImage"]} />
                      <img src={template.traitIconsDirectory + item.icon} />
                      <div className={styles["TraitText"]}>{showTrait(item)}</div>
                    </TraitBox>
                  ))}
              </div>
              <div className={styles["MintPriceBox"]}>
                <div className={styles["MintCost"]}>
                  {"Mint Price: "}
                </div>
                <div className={styles["TraitImage"]} />
                <img src={polygonIcon} height={"40%"} />
                <div className={styles["MintCost"]}>
                  {mintCost}
                </div>
              </div>
              <div className={styles["Title"]} fontSize={"1rem"} padding={"10px 0 20px"}>
                {mintStatus}
              </div>
              <div className={styles["ButtonPanel"]}>
                <div
                  className={styles["StyledButton"]}
                  onClick={() => setCurrentView(ViewStates.CREATOR)}
                >
                  {" "}
                  {currentView === ViewStates.MINT_COMPLETE ? "Ok" : "Cancel"}
                </div>
                {currentView !== ViewStates.MINT_COMPLETE && (
                  <div
                    className={styles["StyledButton"]}
                    onClick={() => mintAsset(model)}
                  >
                    Mint
                  </div>
                )}
              </div>
            </Fragment>
          )}
        </div>
      </div>
    )
  )
}
