import React, { Fragment, useContext, useEffect, useState } from "react"
import MintModal from "./MintModal"
import walletErrorImage from "../../public/ui/mint/walletError.png"
import mintPopupImage from "../../public/ui/mint/mintPopup.png"
import polygonIcon from "../../public/ui/mint/polygon.png"
import styled from "styled-components"
import { ViewStates, ViewContext } from "../context/ViewContext"
import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import axios from "axios"
import { BigNumber, ethers } from "ethers"
import { SceneContext } from "../context/SceneContext"
import { getModelFromScene, getScreenShot } from "../library/utils"
import { Contract } from "./Contract"
import { AccountContext } from "../context/AccountContext"

const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY
const pinataSecretApiKey = import.meta.env.VITE_PINATA_SECRET_API_KEY

const mintCost = 0.0

const StyledButton = styled.div`
   {
    background: rgba(81, 90, 116, 0.25);
    border: 2px solid #434b58;
    border-radius: 78px;
    box-sizing: border-box;
    width: 180px;
    height: 50px;
    text-align: center;
    font-family: "Proxima";
    font-style: normal;
    font-weight: 400;
    font-size: 20px;
    line-height: 50px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.3);
    :hover {
      border: 2px solid #4eb0c0;
      color: #ffffff;
    }
    ${(props) =>
      props.selected &&
      `
            border: 2px solid #4EB0C0;
            color: #FFFFFF;
        `}
  }
`
const StyledContainer = styled.div`
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index:10000;
`
const Title = styled.div`
  display: flex;
  justify-content: center;
  text-align: center;
  align-items: center;
  font-size: 1.2rem;
  font-size: ${(props) => props.fontSize || "1.2rem"};
  padding: ${(props) => props.padding || "45px"};
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
`
const StyledBackground = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  background-color: #000000;
`
const StyledPopup = styled.div`
  width: 550px;
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: #1716168d;
  border-color: #38404e;
  border-style: solid;
  border-width: 2px;
  border-radius: 5px;
  align-items: center;
  margin: auto;
  padding: 10px 0 30px;
  border-radius: 10px;
  color: white;
  text-align: center;
  justify-content: space-evenly;
  display: flex;
  flex-flow: column wrap;
`
const Header = styled.div`
  border-bottom: 3px solid #3a7484;
  width: 100%;
  padding: 5px 0px;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  .mintStatus {
    display: flex;
  }
  .mintTitle {
    font-family: "Proxima";
    font-weight: 800;
    font-size: 20px;
    line-height: 32px;
  }
`
const ButtonPanel = styled.div`
  display: flex;
  justify-content: center;
  gap: 50px;
  margin: 10px;
`
const TraitDetail = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 20px 20px 10px 20px;
`

const TraitImage = styled.img`
  height: ${(props) => props.height || "100%"};
  src: ${(props) => props.src || ""};
  padding: 5px;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
`

const TraitText = styled.span`
  font-family: "Proxima";
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  margin: 5px;
  line-height: 91.3%;
  color: #ffffff;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
`

const MintCost = styled.span`
  font-family: "Proxima";
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  margin: 0px;
  line-height: 91.3%;
  color: #ffffff;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
`

const TraitBox = styled.div`
  width: 190px;
  height: 40px;
  display: flex;
  justify-content: left;
  align-items: center;
`

const MintPriceBox = styled.div`
  width: 390px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`

export default function MintPopup({
  template
}) {
  const { currentView, setCurrentView } = useContext(ViewContext)
  const { ensName, setEnsName, connected, setConnected } = useContext(AccountContext)

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
    if(!fileData) return cosnole.warn("Error saving to pinata: No file data")
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

    const screenshot = await getScreenShot("mint-scene");
    if (!screenshot) {
      throw new Error("Unable to get screenshot");
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
    const contract = new ethers.Contract(Contract.address, Contract.abi, signer)
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

  return currentView.includes('MINT') && (
    <StyledContainer>
      <StyledBackground />
      <StyledPopup>
        {!connected && (
          <Fragment>
            <Header>
              <img src={walletErrorImage} className={mintStatus} />
            </Header>
            <Title>{mintStatus}</Title>
            <ButtonPanel>
              <StyledButton onClick={() => setCurrentView(ViewStates.CREATOR)}>
                Cancel{" "}
              </StyledButton>
              <StyledButton onClick={() => connectWallet()}>
                Connect Wallet{" "}
              </StyledButton>
            </ButtonPanel>
          </Fragment>
        )}
        {connected && (
          <Fragment>
            <Header>
              <img
                src={mintPopupImage}
                className={mintStatus}
                height={"50px"}
              />
              <div className="mintTitle">Mint Avatar</div>
            </Header>
            <MintModal model={model} />
            <TraitDetail>
              {template.selectionTraits &&
                template.selectionTraits.map((item, index) => (
                  <TraitBox key={index}>
                    <TraitImage
                      src={template.traitIconsDirectory + item.icon}
                    />
                    <TraitText>{showTrait(item)}</TraitText>
                  </TraitBox>
                ))}
            </TraitDetail>
            <MintPriceBox>
              <MintCost>{"Mint Price: "}</MintCost>
              <TraitImage src={polygonIcon} height={"40%"} />
              <MintCost>{mintCost}</MintCost>
            </MintPriceBox>
            <Title fontSize={"1rem"} padding={"10px 0 20px"}>
              {mintStatus}
            </Title>
            <ButtonPanel>
              <StyledButton onClick={() => setCurrentView(ViewStates.CREATOR)}>
                {" "}
                {currentView === ViewStates.MINT_COMPLETE ? "Ok" : "Cancel"}
              </StyledButton>
              {currentView !== ViewStates.MINT_COMPLETE && (
                <StyledButton onClick={() => mintAsset(model)}>Mint</StyledButton>
              )}
            </ButtonPanel>
          </Fragment>
        )}
      </StyledPopup>
    </StyledContainer>
  )
}
