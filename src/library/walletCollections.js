import { getOpenseaCollection, ownsCollection } from "./mint-utils";
import { getAsArray } from "./utils";
import { OwnedNFTTraitIDs } from "./ownedNFTTraitIDs";

const chain = {
    ethereum: "0x1",
    polygon: "0x89",
};

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
     * @param {string} chainName - The blockchain name (`"ethereum"` or `"polygon"`).
     * @param {string|null} testWallet - The wallet address to use, or `null` to use the active wallet.
     * @returns {Promise<boolean>} A promise resolving to `true` if the wallet owns the collection, otherwise `false`.
     */
    checkForOwnership(collectionName, chainName, testWallet) {
        const walletPromise = testWallet
            ? Promise.resolve(testWallet)
            : this.switchWallet(chainName);

        return walletPromise.then(wallet => ownsCollection(wallet, collectionName));
    }

    /**
     * Retrieves NFTs from a specific collection owned by a wallet.
     * 
     * @param {string} collectionName - The name of the NFT collection.
     * @param {string} chainName - The blockchain name (`"ethereum"` or `"polygon"`).
     * @param {string|null} testWallet - The wallet address to use, or `null` to use the active wallet.
     * @returns {Promise<Array<Object>>} A promise resolving to an array of NFT objects.
     */
    getNftsFromCollection(collectionName, chainName, testWallet) {
        const walletPromise = testWallet
            ? Promise.resolve(testWallet)
            : this.switchWallet(chainName);

        return walletPromise
            .then(wallet => getOpenseaCollection(wallet, collectionName))
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
                const getNftsMeta = nfts => {
                    const nftsMeta = [];
                    const promises = nfts.map(nft =>
                        new Promise(resolve => {
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

    /**
     * Switches the active wallet to a specific blockchain and retrieves the wallet address.
     * 
     * @param {string} chainName - The blockchain name (`"ethereum"` or `"polygon"`).
     * @returns {Promise<string>} A promise resolving to the active wallet address, or an empty string on error.
     */
    switchWallet(chainName) {
        return new Promise((resolve, reject) => {
            window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chain[chainName] }],
            })
                .then(() => window.ethereum.request({ method: 'eth_requestAccounts' }))
                .then(addressArray => resolve(addressArray.length > 0 ? addressArray[0] : ""))
                .catch(err => {
                    console.log(`${chainName} polygon not found:`, err);
                    resolve(""); // Fallback to an empty wallet on error
                });
        });
    }
}
