
import styled from 'styled-components';
import { SquareButton, ScreenSizeContainer } from './Globals.styled';

import svgDownload from '../../public/ui/download.svg';
import svgMint from '../../public/ui/mint.svg';
import svgWallet from '../../public/ui/connectWallet.svg';
import svgDiconnectWallet from '../../public/ui/diconnectWallet.svg';
import pngMainBackground from "../../public/ui/mainBackground.png"

export const Background = styled(ScreenSizeContainer)`
  background : url(${pngMainBackground});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  overflow: hidden;
`

export const WalletInfo = styled.div`
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  text-transform: ${props => props.ens ? 'uppercase': 'none'} ;
  width: 164px;
  font-size: 14px;
  margin:auto;
  margin-left: -10px;
`

export const WalletImg = styled.div`
  width:74px;
  height: 74px;
  background : url(${svgWallet}) center center no-repeat;
`

export const WalletButton = styled(SquareButton)`
  transition: all 0.1s;
  width: ${props => props.connected ? '225px': '74px'} ;
  justify-content: space-between;
  &:hover ${WalletImg} {
      background : ${props => props.connected ? 
          'url(' + (svgDiconnectWallet) + ') center center no-repeat':
          'url(' + (svgWallet) + ') center center no-repeat' };
  }
`

export const DownloadButton = styled(SquareButton)`

  background : url(${svgDownload}) center center no-repeat;
`

export const MintButton = styled(SquareButton)`
  background : url(${svgMint}) center center no-repeat;
`

export const TextButton = styled(SquareButton)`
  width : 106px;

`
