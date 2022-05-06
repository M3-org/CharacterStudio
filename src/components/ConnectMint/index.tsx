import Button from "@mui/material/Button";
import React from "react";
import "./style.scss";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import GavelIcon from '@mui/icons-material/Gavel';

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

export default function ConnectMint() {
  return (
    <div className="connect-mint-wrap">
      <Button variant="contained" startIcon={<AccountBalanceWalletIcon />}>
        Connect
      </Button>
      <Button variant="contained" startIcon={<GavelIcon />}>
        Mint
      </Button>
    </div>
  );
}
