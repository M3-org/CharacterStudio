import { fetchOwnedNFTs, ownsCollection } from "./mint-utils";
import { getAsArray } from "./utils";
import { OwnedNFTTraitIDs } from "./ownedNFTTraitIDs";
import { connectWallet } from "./mint-utils";

/**
 * Handles wallet operations and NFT collection interactions.
 */
export class WalletCollections {
    /**
     * Creates an instance of the WalletCollections class.
     */
    constructor() {}

    /**
     * Checks if a wallet owns a specific NFT collection.
     * 
     * @param {string} collectionName - The name of the NFT collection.
     * @param {string} chainName - The blockchain name (`"ethereum"`, `"polygon"` or `"solana"`).
     * @param {string|null} testWallet - The wallet address to use, or `null` to use the active wallet.
     * @returns {Promise<boolean>} A promise resolving to `true` if the wallet owns the collection, otherwise `false`.
     */
    checkForOwnership(collectionName, chainName, testWallet) {
        const walletPromise = testWallet
            ? Promise.resolve(testWallet)
            : connectWallet(chainName);

        return walletPromise.then(wallet => ownsCollection(wallet, network, collectionName));
    }

    /**
     * Retrieves NFTs from a specific collection owned by a wallet.
     * 
     * @param {string} collectionName - The name of the NFT collection.
     * @param {string} chainName - The blockchain name (`"ethereum"`, `"polygon"` or `"solana"`).
     * @param {string|null} testWallet - The wallet address to use, or `null` to use the active wallet.
     * @returns {Promise<Array<Object>>} A promise resolving to an array of NFT objects.
     */
    getNftsFromCollection(collectionName, chainName, testWallet) {
        const walletPromise = testWallet
            ? Promise.resolve(testWallet)
            : connectWallet(chainName);

        return walletPromise
            .then(wallet => fetchOwnedNFTs(wallet, chainName, collectionName))
            .then(collection => getAsArray(collection?.nfts));
    }

    /**
     * Retrieves metadata for NFTs in a specific collection.
     * 
     * @param {string} collectionName - The name of the NFT collection.
     * @param {string} chainName - The blockchain name (`"ethereum"` or `"polygon"`).
     * @param {string|null} testWallet - The wallet address to use, or `null` to use the active wallet.
     * @returns {Promise<Array<Object>>} A promise resolving to an array of metadata objects.
     */
    getMetaFromCollection(collectionName, chainName, testWallet) {
        return this.getNftsFromCollection(collectionName, chainName, testWallet)
            .then(ownedNfts => {
                console.log(ownedNfts);
                const getNftsMeta = nfts => {
                    const nftsMeta = [];
                    const promises = nfts.map(nft =>
                        new Promise(resolve => {
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
                                    resolve(); // Resolve even on failure to avoid halting
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
    getTraitsFromCollection(collectionName, chainName, dataSource, testWallet) {
        return this.getMetaFromCollection(collectionName, chainName, testWallet)
            .then(nftMeta => new OwnedNFTTraitIDs(nftMeta, dataSource));
    }
}
