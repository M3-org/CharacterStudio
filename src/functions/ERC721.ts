import { ethers } from 'ethers'
import Moralis from 'moralis'
import axios from 'axios'

/**
 * Moralis SDK config - ERC721
 */
const serverUrl = 'https://idho8yme66sw.usemoralis.com:2053/server' // Moralis Server Url here
const appId = 'DlhiDjWCrl18hk34n2E3ODFpfLsJv5xw7TAh4sya' // Moralis Server App ID here
Moralis.start({ serverUrl, appId })

// Blockchain ERC721 NFT metadata
const apiKey = '3KR3QB1T46GYWMING2CFTN6FPZEBT7SIRV'
const corsUrl = 'https://arcane-eyrie-83731.herokuapp.com/'

const InventoryNFTService = {
  contracts: {},
  getCorsUrl: (url) => {
    return corsUrl + url
  },

  getPinataUrl: (url) => {
    if (!url) return ''
    if (url.includes('ipfs://')) url = url.replace('ipfs://', 'https://ipfs.io/ipfs/')
    if (url.includes('gateway.pinata.cloud')) url = url.replace('gateway.pinata.cloud', 'ipfs.io')
    return url
  },

  getContract: async (address) => {
    if (!InventoryNFTService.contracts[address]) {
      let response = await axios.get(
        `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`
      )
      if (response.status !== 200) return { status: 0 }
      const abi = response.data.result
      console.warn('abi: ', abi)
      const provider = new ethers.providers.EtherscanProvider('homestead', apiKey)
      const contract = new ethers.Contract(address, abi, provider)
      InventoryNFTService.contracts[address] = contract
    }
    return InventoryNFTService.contracts[address]
  },
  getTokenMetadata: async (address, tokenId) => {
    try {
      const contract = InventoryNFTService.getContract(address)
      let response = await (contract as any).functions.tokenURI(tokenId)
      if (!response.length) return { status: 0 }
      const tokenURI = response[0]
      response = await axios.get(InventoryNFTService.getCorsUrl(InventoryNFTService.getPinataUrl(tokenURI)))
      return { status: response.status, data: response.data }
    } catch {
      return { status: 0 }
    }
  }
}

export const getMyERC721Tokens = (): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    const provider = new ethers.providers.Web3Provider((window as any).ethereum)

    // MetaMask requires requesting permission to connect users accounts
    await provider.send('eth_requestAccounts', [])

    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    const signer = provider.getSigner()

    const walletAddress = await signer.getAddress()

    const options = { chain: 'rinkeby', address: walletAddress } as any
    const myNftData = await Moralis.Web3API.account.getNFTs(options)

    resolve(myNftData.result)
  })
}
