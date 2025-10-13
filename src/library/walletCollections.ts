import { fetchOwnedNFTs, ownsCollection, fetchSolanaPurchasedAssets } from "./mint-utils";
import { getAsArray } from "./utils";
import { OwnedNFTTraitIDs } from "./ownedNFTTraitIDs";
import { connectWallet } from "./mint-utils";

export type SolanaPurchaseAssetsDefinitionType = {
      merkleTreeAddress:string,
      depositAddress:string,
      delegateAddress:string,
      collectionName:string
  }

/**
 * Handles wallet operations and NFT collection interactions.
 */
export class WalletCollections {
    /**
     * Creates an instance of the WalletCollections class.
     */
    constructor() {}

    /**
     * Checks if a wallet purchased assets from specific collection
     * 
     */
    getSolanaPurchasedAssets(solanaPurchaseAssetsDefinition:SolanaPurchaseAssetsDefinitionType, testWallet?:string){

        const {
            delegateAddress,
            collectionName
        } = solanaPurchaseAssetsDefinition;
        
        const walletPromise = testWallet
            ? Promise.resolve(testWallet)
            : connectWallet("solana");

        return new Promise((resolve)=>{
            walletPromise
                .then(wallet => fetchSolanaPurchasedAssets(wallet, delegateAddress, collectionName).then((response)=>{
                    //@ts-ignore TODO: FIX TYPES
                    resolve(new OwnedNFTTraitIDs({ownedIDs:response?.ownedIDs||[],ownedTraits:response.ownedTraits},null));
                }))
                .catch(err=>{
                    resolve(null);
                })
        });
        
    }

    /**
     * Checks if a wallet owns a specific NFT collection.
     * 
     */
    async checkForOwnership(collectionName:string, chainName:"ethereum"|"solana"|"polygon", testWallet?:string): Promise<boolean> {
        const walletPromise = testWallet
            ? Promise.resolve(testWallet)
            : connectWallet(chainName);

        const wallet = await walletPromise

        return await ownsCollection(wallet, chainName, collectionName)
    }

    /**
     * Retrieves NFTs from a specific collection owned by a wallet.
     * 
     * @param {string} collectionName - The name of the NFT collection.
     * @param {string} chainName - The blockchain name (`"ethereum"`, `"polygon"` or `"solana"`).
     * @param {string|null} testWallet - The wallet address to use, or `null` to use the active wallet.
     * @returns {Promise<Array<Object>>} A promise resolving to an array of NFT objects.
     */
    async getNftsFromCollection(collectionName:string, chainName:"ethereum"|"polygon"|"solana", testWallet?:string) {
        const walletPromise = testWallet
            ? Promise.resolve(testWallet)
            : connectWallet(chainName);
        const wallet = await walletPromise
        const collection = await fetchOwnedNFTs(wallet, chainName, collectionName) as {nfts: Object[]};
        
        return getAsArray(collection?.nfts)
            
    }

    /**
     * Retrieves metadata for NFTs in a specific collection.
     * 
     * @param {string} collectionName - The name of the NFT collection.
     * @param {string} chainName - The blockchain name (`"ethereum"` or `"polygon"`).
     * @param {string|null} testWallet - The wallet address to use, or `null` to use the active wallet.
     * @returns {Promise<Array<Object>>} A promise resolving to an array of metadata objects.
     */
    getMetaFromCollection(collectionName:string, chainName:"ethereum"|"polygon"|"solana"="solana", testWallet?:string): Promise<Array<Object>> {
        return this.getNftsFromCollection(collectionName, chainName, testWallet)
            .then(ownedNfts => {
                console.log(ownedNfts);
                const getNftsMeta = (nfts:any[]) => {
                    const nftsMeta: any[] = [];
                    const promises = nfts.map(nft =>
                        new Promise<void>(resolve => {
                            console.log(nft);
                            fetch(nft.metadata_url)
                                .then(response => response.json())
                                .then(metadata => {
                                    nftsMeta.push(metadata);
                                    resolve();
                                })
                                .catch(err => {
                                    console.warn("Error processing metadata:", nft.metadata_url);
                                    console.error(err);
                                    resolve();
                                });
                        })
                    );

                    return Promise.all(promises).then(() => nftsMeta);
                };

                return getNftsMeta(ownedNfts);
            });
    }
    

    /**
     * Retrieves traits or IDs from NFTs in a specific collection.
     * 
     * @param {string} collectionName - The name of the NFT collection.
     * @param {string} chainName - The blockchain name (`"ethereum"` or `"polygon"`).
     * @param {string} dataSource - The source of the data (`"attributes"` or `"image"`).
     * @param {string|null} testWallet - The wallet address to use, or `null` to use the active wallet.
     * @returns {Promise<OwnedTraitIDs>} A promise resolving to an OwnedNFTTraitIDs object.
     */
    getTraitsFromCollection(collectionName:string, chainName:"ethereum"|"polygon"|"solana" = "solana", dataSource:string, testWallet?:string): Promise<OwnedNFTTraitIDs> {
        if (collectionName == null || chainName == null || dataSource == null){
            console.error("Missing parameter: collectionName, chainName or dataSource to fetch nft collection, skipping nft validation")
            return Promise.resolve({} as OwnedNFTTraitIDs);
        }

        if (dataSource == "name"){
            return this.getNftsFromCollection(collectionName, chainName, testWallet)
                .then(nfts=> {return new OwnedNFTTraitIDs(nfts, dataSource)});
        }
        else{
            return this.getMetaFromCollection(collectionName, chainName, testWallet)
                .then(nftMeta => new OwnedNFTTraitIDs(nftMeta, dataSource));
        }

    }
}
