import React, { useContext } from "react"
import styles from "./FloatingMenu.module.css"
import MenuTitle from "./MenuTitle"
import { SceneContext } from "../context/SceneContext";

import { Buffer } from "buffer";
import { Connection, Transaction, PublicKey } from "@solana/web3.js";
import { base58 } from '@metaplex-foundation/umi-serializers';
import { createWeb3JsTransactionFactory } from "@metaplex-foundation/umi-transaction-factory-web3js";
//import { getUserCNFTs } from "./sola"

export default function WalletMenu({lockedManifests}){
    const {
        characterManager,
    } = useContext(SceneContext);

    const unlockManifest = (index) => {
        const addressTest = "0x2333FCc3833D2E951Ce8e821235Ed3B729141996";
        characterManager.unlockManifestByIndex(index, index === 1 ? addressTest : null)
    };

    return (
        
        <div>
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Unlock With Wallet" width={180} right={20}/>
                <div className={styles["scrollContainer"]}>
                    {lockedManifests && lockedManifests.length > 0 &&  lockedManifests.map((manifest, index) => {
                        return (
                            <div 
                                key={index}
                                className={styles["actionButton"]}
                                onClick={() => {
                                    unlockManifest(index)
                                }}>
                                <div>  {manifest.collectionLockID} </div>
                            </div>
                        )
                    })}
                    
                    </div>

            </div>
        </div>
      )
}