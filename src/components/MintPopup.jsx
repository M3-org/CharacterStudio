import axios from "axios"
import { BigNumber, ethers } from "ethers"
import React, { Fragment, useContext, useState } from "react"
import mintPopupImage from "../../public/ui/mint/mintPopup.png"
import polygonIcon from "../../public/ui/mint/polygon.png"
import ethereumIcon from "../../public/ui/mint/ethereum.png"
import { AccountContext } from "../context/AccountContext"
import { SceneContext } from "../context/SceneContext"
import { ViewContext, ViewStates } from "../context/ViewContext"
import { getModelFromScene, getScreenShot } from "../library/utils"
import { CharacterContract } from "./Contract"
import MintModal from "./MintModal"

import styles from "./MintPopup.module.css"

const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY
const pinataSecretApiKey = import.meta.env.VITE_PINATA_API_SECRET

const mintCost = 0.01

export default function MintPopup() {
  const { template, avatar, skinColor, model, currentTemplate } = useContext(SceneContext)
  const { currentView, setCurrentView } = useContext(ViewContext)
  const { walletAddress, connected } =
    useContext(AccountContext)

  // const {  } = useContext(SceneContext)

  const [mintStatus, setMintStatus] = useState("")

  const currentTemplateIndex = parseInt(currentTemplate.index === undefined ? currentTemplate.index : 1)
  const templateInfo = template[currentTemplateIndex]

  async function saveFileToPinata(fileData, fileName) {
    if (!fileData) return console.warn("Error saving to pinata: No file data")
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
          trait_type: trait,
          value: avatar[trait].name,
        })
      }
    })
    return metadataTraits
  }

  const mintAsset = async (avatar) => {
    setCurrentView(ViewStates.MINT_CONFIRM)
    setMintStatus("Uploading...")

    console.log('avatar in mintAsset', avatar)

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
    const glb = await getModelFromScene(avatar.scene.clone(), "glb", skinColor)
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
    // const isActive = await contract.saleIsActive()
    // if (!isActive) {
    //   setMintStatus("Mint isn't Active now!")
    // } else {
      const tokenPrice = await contract.tokenPrice()
      try {
        const options = {
          value: BigNumber.from(tokenPrice).mul(1),
          from: walletAddress,
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
   // }
  }

  const showTrait = (trait) => {
    if (trait.name in avatar) {
      if ("traitInfo" in avatar[trait.name]) {
        return avatar[trait.name].name
      } else return "Default " + trait.name
    } else return "No set"
  }

  return (
    // currentView.includes("MINT") && (
      <div className={styles["StyledContainer"]}>
        <div className={styles["StyledBackground"]} />
        <div className={styles["StyledPopup"]}>
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
                {templateInfo.traits &&
                  templateInfo.traits.map((item, index) => (
                    <div className={styles["TraitBox"]} key={index}>
                      <div className={styles["TraitImage"]} />
                      <img src={templateInfo.traitIconsDirectory + item.icon} />
                      <div className={styles["TraitText"]}>{showTrait(item)}</div>
                    </div>
                  ))}
              </div>
              <div className={styles["MintPriceBox"]}>
                <div className={styles["MintCost"]}>
                  {"Mint Price: "}
                </div>
                <div className={styles["TraitImage"]} />
                <img src={ethereumIcon} height={"40%"} />
                <div className={styles["MintCost"]}>
                  &nbsp;{mintCost}
                </div>
              </div>
              <div className={styles["Title"]} fontSize={"1rem"}>
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
    // )
  )
}
