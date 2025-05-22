import React, { useEffect } from "react"
import styles from "./CollectionCreation.module.css"
import MenuTitle from "./MenuTitle"
import { SceneContext } from "../context/SceneContext";
import Slider from "./Slider";

// import 'react-dropdown/style.css';

export default function CollectionCreation(){

    const {  characterManager } = React.useContext(SceneContext)

    const [collectionExists, setCollectionExists] = React.useState(false)

    useEffect(() => {
        setCollectionExists(characterManager.manifestDataManager.mainManifestData._priceCollectionAddress != null)
    }, [])

    const createCollection = ()=>{
        characterManager.manifestDataManager.mainManifestData.createSolanaCollection();
        //characterManager.manifestDataManager.mainManifestData.createSolanaCollection("HLLFE1UNt2JsMF5DiszQmuuiW9M6ADpjgsJDJhBk4mWk");
    }
    const updatePrices = ()=>{
        // characterManager.manifestDataManager.mainManifestData.updateSolanaCollectionPrices();
        characterManager.manifestDataManager.mainManifestData.updateSolanaCollectionPricesAndToken();
    }

    return (

        <div>
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Collection" width={180} right={20}/>
                <div className={styles["scrollContainer"]}>
                    {(!collectionExists && 
                    <>
                        <div className={styles["traitInfoTitle"]}>
                            Create Collection
                        </div>
                        <br />
                        <div className={styles["traitInfoText"]}>
                            Create a new solana collection with current prices defined in manifest. Once created, a new manifest with a Solana address owned by the user will be created and downloaded. Use this manifest to start selling directly on chain.
                        </div>
                        <br />
                         <div 
                            className={styles["actionButton"]}
                            onClick={createCollection}>
                            <div> Create New </div>
                        </div>
                    </>
                    )}
                    {(collectionExists && 
                    <>
                        <div className={styles["traitInfoTitle"]}>
                            Modify Collection
                        </div>
                        <br />
                        <div className={styles["traitInfoText"]}>
                            If prices or price collection pay token was updated on your manifest, use this button to update on chain.
                        </div>
                        <br />
                        <div 
                            className={styles["actionButton"]}
                            onClick={updatePrices}>
                            <div> Update Prices and Token </div>
                        </div>
                    </>)}
                </div>
            </div>
        </div>
    )
}