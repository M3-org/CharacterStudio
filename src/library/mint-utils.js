import { BigNumber, ethers } from "ethers"
import { getVRMBlobData } from "./download-utils"
import { CharacterContract, EternalProxyContract, webaverseGenesisAddress } from "../components/Contract"
import { SolanaManager } from "./solanaManager"
import { Connection, Transaction } from "@solana/web3.js";
// import { Connection, PublicKey } from '@solana/web3.js';
// import { Metaplex } from '@metaplex-foundation/js';
import axios from "axios"

const rpcKey = import.meta.env.VITE_HELIUS_KEY;
const rpcUrl = `https://devnet.helius-rpc.com/?api-key=${rpcKey}`

const opensea_Key = import.meta.env.VITE_OPENSEA_KEY;
const validation_server = import.meta.env.VITE_VALIDATION_SERVER_URL;

const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY
const pinataSecretApiKey = import.meta.env.VITE_PINATA_API_SECRET

//const mintCost = 0.01
const chainId = "0x89";
let tokenPrice;

const manager = new SolanaManager();
console.log(manager);

// setTimeout(() => {
//   console.log("t")
//   getContract("0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7");
// }, 5000);



async function getContract(address) {
  const contractAddress = address; // Loot NFT contract address
  const tokenId = 1; // Replace with the desired token ID

  // ABI for a typical ERC721 contract (simplified)
  const abi = [
      "function tokenURI(uint256 tokenId) view returns (string)"
  ];

  const key = await import.meta.env.ALCHEMY_API_KEY;
  const defaultProvider = new ethers.providers.AlchemyProvider('mainnet', key);

  //const defaultProvider = new ethers.providers.AlchemyProvider('mainnet', key);
  // Use Ethereum mainnet provider
  //const defaultProvider = ethers.getDefaultProvider('mainnet');
  //const defaultProvider = new ethers.providers.StaticJsonRpcProvider('https://polygon-rpc.com/')
  console.log(defaultProvider);
  try {
    // Connect to the contract
    const contract = new ethers.Contract(contractAddress, abi, defaultProvider);
    console.log("Contract instance:", contract);

    // Fetch the token URI (metadata URL)
    const tokenURI = await contract.tokenURI(tokenId);
    console.log("Token URI:", tokenURI);

    // Handle the metadata (your existing logic continues here)
  } catch (error) {
    console.error("Error fetching metadata:", error);
  }
}


async function getTokenPrice(){
  if (tokenPrice != null)
    return tokenPrice
  const defaultProvider = new ethers.providers.StaticJsonRpcProvider('https://polygon-rpc.com/')
  const contract = new ethers.Contract(CharacterContract.address, CharacterContract.abi, defaultProvider)
  const tp = await contract.tokenPrice()
  tokenPrice = BigNumber.from(tp).mul(1);
  return tokenPrice
}


export function ownsCollection (wallet, network, collection){
  return new Promise((resolve, reject) => {
    fetchOwnedNFTs(wallet, network, collection).then(response=>{
      resolve (response?.nfts?.length > 0);
    }).catch(err=>{
      reject(err);
    })
  });
}

export function fetchSolanaPurchasedAssets(walletAddress, delegateAddress, collectionName){
  return new Promise((resolve, reject) => {
    manager.getUserCNFTs(walletAddress,delegateAddress,collectionName)
      .then(response=>{
        resolve(response)
      }).catch(err => {
        // Reject the Promise with the error encountered during the fetch
        reject(err);
      });
  });
}

export function buySolanaPurchasableAssets(merchantPublicKey, treeAddress, collectionName, amount, purchaseNFTs){
  
  return new Promise(async(resolve, reject) => {
    const { solana } = window;
    console.log(window.solana)

    if (!solana || !solana.isPhantom) {
        alert("Please install Phantom Wallet!");
        reject();
    }
    if (!validation_server) {
      alert("VITE_VALIDATION_SERVER_URL not defined in .env");
      reject();
    }
    try{
      const solanaAddress = await window.solana.connect();
      const buyerPublicKey = solanaAddress.publicKey.toString();
      const response = await fetch(`${validation_server}/request-payment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
            body: JSON.stringify({ buyerPublicKey, merchantPublicKey, treeAddress, collectionName, purchaseNFTs, amount })
      });

      const data = await response.json();
      if (data.transaction) {
        const transaction = data.transaction;
        const signature = await signAndSendTransaction(transaction);
        if (signature == null){
          reject();
        }
        else{
          resolve();
        }
      } else {
        console.error("Error requesting payment:", data.error);
        reject();
      }
    }
    catch(e){
      //console.log(data);
      console.error("Error requesting payment:", e.message);
      reject();
    }
    

  });
}

async function signAndSendTransaction(base64Transaction) {
  const { solana } = window;
  if (!solana || !solana.isPhantom) {
      alert("Please install Phantom Wallet!");
      return;
  }

  try {
      const connection = new Connection(rpcUrl);

      // Decode Base64 transaction to Uint8Array
      const transactionBytes = Uint8Array.from(atob(base64Transaction), (c) => c.charCodeAt(0));
      const decodedTransaction = Transaction.from(transactionBytes);

      // Request wallet to sign the transaction
      const signedTransaction = await solana.signTransaction(decodedTransaction);
      
      // Send the signed transaction to Solana network
      const signature = await connection.sendRawTransaction(signedTransaction.serialize({ requireAllSignatures: false }));

      console.log("✅ Transaction Signature:", signature);
      return signature;
  } catch (error) {
      console.error("❌ Transaction failed:", error);
      if (error.logs) {
          console.error("🔍 Transaction logs:", error.logs);
      } else if (error.signature) {
          // Manually fetch logs from the blockchain
          console.log("Fetching logs for signature:", error.signature);
          const logs = await connection.getTransaction(error.signature, { commitment: "confirmed" });
          console.error("🔍 Transaction logs:", logs?.meta?.logMessages);
      }
  }
}

/**
 * Fetches Opensea collection data for a specific Ethereum account and collection.
 *
 * @param {string} address - The Ethereum account address.
 * @param {string} collection - The name or identifier of the Opensea collection.
 * @returns {Promise} A Promise that resolves with the JSON response from the Opensea API.
 */


export function fetchOwnedNFTs (walletAddress, network, collection){
  switch (network.toLowerCase()) {
    case 'ethereum':{
      return fetchFromOpensea(walletAddress, "ethereum", collection);
    }
    case 'polygon':{
      return fetchFromOpensea(walletAddress, "matic", collection);
    }
    case 'solana':{
      console.warn("solana work in progress");
      return Promise.resolve(false);
      return fetchFromMetaplex(walletAddress, collection);
    }
    default:{
      console.log("Unsupported Netwrok: " + walletAddress)
      return Promise.resolve(false);
    }
  }
}


const fetchFromOpensea = (walletAddress, chain, collection) => {
  if (opensea_Key == null){
    console.error("No opensea key was provided. Cant fetch user's owned nft's");
    return;
  }
  const options = {
    method: 'GET',
    headers: { accept: 'application/json', 'x-api-key': opensea_Key },
  };
  // Returning a Promise
  return new Promise((resolve, reject) => {
    fetch('https://api.opensea.io/api/v2/chain/' + chain + '/account/' + walletAddress + '/nfts?limit=200&collection=' + collection, options)
      .then(response => {
        // Check if the response status is ok (2xx range)
        if (response.ok) {
          
          return response.json();
        } else {
          // If the response status is not ok, reject the Promise with an error message
          reject('Failed to fetch data from Opensea API');
        }
      })
      .then(response => {
        // Resolve the Promise with the JSON response
        console.log(response)
        resolve(response);
      })
      .catch(err => {
        // Reject the Promise with the error encountered during the fetch
        reject(err);
      });
  });
}


const fetchFromMetaplex = (walletAddress, collection) =>{
  console.log("work in progress");
  // return new Promise((resolve, reject) => {
  //   const connection = new Connection('https://api.mainnet-beta.solana.com'); // Mainnet endpoint
  //   const metaplex = new Metaplex(connection);

  //   const ownerPublicKey = new PublicKey(walletAddress);

  //   metaplex.nfts().findAllByOwner({ owner: ownerPublicKey })
  //     .then(nfts => {
  //       console.log(collection);
  //       console.log(nfts);
  //       resolve(nfts); // Resolving with the NFTs data
  //     })
  //     .catch(error => {
  //       reject(error); // Rejecting the promise in case of an error
  //     });
  // });
}


/**
 * Switches the active wallet to a specific blockchain and retrieves the wallet address.
 * 
 * @param {string} network - The blockchain name (`"ethereum"`, `"polygon"` or `"solana"`).
 * @param {string} wallet - The wallet name (`"metamask"`, `"phantom"` or `"solana"`).
 * @returns {Promise<string>} A promise resolving to the active wallet address, or an empty string on error.
 */
export function connectWallet(network) {
  console.log("connect wallet:", network);
  return new Promise(async (resolve, reject) => {
    try {
      switch (network.toLowerCase()) {
        case 'ethereum':
        case 'polygon': {
          if (!window.ethereum) {
            return reject(new Error('Ethereum wallet is not available.'));
          }
         
          const chainIdMap = {
            ethereum: '0x1', // Ethereum Mainnet
            polygon: '0x89', // Polygon Mainnet
          };
          const targetChain = network.toLowerCase() == ethereum ? chainIdMap.ethereum : chainIdMap.polygon;

          await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: targetChain }],
          })  

          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts',
          });

          return resolve(accounts.length > 0 ? accounts[0] : '');
        }

        case 'solana': {
          if (!window.solana || !window.solana.isPhantom) {
            return reject(new Error('Solana wallet (Phantom) is not available.'));
          }
          const response = await window.solana.connect();
          return resolve(response.publicKey.toString());
        }

        default:
          return reject(new Error('Unsupported network.'));
      }
    } catch (error) {
      return reject(error);
    }
  });
}



// ready to test
// export async function connectWallet(){
//   if (window.ethereum) {
//     try {
//       const chain = await window.ethereum.request({ method: 'eth_chainId' })
      
//       if (parseInt(chain, 16) == parseInt(chainId, 16)) {
//         const addressArray = await window.ethereum.request({
//           method: 'eth_requestAccounts',
//         })
//         return addressArray.length > 0 ? addressArray[0] : ""
//       } else {
//           try {
//             await window.ethereum.request({
//               method: 'wallet_switchEthereumChain',
//               params: [{ chainId: chainId }],
//             })
//             const addressArray = await window.ethereum.request({
//               method: 'eth_requestAccounts',
//             })
//             return addressArray.length > 0 ? addressArray[0] : ""
//           } catch (err) {
//             console.log("polygon not find:", err)
//             // Add Polygon chain to the metamask.
//             try {
//               await window.ethereum.request({
//                 method: 'wallet_addEthereumChain',
//                 params: [
//                   {   
//                     chainId: '0x89',
//                     chainName: 'Polygon Mainnet',
//                     rpcUrls: ['https://polygon-rpc.com'],
//                     nativeCurrency: {
//                         name: "Matic",
//                         symbol: "MATIC",
//                         decimals: 18
//                     },
//                     blockExplorerUrls: ['https://polygonscan.com/']                      },
//                 ]
//               });
//             await window.ethereum.request({
//               method: 'wallet_switchEthereumChain',
//               params: [{ chainId: chainId }],
//             })
//             const addressArray = await window.ethereum.request({
//               method: 'eth_requestAccounts',
//             })
//           return addressArray.length > 0 ? addressArray[0] : ""
//             } catch (error) {
//               console.log("Adding polygon chain failed", error);
//             }
//           }
//       }
//     } catch (err) {
//       return "";
//     }
//   } else {
//     return "";
//   }
// }

// ready to test
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

const getAvatarTraits = (avatar) => {
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

export async function mintAsset(avatar, screenshot, model, name, needCheckOT){
    if (!avatar)
        throw new Error("No avatar was provided")
    if (!screenshot)
        throw new Error("No screenshot was provided")
    if (!model)
        throw new Error("No model was provided")

    const walletAddress = await connectWallet();
    if (walletAddress == "")
      return ("Please Connect Wallet")

    const pass = !needCheckOT || await checkOT(walletAddress);
    if (pass){
        console.log("minting")
        // set image
        let imageName = "AvatarImage_" + Date.now() + ".png";
        let imageHash = await (async() => {
          for (let i = 0; i < 10; i++) { // hack: give it a few tries, sometimes uploading to pinata fail for some reason
            try {
              const img_hash = await saveFileToPinata(
                screenshot,
                imageName
              ).catch((reason) => {
                console.error(i, "---", reason)
              })
              return img_hash
            } catch(err) {
              console.warn(err);
              return err;
            }
          }
          return 'Failed to upload screenshot';
          //throw new Error('failed to upload screenshot');
        })()
        const glb = await getVRMBlobData(model,avatar,4096,true)
        let glbHash;
        if (glb) {
            let glbName = "AvatarGlb_" + Date.now() + ".glb";
            glbHash = await (async() => {
            for (let i = 0; i < 10; i++) { // hack: give it a few tries, sometimes uploading to pinata fail for some reason
                try {
                const glb_hash = await saveFileToPinata(
                    glb,
                    glbName
                ).catch((reason) => {
                    console.error(i, "---", reason)
                    return "Couldn't save glb to pinata"
                    //setMintStatus("Couldn't save glb to pinata")
                })
                return glb_hash
                } catch(err) {
                  console.warn(err);
                  return "Couldn't save glb to pinata"
                }
            }
            return 'Failed to upload glb'
            //throw new Error('failed to upload glb');
            })();
        } else {
          return 'Unable to get glb'
        }
        const metadata = {
            name: name || "Avatars",
            description: "Character Studio Avatars.",
            image: `ipfs://${imageHash.IpfsHash}`,
            animation_url: `ipfs://${glbHash.IpfsHash}`,
            attributes: getAvatarTraits(avatar)
        }
        const str = JSON.stringify(metadata)
        const metaDataHash = await saveFileToPinata(
            new Blob([str]),
            "AvatarMetadata_" + Date.now() + ".json",
        )
        const metadataIpfs = `ipfs://${metaDataHash.IpfsHash}`

        let price = await getTokenPrice()

        const signer = new ethers.providers.Web3Provider(
          window.ethereum,
        ).getSigner()
        const contract = new ethers.Contract(CharacterContract.address, CharacterContract.abi, signer)
        try {
          const options = {
            value: price,
            from: walletAddress
          }
          const tx = await contract.mintToken(1, metadataIpfs, options)
          let res = await tx.wait()
          if (res.transactionHash) {
            console.log("Mint success!")
            return "Mint success!";
          }
        } catch (err) {
          //console.log("Public Mint failed! Please check your wallet.")
          return "Public Mint failed."
        }

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
      if(parseInt(webaBalance) > 0) return true;
      else {
        console.log("Currently in alpha. You need a genesis pass to mint. \n Will be public soon!")
        return false;
      }
    } else {
      console.log("Please connect your wallet")
      return false;
    }
}

// const showTrait = (trait) => {
//     if (trait.name in avatar) {
//         if ("traitInfo" in avatar[trait.name]) {
//         return avatar[trait.name].name
//         } else return "Default " + trait.name
//     } else return "No set"
// }