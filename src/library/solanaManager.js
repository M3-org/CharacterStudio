// import { createUmi } from '@metaplex-foundation/umi';
// import { createCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
const rpcKey = import.meta.env.VITE_HELIUS_KEY;
const rpcUrl = `https://devnet.helius-rpc.com/?api-key=${rpcKey}`
//import { } from '@metaplex-foundation/umi-bundle-defaults';
// import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
// import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
// import { createCandyMachine } from '@metaplex-foundation/mpl-candy-machine';

export class SolanaManager {
    constructor() {
        //console.log(rpcUrl);
        // ✅ Use the default RPC setup from UMI
        //this.umi = createUmi('https://api.mainnet-beta.solana.com'); 
        //this.umi = createUmi('https://api.devnet.solana.com');
        

    }
    async getUserCNFTs(ownerAddress, delegateAddress, collectionName) {
        const url = rpcUrl; 
        const requestBody = {
            jsonrpc: "2.0",
            method: "searchAssets",
            id:"search-character",
            params: {
              ownerAddress: ownerAddress,
              delegate:delegateAddress,
              limit: 50,
              tokenType:"compressedNft"
            },
            options:{
                showCollectionMetadata:true
            }
        }
    
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        })
    
        const data = await response.json();
        if (!data.result || !data.result.items) return null;
    

        const items = collectionName != null ? 
            data.result.items.filter(asset => asset.content.metadata.name === collectionName):
            data.result.items;

        if (items.length == 0){
            return null;
        }
        if (items.length > 1) console.warn("more than one cnft with collection name: " + collectionName + " was found, taking latest mint");

        const item = items[items.length - 1];
        const metadataResponse = await fetch(item.content.json_uri);
        if (!metadataResponse.ok) {
            throw new Error(`HTTP error! Status: ${metadataResponse.status}`);
        }
        else{
            const result = await metadataResponse.json();
            return result;
        }
    }

    // async getUserNFTs(walletAddress) {
    //     if (!walletAddress) throw new Error('Wallet address required');

    //     try {
    //         // ✅ Use umi.rpc.getAssetsByOwner without extra imports
    //         const nfts = await this.umi.rpc.getAssetsByOwner(walletAddress);
    //         return nfts;
    //     } catch (error) {
    //         console.error('Error fetching NFTs:', error);
    //         return [];
    //     }
    // }

    // async createCandyMachine() {
    //     try {
    //         const candyMachine = await createCandyMachine(this.umi, {
    //             price: 1.0, // Price in SOL
    //             sellerFeeBasisPoints: 500, // 5% fee
    //         });

    //         console.log('Candy Machine created:', candyMachine);
    //         return candyMachine;
    //     } catch (error) {
    //         console.error('Error creating candy machine:', error);
    //     }
    // }
}
