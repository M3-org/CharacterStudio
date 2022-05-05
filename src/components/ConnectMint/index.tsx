import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import "./style.scss";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ClearIcon from '@mui/icons-material/Clear';
import AddTaskIcon from '@mui/icons-material/AddTask';
import GavelIcon from '@mui/icons-material/Gavel';
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import axios from "axios";
import { ethers, BigNumber } from "ethers";
import { contractAddress, contractABI } from "../../library/contract"
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useGlobalState } from "../GlobalProvider";

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};
const API_URL = "http://34.214.42.55:8081";

export default function ConnectMint() {
  const { ethereum } = window;
  const { activate, deactivate, library, account } = useWeb3React();
  const { avatarCategory, setAvatarCategory, setNavigation }: any = useGlobalState();

  const injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42, 97],
  });

  const [connected, setConnected] = useState(false)
  const [alertTitle, setAlertTitle] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const connectWallet = async () => {
    try {
      await activate(injected);
    } catch (ex) {
      console.log(ex);
    }
  }
  useEffect(() => {
    account ? setConnected(true) : setConnected(false)
  },[account])
  const disConnectWallet = async () => {
    try {
      deactivate();
      setConnected(false)
    } catch (ex) {
      console.log(ex);
      alertModal(ex.message);
    }
  }

  const alertModal = async (msg : string) => {
    setAlertTitle(msg);
    setShowAlert(true)
    setTimeout(() => {
      setShowAlert(false)
    }, 2000)
  }

  const sendWhitelist = async () => {
    try {
      const message = ethers.utils.solidityKeccak256(
        ["address", "address"],
        [contractAddress, account]
      );
      const arrayifyMessage = ethers.utils.arrayify(message);
      const flatSignature = await library
        .getSigner()
        .signMessage(arrayifyMessage);
      const response = await axios.post(`${API_URL}/new-request`, {
        signature: flatSignature,
        address: account,
      });
      alertModal(response.data.msg);
    } catch (ex) {
      console.log(ex);
    }
  }

  const mintAvatar = async () => {
    // setNavigation("download")
    // alert(avatarCategory) // avatarCategory : 1 - Dom , 2 - Sub
    const signer = new ethers.providers.Web3Provider(
      ethereum
    ).getSigner();
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );
    const responseUser = await axios.get(
      `${API_URL}/get-signature?address=${account}`
    );
    const metadataurl = "https://gateway.pinata.cloud/ipfs/QmWAqBtsn9XcwmTM1oz9pomSW5xVCaFMCRKbZvhJ1Kreia"
    if (responseUser.data.signature) {
      let amountInEther = "0.05";
      try {
        console.log("www")
        const options = { value: ethers.utils.parseEther(amountInEther), from: account };
        let breedtype = BigNumber.from(avatarCategory ? avatarCategory- 1 : 1).toNumber();
        const res = await contract.mintWhiteList( breedtype, metadataurl, responseUser.data.signature, options) // breedtype, tokenuri, signature
        alertModal("Whitelist Mint Success");
      } catch (error) {
        console.log(error);
        alertModal(error.message);
      }
    } else {
        let amountInEther = "0.069";
        try {
          console.log("ddd")
          const options = { value: ethers.utils.parseEther(amountInEther), from: account };
          let breedtype = BigNumber.from(avatarCategory ? avatarCategory- 1 : 1).toNumber();
          await contract.mintNormal( breedtype, metadataurl, options) // breedtype, tokenuri, signature
          alertModal("Public Mint Success");
        } catch (error) {
          console.log(error)
          alertModal(error.message);
        }
    }
    return false;
  }

  return (
    <>
      <div className="connect-mint-wrap">
        {
          !connected ?  <Button variant="contained" startIcon={<AccountBalanceWalletIcon />} onClick={connectWallet} >
                          Connect
                        </Button>
                    :   <>
                          <Button variant="contained" startIcon={<ClearIcon />} onClick={disConnectWallet} >
                            Disconnect
                          </Button>
                          <Button variant="contained" startIcon={<AddTaskIcon />} onClick={sendWhitelist} >
                            Whitelist
                          </Button>
                          <Button variant="contained" startIcon={<GavelIcon />} onClick={mintAvatar} >
                            Mint
                          </Button>
                          <p>{account ? account.slice(0,13) + "..." : ""}</p>
                        </>
        }
      </div>
      {
        showAlert && <Alert
                      id="alertTitle"
                      variant="filled"
                      severity="success"
                      action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          setShowAlert(false);
                        }}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                    sx={{ mb: 2 }}
                  >
                    { alertTitle }
                  </Alert>
      }
    </>
  );
}
