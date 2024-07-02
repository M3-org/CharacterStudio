import React, { useEffect, useState } from "react"
import styles from "./Create.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { useContext } from "react"

import { SceneContext } from "../context/SceneContext"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"

import { local } from "../library/store"

import { connectWallet, getOpenseaCollection, ownsCollection, currentWallet } from "../library/mint-utils"

import { getAsArray } from "../library/utils"

function Create() {
  
  // Translate hook
  const {t} = useContext(LanguageContext);

  const { setViewMode, setIsLoading, isLoading } = React.useContext(ViewContext)
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)
  const { manifest, characterManager } = React.useContext(SceneContext)
  const [ classes, setClasses ] = useState([]) 
  const [ collections, setCollections ] = useState([]) 
  const [ currentAddress, setCurrentAddress] = useState("");
  const [ ownedCollections, setOwnedCollections] = useState(null);
  const [ enabledRefresh, setEnabledRefresh] = useState(true);
  
  let loaded = false
  let [isLoaded, setIsLoaded] = useState(false)
  let [requireWalletConnect, setRequireWalletConnect] = useState(false)

  useEffect(()=>{
    if (requireWalletConnect == true){
      if (loaded || isLoaded) return
      setIsLoaded(true)
      loaded = true;
      if (currentAddress == ""){
        const getWallet = async ()=>{
          const wallet = await currentWallet();
          setCurrentAddress(wallet);
          if (wallet != ""){
            await fetchWalletNFTS();
          }
        }
        getWallet();
      }
    }
  },[requireWalletConnect])
  useEffect(() => {
    if (manifest?.characters != null){
      let requiresConnect = false;
      const manifestClasses = manifest.characters.map((c) => {
        let enabled = c.collectionLock == null ? false : true;
        if (c.collectionLock != null)
          requiresConnect = true;
        console.log(c.collectionLock)
        return {
          name:c.name, 
          image:c.portrait, 
          description: c.description,
          manifest: c.manifest,
          icon:c.icon,
          format:c.format,
          disabled:enabled,
          collection: getAsArray(c.collectionLock),
          fullTraits: c.fullTraits || false
        }
      })
      
      const nonRepeatingCollections = [];
      const seenCollections = new Set();
      manifest.characters.forEach((c) => {
      if (c.collectionLock != null && !seenCollections.has(c.collectionLock)) {
          nonRepeatingCollections.push(c.collectionLock);
          seenCollections.add(c.collectionLock);
        }
      });
      setCollections(nonRepeatingCollections);
      setClasses(manifestClasses);
      setRequireWalletConnect(requiresConnect);

    }
  }, [manifest])

  const back = () => {
    setViewMode(ViewMode.LANDING)
    !isMute && playSound('backNextButton');
  }

  const selectClass = async (index) => {
    setIsLoading(true)
    console.log(classes[index]);
    // Load manifest first
    let unlockedTraits = null;
    if (classes[index].collection.length > 0 && classes[index].fullTraits == false){
      console.log("got 1")
      const address = await connectWallet();
      const result = await getOpenseaCollection(address,classes[index].collection[0])
      const nfts = getAsArray(result?.nfts);
      console.log("nfts", result?.nfts);
      const nftsMeta = [];

      const promises = nfts.map(nft => 
        new Promise((resolve)=>{
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
      );

      await Promise.all(promises);

      unlockedTraits = {};
      const getTraitsFromNFTsArray = (arr) =>{
        const nftArr = getAsArray(arr);
        nftArr.forEach(nft => {
          nft.attributes.forEach(attr => {
            if (unlockedTraits[attr.trait_type] == null)
              unlockedTraits[attr.trait_type] = []
            if (!unlockedTraits[attr.trait_type].includes(attr.value))
              unlockedTraits[attr.trait_type].push(attr.value);
          });
          
        });
      }
      getTraitsFromNFTsArray(nftsMeta);

      console.log(unlockedTraits)
      // unlockedTraits
    }
    characterManager.loadManifest(manifest.characters[index].manifest, unlockedTraits).then(()=>{
      setViewMode(ViewMode.APPEARANCE)
      // When Manifest is Loaded, load initial traits from given manifest
      characterManager.loadInitialTraits().then(()=>{
        setIsLoading(false)
      })
    })
    !isMute && playSound('classSelect');

  }
  useEffect(()=>{
    if (ownedCollections != null){      

      const editedClasses = classes.map((c) => {
        let locked =  c.collection.length > 0 ? true : false;
        for (let i =0; i < c.collection.length;i++){
          const collection = c.collection[i];
          if (ownedCollections[collection] == true ){
            locked = false;
            break;
          }
        }
        return {
          name:c.name, 
          image:c.image, 
          description: c.description,
          manifest: c.manifest,
          icon:c.icon,
          format:c.format,
          disabled:locked,
          collection: c.collection,
          fullTraits: c.fullTraits
        }});
      
      console.log(editedClasses)
      setClasses(editedClasses);
    }
  }, [ownedCollections])

  const fetchWalletNFTS = async(getLocal = true)=>{
    const address = await connectWallet()
    if (address != ""){
      //console.log(local[address + "collections"]);
      if (getLocal && local[address + "collections"] != null){
        setOwnedCollections(local[address + "collections"]); 
      }
      else{
        // get it from opensea
        console.log("from opensea")
        setEnabledRefresh(false)
        const owned = {};
        const promises = collections.map(collection => 
          ownsCollection(address, collection).then(result => {
            owned[collection] = result;
          })
        );

        await Promise.all(promises);

        local[address + "collections"] = owned;

        setOwnedCollections(owned);

        setTimeout(() => {
          setEnabledRefresh(true);
        }, 5000);
      }
      
      
      // getAllCollections(address).then((result)=>{
      //   // setWalletNFTs(result.nfts);
      //   console.log(result);
      // })  
      // getOpenseaCollection(address,'the-anata-nft').then((result)=>{
      //   // setWalletNFTs(result.nfts);
      //   console.log(result.nfts);
      // })  
    }
  }

  const hoverSound = () => {
    !isMute && playSound('classMouseOver');
  }
  
  return (
    <div className={`${styles.container} horizontalScroll`}>
      <div className={"sectionTitle"}>{t('pageTitles.chooseClass')}</div>
      <div className={styles.vrmOptimizerButton}>
      </div>

      
      <div className={styles.topLine} />
      
      <div className={styles.classContainer}>
        {classes.map((characterClass, i) => {
          return (
            <div
              key={i}
              className={
                !characterClass["disabled"]
                  ? styles.class
                  : styles.classdisabled
              }
              onClick={
                characterClass["disabled"]
                  ? () => fetchWalletNFTS()
                  : () => selectClass(i)
              }
              onMouseOver={
                characterClass["disabled"]
                  ? () => hoverSound()
                  : () => hoverSound()
              }
            >
            <div
                className={styles.classFrame}
                style={{
                  "backgroundImage": `url(${characterClass["image"]})`,
                }}
              >
                <div className={styles.frameContainer}>
                  <img
                    src={"./assets/backgrounds/class-frame.svg"}
                    className={styles.frame}
                  />
                </div>

                <div className={styles.lockedContainer}>
                  {characterClass["disabled"] && (
                    <img
                      src={"./assets/icons/locked.svg"}
                      className={styles.locked}
                    />
                  )}
                </div>
              </div>
              <div className={styles.icon}>
                <img
                  src={characterClass["icon"]}
                  alt={characterClass["name"]}
                />
              </div>
              
              <div className={styles.name}>{characterClass["name"]}</div>
              <div className={styles.description}>
                {characterClass["description"]}
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.refreshContainer}>
        <div className={
          enabledRefresh ? 
            styles.refreshButton :
            styles.refreshDisabled
        }
          onClick={
            enabledRefresh ?
              () => fetchWalletNFTS(false):
              ()=>{}
          }
          onMouseOver={
            () => hoverSound()
          }/>
      </div>

      <div className={styles.bottomLine} />
      <div className={styles.buttonContainer}>
        { <CustomButton
          theme="light"
          text={t('callToAction.back')}
          size={14}
          className={styles.buttonLeft}
          onClick={back}
      />}
      </div>
    </div>
  )
}

export default Create
