import React, { useEffect, useState } from "react"
import styles from "./Create.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { useContext } from "react"

import { SceneContext } from "../context/SceneContext"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"

import { getAsArray } from "../library/utils"
import { WalletCollections } from "../library/walletCollections"

function Create() {
  
  // Translate hook
  const {t} = useContext(LanguageContext);

  const { setViewMode, setIsLoading, isLoading } = React.useContext(ViewContext)
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)
  const { manifest, characterManager } = React.useContext(SceneContext)
  const [ classes, setClasses ] = useState([]) 
  let [walletCollections, setWalletCollections] = useState(null)

  useEffect(()=>{
      if (walletCollections == null){
        setWalletCollections (new WalletCollections()); 	  
      }
    },[])
  useEffect(() => {

    if (manifest?.characters != null){

      const manifestClasses = getCharacterManifests(getAsArray(manifest.characters));
      const nonRepeatingCollections = [];
      const seenCollections = new Set();
      manifest.characters.forEach((c) => {
      if (c.collectionLock != null && !seenCollections.has(c.collectionLock)) {
          nonRepeatingCollections.push(c.collectionLock);
          seenCollections.add(c.collectionLock);
        }
      });
      setClasses(manifestClasses);

    }
  }, [manifest])

  const back = () => {
    setViewMode(ViewMode.LANDING)
    !isMute && playSound('backNextButton');
  }

  const getCharacterManifests = (charactersArray) =>{
      return charactersArray.map((c) => {
        let enabled = c.collectionLock == null ? false : true;
        return {
          name:c.name, 
          image:c.portrait, 
          description: c.description,
          manifest: c.manifest,
          icon:c.icon,
          format:c.format,
          disabled:enabled,
          collectionLock: getAsArray(c.collectionLock),
          manifestAppend: getCharacterManifests(getAsArray(c.manifestAppend)),
          fullTraits: c.fullTraits || false,
          chainName:c.chainName || "ethereum",
          dataSource:c.dataSource || "attributes"
        }
      })
  }


  const selectClass = async (index) => {
    setIsLoading(true)
    // Load manifest first
    let ownedTraits = null;
    const selectedClass = classes[index];
    if (selectedClass.collectionLock.length > 0){
      if (selectedClass.fullTraits == true){
        // user has at least one owned trait from that collection, unlock all
        if (!walletCollections.hasOwnership(selectedClass.collectionLock[0], selectedClass.chainName)){
          console.log("User has no owned traits of this colection");
          //launch warning screen
          return;
        }
      }
      else{
        // user gets to see only its owned assets
        ownedTraits = await walletCollections.getTraitsFromCollection(selectedClass.collectionLock[0], selectedClass.chainName, selectedClass.dataSource);
        if (!ownedTraits.ownTraits()){
          console.log("User has no owned traits of this colection");
          //launch warning screen
          return;
        }
      }
    }

    await characterManager.loadManifest(manifest.characters[index].manifest, ownedTraits);

    setViewMode(ViewMode.APPEARANCE)
    const addressTest = "0x2333FCc3833D2E951Ce8e821235Ed3B729141996";
    const promises = selectedClass.manifestAppend.map(manifestAppend => {
      return new Promise((resolve)=>{
        // check if it requires nft validation
        if (manifestAppend.collectionLock.length > 0){
          // check if the user owns at least one nft
          if (manifestAppend.fullTraits == true){
            walletCollections.hasOwnership(manifestAppend.collectionLock[0], manifestAppend.chainName,addressTest).then((owns)=>{
              if (owns){
                characterManager.loadAppendManifest(manifestAppend.manifest, false).then(()=>{
                  resolve();
                })
              }
              else{
                // resolve also when user does not owns nft traits from append collection
                resolve();
              }
            })
          }
          else{
            // get all owned nft ids from specified collection
            walletCollections.getTraitsFromCollection(manifestAppend.collectionLock[0], manifestAppend.chainName, manifestAppend.dataSource,addressTest)
            .then(ownedTraits=>{
              if (ownedTraits.ownTraits){
                characterManager.loadAppendManifest(manifestAppend.manifest, false,ownedTraits).then(()=>{
                  resolve();
                })
              }
              else{
                // resolve also when user does not owns nft traits from append collection
                resolve();
              }
            })
          }
        }
        else{
          characterManager.loadAppendManifest(manifestAppend.manifest, false).then(()=>{
            resolve();
          })
        }
      })
    });

    await Promise.all(promises);
    // When Manifest is Loaded, load initial traits from given manifest

    characterManager.loadInitialTraits().then(()=>{
      setIsLoading(false)
    })
    !isMute && playSound('classSelect');

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
                  ? () => selectClass(i)
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
              
              <div className={styles.name}>{characterClass["name"]}</div>
              <div className={styles.description}>
                {characterClass["description"]}
              </div>
            </div>
          )
        })}
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
