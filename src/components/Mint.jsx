import axios from "axios"
import { BigNumber, ethers } from "ethers"
import React, { Fragment, useContext, useState, useEffect } from "react"
import ethereumIcon from "../../public/ui/mint/ethereum.png"
import mintPopupImage from "../../public/ui/mint/mintPopup.png"
import { AccountContext } from "../context/AccountContext"
import { SceneContext } from "../context/SceneContext"
import { getModelFromScene, getCroppedScreenshot } from "../library/utils"
import { CharacterContract, EternalProxyContract, webaverseGenesisAddress } from "./Contract"

import styles from "./Mint.module.css"

const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY
const pinataSecretApiKey = import.meta.env.VITE_PINATA_API_SECRET

const mintCost = 0.01

export default function MintPopup({screenshotPosition}) {
  const { avatar, skinColor, model, templateInfo } = useContext(SceneContext)
  const [mintStatus, setMintStatus] = useState("")
  const [tokenPrice, setTokenPrice] = useState(null);
  const chainId = "0x89";

  useEffect(() => {
    ( async () => {
        const defaultProvider = new ethers.providers.StaticJsonRpcProvider('https://polygon-rpc.com/')
        const contract = new ethers.Contract(CharacterContract.address, CharacterContract.abi, defaultProvider)

        const tp = await contract.tokenPrice()
        setTokenPrice( BigNumber.from(tp).mul(1) )
    })();
  }, [])  

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const chain = await window.ethereum.request({ method: 'eth_chainId' })
        if (parseInt(chain, 16) == parseInt(chainId, 16)) {
          const addressArray = await window.ethereum.request({
            method: 'eth_requestAccounts',
          })
          return addressArray.length > 0 ? addressArray[0] : ""
        } else {
            window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: chainId }],
            })
            const addressArray = await window.ethereum.request({
              method: 'eth_requestAccounts',
            })
            return addressArray.length > 0 ? addressArray[0] : ""
        }
      } catch (err) {
        return "";
      }
    } else {
      return "";
    }
  }

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
    let walletAddress = await connectWallet()

    const pass = await checkOT(walletAddress);
    if(pass) {
      setMintStatus("Uploading...")
      console.log('avatar in mintAsset', avatar)

      const screenshot = await getCroppedScreenshot("editor-scene",screenshotPosition.x, screenshotPosition.y, screenshotPosition.width, screenshotPosition.height, true)
      if (!screenshot) {
        throw new Error("Unable to get screenshot")
      }
      let imageName = "AvatarImage_" + Date.now() + ".png";
      const imageHash = await saveFileToPinata(
        screenshot,
        imageName
      ).catch((reason) => {
        console.error(reason)
        setMintStatus("Couldn't save to pinata")
      })
      const glb = await getModelFromScene(avatar.scene.clone(), "glb", skinColor)
      let glbName = "AvatarGlb_" + Date.now() + ".vrm";
      const glbHash = await saveFileToPinata(
        glb,
        glbName
      )
      const attributes = getAvatarTraits()
      const metadata = {
        name: "Avatars",
        description: "Creator Studio Avatars.",
        image: `ipfs://${imageHash.IpfsHash}`,
        animation_url: `ipfs://${glbHash.IpfsHash}`,
        attributes: attributes
      }
      const str = JSON.stringify(metadata)
      const metaDataHash = await saveFileToPinata(
        new Blob([str]),
        "AvatarMetadata_" + Date.now() + ".json",
      )
      const metadataIpfs = `ipfs://${metaDataHash.IpfsHash}`

      setMintStatus("Minting...")
      const signer = new ethers.providers.Web3Provider(
        window.ethereum,
      ).getSigner()
      const contract = new ethers.Contract(CharacterContract.address, CharacterContract.abi, signer)
      try {
        const options = {
          value: tokenPrice,
          from: walletAddress
        }
        const tx = await contract.mintToken(1, metadataIpfs, options)
        let res = await tx.wait()
        if (res.transactionHash) {
          setMintStatus("Mint success!")
        }
      } catch (err) {
        setMintStatus("Public Mint failed! Please check your wallet.")
      }
    } else {
      return;
    }
  }

  const checkOT = async (address) => {
    if(address) {
      const address = '0x6e58309CD851A5B124E3A56768a42d12f3B6D104'
      const ethersigner = ethers.getDefaultProvider("mainnet", {
        alchemy: import.meta.env.VITE_ALCHEMY_API_KEY,
      })
      const contract = new ethers.Contract(EternalProxyContract.address, EternalProxyContract.abi, ethersigner);
      const webaBalance = await contract.beneficiaryBalanceOf(address, webaverseGenesisAddress, 1);
      console.log("webaBalance", webaBalance)
      if(parseInt(webaBalance) > 0) return true;
      else {
        setMintStatus("Currently in alpha. You need a genesis pass to mint. \n Will be public soon!")
        return false;
      }
    } else {
      setMintStatus("Please connect your wallet")
      return false;
    }
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
        <div className={styles["StyledPopup"]}>
          {/* {connected && ( */}
            <Fragment>
              <div className={styles["Header"]}>
                <img
                  src={mintPopupImage}
                  className={mintStatus}
                  height={"50px"}
                />
                <div className={styles["mintTitle"]}>Mint Avatar</div>
              </div>
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
                  onClick={() => mintAsset(model)}
                >
                  Mint
                </div>
              </div>
            </Fragment>
          {/* )} */}
        </div>
      </div>
    // )
  )
}
