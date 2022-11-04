
import styled from 'styled-components';
import { SquareButton } from './Globals.styled';

import svgDownload from '../../src/ui/download.svg';
import svgMint from '../../src/ui/mint.svg';
import svgWallet from '../../src/ui/connectWallet.svg';



export const DownloadButton = styled(SquareButton)`
    background : url(${svgDownload}) center center no-repeat;
`

export const MintButton = styled(SquareButton)`
    background : url(${svgMint}) center center no-repeat;
`

export const WalletButton = styled(SquareButton)`
    background : url(${svgWallet}) center center no-repeat;
`

export const TextButton = styled(SquareButton)`
    width : 106px;
`
