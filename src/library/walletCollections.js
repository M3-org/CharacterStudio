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

    async hasOwnership(collectionName, chainName,testWallet){
        const wallet = testWallet == null ? await (this.switchWallet(chainName)) : testWallet;
        console.log(wallet);
        return await ownsCollection(wallet, collectionName);
    }

    async getNftsFromCollection(collectionName, chainName,testWallet){
        const wallet = testWallet == null ? await (this.switchWallet(chainName)): testWallet;
        const collection = await getOpenseaCollection(wallet, collectionName);
        return getAsArray(collection?.nfts);
    }

    async getMetaFromCollection(collectionName, chainName, testWallet){

        const ownedNfts = await this.getNftsFromCollection(collectionName, chainName, testWallet);
        
        const getNftsMeta = async(nfts) =>{
            const nftsMeta = [];
            const promises = nfts.map(nft => {
                return new Promise((resolve)=>{
                fetch(nft.metadata_url)
                .then(response=>{
                  response.json()
                  .then(metadata=>{
                    nftsMeta.push(metadata);
                    resolve ();
                  })
                  .catch(err=>{
                    console.warn("error converting to json");
                    console.error(err);
                    resolve ()
                  })
                })
                .catch(err=>{
                  // resolve even if it fails, to avoid complete freeze
                  console.warn("error getting " + nft.metadata_url + ", skpping")
                  console.error(err);
                  resolve ()
                })
                })
                
              }
            );
        
            await Promise.all(promises);
            return nftsMeta;
          }
        return await getNftsMeta(ownedNfts);
    }

    async getTraitsFromCollection(collectionName, chainName, dataSource, testWallet){
        const nftMeta = await this.getMetaFromCollection(collectionName, chainName, testWallet);
        return new OwnedTraitIDs(nftMeta, dataSource);    
    }

    async switchWallet(chainName){
        try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: chain[chainName] }],
            })
            const addressArray = await window.ethereum.request({
              method: 'eth_requestAccounts',
            })
            return addressArray.length > 0 ? addressArray[0] : ""
          } catch (err) {
            console.log(`${chainName} polygon not find:`, err)
        }
    }
}
