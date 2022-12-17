import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import axios from "axios";
import { BigNumber, ethers } from "ethers";
import React, { Fragment, useContext, useEffect, useState } from "react";
import styled from 'styled-components';

import svgWallet from '../../public/ui/connectWallet.svg';
import svgDiconnectWallet from '../../public/ui/diconnectWallet.svg';
import svgDownload from '../../public/ui/download.svg';
import svgMint from '../../public/ui/mint.svg';
import { apiService, sceneService } from "../context";
import { ApplicationContext } from "../context/ApplicationContext";

const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
const pinataSecretApiKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

export const API_URL = "http://localhost:8081";
export const Contract = {
  owner: "0x634B0510C5062CFf8009eAAc2435eB93bc4764ad",
  // address: "0x69341F01C2113E2d09Cd4837bbF1786dfbBc41d7", // Polygon mainet
  address: "0x1bCb97c2242A66CD3FC6875d979fD11CF9Feedd0", // Goerli testnet
  abi: [{
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  }, {
    "inputs": [],
    "name": "ApprovalCallerNotOwnerNorApproved",
    "type": "error"
  }, {
    "inputs": [],
    "name": "ApprovalQueryForNonexistentToken",
    "type": "error"
  }, {
    "inputs": [],
    "name": "ApprovalToCurrentOwner",
    "type": "error"
  }, {
    "inputs": [],
    "name": "ApproveToCaller",
    "type": "error"
  }, {
    "inputs": [],
    "name": "BalanceQueryForZeroAddress",
    "type": "error"
  }, {
    "inputs": [],
    "name": "MintToZeroAddress",
    "type": "error"
  }, {
    "inputs": [],
    "name": "MintZeroQuantity",
    "type": "error"
  }, {
    "inputs": [],
    "name": "OwnerIndexOutOfBounds",
    "type": "error"
  }, {
    "inputs": [],
    "name": "OwnerQueryForNonexistentToken",
    "type": "error"
  }, {
    "inputs": [],
    "name": "TokenIndexOutOfBounds",
    "type": "error"
  }, {
    "inputs": [],
    "name": "TransferCallerNotOwnerNorApproved",
    "type": "error"
  }, {
    "inputs": [],
    "name": "TransferFromIncorrectOwner",
    "type": "error"
  }, {
    "inputs": [],
    "name": "TransferToNonERC721ReceiverImplementer",
    "type": "error"
  }, {
    "inputs": [],
    "name": "TransferToZeroAddress",
    "type": "error"
  }, {
    "inputs": [],
    "name": "UnableDetermineTokenOwner",
    "type": "error"
  }, {
    "inputs": [],
    "name": "UnableGetTokenOwnerByIndex",
    "type": "error"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "owner",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "approved",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }],
    "name": "Approval",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "owner",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "operator",
      "type": "address"
    }, {
      "indexed": false,
      "internalType": "bool",
      "name": "approved",
      "type": "bool"
    }],
    "name": "ApprovalForAll",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "previousOwner",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "newOwner",
      "type": "address"
    }],
    "name": "OwnershipTransferred",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "internalType": "uint256",
      "name": "_maxTokens",
      "type": "uint256"
    }],
    "name": "SetMaxTokensPurchase",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": false,
      "internalType": "uint256",
      "name": "_maxTokens",
      "type": "uint256"
    }],
    "name": "SetMaxTokensWallet",
    "type": "event"
  }, {
    "anonymous": false,
    "inputs": [{
      "indexed": true,
      "internalType": "address",
      "name": "from",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "address",
      "name": "to",
      "type": "address"
    }, {
      "indexed": true,
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }],
    "name": "Transfer",
    "type": "event"
  }, {
    "inputs": [],
    "name": "MAX_TOKENS",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "to",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "owner",
      "type": "address"
    }],
    "name": "balanceOf",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "flipSaleState",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }],
    "name": "getApproved",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "owner",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "operator",
      "type": "address"
    }],
    "name": "isApprovedForAll",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "maxTokenPerWallet",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "maxTokenPurchase",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "numberOfTokens",
      "type": "uint256"
    }, {
      "internalType": "string",
      "name": "_tokenURI",
      "type": "string"
    }],
    "name": "mintToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "name",
    "outputs": [{
      "internalType": "string",
      "name": "",
      "type": "string"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "notRevealedUri",
    "outputs": [{
      "internalType": "string",
      "name": "",
      "type": "string"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "owner",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }],
    "name": "ownerOf",
    "outputs": [{
      "internalType": "address",
      "name": "",
      "type": "address"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "reveal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "revealed",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "from",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "to",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "from",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "to",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }, {
      "internalType": "bytes",
      "name": "_data",
      "type": "bytes"
    }],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "saleIsActive",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "operator",
      "type": "address"
    }, {
      "internalType": "bool",
      "name": "approved",
      "type": "bool"
    }],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "_maxTokens",
      "type": "uint256"
    }],
    "name": "setMaxTokensPurchase",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "_maxTokens",
      "type": "uint256"
    }],
    "name": "setMaxTokensWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "bytes4",
      "name": "interfaceId",
      "type": "bytes4"
    }],
    "name": "supportsInterface",
    "outputs": [{
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "symbol",
    "outputs": [{
      "internalType": "string",
      "name": "",
      "type": "string"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "index",
      "type": "uint256"
    }],
    "name": "tokenByIndex",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "owner",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "index",
      "type": "uint256"
    }],
    "name": "tokenOfOwnerByIndex",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "tokenPrice",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }],
    "name": "tokenURI",
    "outputs": [{
      "internalType": "string",
      "name": "",
      "type": "string"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }],
    "stateMutability": "view",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "from",
      "type": "address"
    }, {
      "internalType": "address",
      "name": "to",
      "type": "address"
    }, {
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [{
      "internalType": "address",
      "name": "newOwner",
      "type": "address"
    }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }, {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }]
}

import MintPopup from "./MintPopup";

const SquareButton = styled.div`
    transition : .3s;
    font-family : Proxima;
    background-repeat: no-repeat;
    background-position: center;
    margin: auto;
    color : rgba(255, 255, 255, 0.5);
    width: ${props => props.width || '74px'};
    height: ${props => props.height || '74px'};
    border: 1px solid #434B58;
    backdrop-filter: blur(22.5px);
    border-radius: 5px;
    display : flex;
    justify-content : center;
    align-items : center;
    box-sizing: border-box;
    opacity : 0.8;
    user-select : none;
    cursor:pointer;
    &:hover {
        backdrop-filter: blur(1.5px);
        border-color : white;
        opacity : 1.0;
        color:white;
    }
`

const TopRightMenu = styled.div`
  display : flex;
  top : 37px;
  right : 44px;
  position : absolute;
  gap :20px;
`

const WalletInfo = styled.div`
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  text-transform: ${props => props.ens ? 'uppercase': 'none'} ;
  width: 164px;
  font-size: 14px;
  margin:auto;
  margin-left: -10px;
`

const WalletImg = styled.div`
  width:74px;
  height: 74px;
  background : url(${svgWallet}) center center no-repeat;
`

const WalletButton = styled(SquareButton)`
  transition: all 0.1s;
  width: ${props => props.connected ? '225px': '74px'} ;
  justify-content: space-between;
  &:hover ${WalletImg} {
      background : ${props => props.connected ? 
          'url(' + (svgDiconnectWallet) + ') center center no-repeat':
          'url(' + (svgWallet) + ') center center no-repeat' };
  }
`

const DownloadButton = styled(SquareButton)`

  background : url(${svgDownload}) center center no-repeat;
`

const MintButton = styled(SquareButton)`
  background : url(${svgMint}) center center no-repeat;
`

const TextButton = styled(SquareButton)`
  width : 106px;
`

export const ButtonMenu = () => {

  const type = "CHANGEME"; // class type

  const [showType, setShowType] = useState(false);
  const [connected, setConnected] = useState(false);
  const [ensName, setEnsName] = useState("");

  const { activate, deactivate, library, account } = useWeb3React();
  const injected = new InjectedConnector({
    supportedChainIds: [137, 1, 3, 4, 5, 42, 97],
  });

  const {
    avatar, skinColor, model, setConfirmWindow, setMintLoading, setMintStatus, setMintDone,
  } = useContext(ApplicationContext);

  useEffect(() => {
    if (account) {
      _setAddress(account);
      setConnected(true);
    } else {
      setConnected(false);
      setMintStatus("Please connect your wallet.");
    }
  }, [account]);

  const _setAddress = async (address) => {
    const { name, avatar } = await getAccountDetails(address);
    console.log("ens", name);
    setEnsName(name ? name.slice(0, 15) + "..." : "");
  };

  const getAccountDetails = async (address) => {
    const provider = ethers.getDefaultProvider("mainnet", {
      alchemy: import.meta.env.VITE_ALCHEMY_API_KEY,
    });
    const check = ethers.utils.getAddress(address);

    try {
      const name = await provider.lookupAddress(check);
      if (!name)
        return {};
      return { name };
    } catch (err) {
      console.warn(err.stack);
      return {};
    }
  };

  const disconnectWallet = async () => {
    try {
      deactivate();
      setConnected(false);
    } catch (ex) {
      console.log(ex);
    }
  };

  const handleDownload = () => {
    showType ? setShowType(false) : setShowType(true);
  };

  const download = (format, type) => {
    sceneService.download(model, `UpstreetAvatars_${type}`, format, false);
  };

  const connectWallet = async () => {
    try {
      await activate(injected);
      setMintStatus("Your wallet has been connected.");
    } catch (ex) {
      console.log(ex);
    }
  };

async function saveFileToPinata(fileData, fileName) {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  let data = new FormData();
  data.append("file", fileData, fileName);
  let resultOfUpload = await axios.post(url, data, {
      maxContentLength: "Infinity", //this is needed to prevent axios from erroring out with large files
      maxBodyLength: "Infinity", //this is needed to prevent axios from erroring out with large files
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey,
      },
    });
    return resultOfUpload.data;
}

  const getAvatarTraits = () => {
    let metadataTraits = [];
    Object.keys(avatar).map((trait) => {
      if (Object.keys(avatar[trait]).length !== 0) {
        metadataTraits.push({
          trait_type: trait,
          value: avatar[trait].traitInfo.name,
        });
      }
    });
    return metadataTraits;
  };

  const mintAsset = async () => {
    if (account == undefined) {
      setMintStatus("Please connect the wallet");
      setConfirmWindow(true);
      return;
    }
    //setMintCost(10);
    setConfirmWindow(true);
    setMintStatus("Uploading...");
    setMintLoading(true);

    sceneService.getScreenShot().then(async (screenshot) => {
      if (screenshot) {
        const imageHash = await apiService
          .saveFileToPinata(screenshot, "AvatarImage_" + Date.now() + ".png")
          .catch((reason) => {
            console.error(reason);
            setMintStatus("Couldn't save to pinata");
            setMintLoading(false);
          });
        sceneService.getModelFromScene(avatar.scene.clone(), 'glb', skinColor).then(async (glb) => {
          const glbHash = await saveFileToPinata(
            glb,
            "AvatarGlb_" + Date.now() + ".glb"
          );
          const attributes = getAvatarTraits();
          const metadata = {
            name: "Avatars",
            description: "Creator Studio Avatars.",
            image: `ipfs://${imageHash.IpfsHash}`,
            animation_url: `ipfs://${glbHash.IpfsHash}`,
            attributes,
          };
          const str = JSON.stringify(metadata);
          const metaDataHash = await apiService.saveFileToPinata(
            new Blob([str]),
            "AvatarMetadata_" + Date.now() + ".json"
          );
          await mintNFT("ipfs://" + metaDataHash.IpfsHash);
        });
      }
    });
  };

  const mintNFT = async (metadataIpfs) => {
    setMintStatus("Minting...");
    const chainId = 5; // 1: ethereum mainnet, 4: rinkeby 137: polygon mainnet 5: // Goerli testnet
    if (window.ethereum.networkVersion !== chainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x5" }], // 0x4 is rinkeby. Ox1 is ethereum mainnet. 0x89 polygon mainnet  0x5: // Goerli testnet
        });
      } catch (err) {
        // notifymessage("Please check the Ethereum mainnet", "error");
        setMintStatus("Please check the Polygon mainnet");
        setMintLoading(false);
        return false;
      }
    }
    const signer = new ethers.providers.Web3Provider(
      window.ethereum
    ).getSigner();
    const contract = new ethers.Contract(Contract.address, Contract.abi, signer);
    const isActive = await contract.saleIsActive();
    if (!isActive) {
      setMintStatus("Mint isn't Active now!");
      setMintLoading(false);
    } else {
      const tokenPrice = await contract.tokenPrice();
      try {
        const options = {
          value: BigNumber.from(tokenPrice).mul(1),
          from: account,
        };
        const tx = await contract.mintToken(1, metadataIpfs, options);
        let res = await tx.wait();
        if (res.transactionHash) {
          setMintStatus("Mint success!");
          setMintDone(true);
          setMintLoading(false);
        }
      } catch (err) {
        setMintStatus("Public Mint failed! Please check your wallet.");
        setMintLoading(false);
      }
    }
  };

  return (
    <TopRightMenu>
      {showType && (
        <Fragment>
          <TextButton onClick={() => download("vrm", type)}>
            <span>VRM</span>
          </TextButton>
          <TextButton onClick={() => download("glb", type)}>
            <span>GLB</span>
          </TextButton>
        </Fragment>
      )}

      <DownloadButton onClick={handleDownload} />
      <MintButton
        onClick={() => {
          setConfirmWindow(true);
        }} />
      <WalletButton
        connected={connected}
        onClick={connected ? disconnectWallet : connectWallet}
      >
        {connected ? (
          <WalletInfo ens={ensName}>
            {ensName ? ensName : account ? account.slice(0, 15) + "..." : ""}
          </WalletInfo>
        ) : (
          ""
        )}
        <WalletImg />
        <MintPopup
          connected={connected}
          connectWallet={connectWallet}
          mintAsset={mintAsset} />
      </WalletButton>
    </TopRightMenu>
  );
};
