import { connectWallet, currentWallet, getOpenseaCollection, ownsCollection } from "./mint-utils";
import { local } from "./store";
import { getAsArray } from "./utils";
import { OwnedTraitIDs } from "./ownedTraitIDs";

const chain = {
    ethereum:"0x1",
    polygon:"0x89",
}

export class WalletCollections{
    
    constructor(){

    }

    checkForOwnership(collectionName, chainName, testWallet) {
      const walletPromise = testWallet 
        ? Promise.resolve(testWallet) 
        : this.switchWallet(chainName);
    
      return walletPromise.then(wallet => ownsCollection(wallet, collectionName));
    }

    getNftsFromCollection(collectionName, chainName, testWallet) {
      const walletPromise = testWallet 
        ? Promise.resolve(testWallet) 
        : this.switchWallet(chainName);
    
      return walletPromise
        .then(wallet => getOpenseaCollection(wallet, collectionName))
        .then(collection => getAsArray(collection?.nfts));
    }

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

    getTraitsFromCollection(collectionName, chainName, dataSource, testWallet) {
      return this.getMetaFromCollection(collectionName, chainName, testWallet)
        .then(nftMeta => new OwnedTraitIDs(nftMeta, dataSource));
    }

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
