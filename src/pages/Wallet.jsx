import React, { useEffect, useState } from "react"
import styles from "./Create.module.css"
import { ViewMode, ViewContext } from "../context/ViewContext"
import CustomButton from "../components/custom-button"
import { LanguageContext } from "../context/LanguageContext"
import { useContext } from "react"

import { SceneContext } from "../context/SceneContext"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"

import { connectWallet } from "../library/mint-utils"
import { getOpenseaCollection } from "../library/mint-utils"

function Wallet() {
  
  // Translate hook
  const {t} = useContext(LanguageContext);

  const { setViewMode, setIsLoading, isLoading } = React.useContext(ViewContext)
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)
  const { manifest, characterManager } = React.useContext(SceneContext)
  const [ classes, setClasses ] = useState([]) 
  const [ walltNFTs, setWalletNFTs ] = useState([]);
  
  useEffect(() => {
    fetchWalletNFTS();
  }, [])

  const fetchWalletNFTS = async()=>{
    const address = await connectWallet()
    getOpenseaCollection(address,'the-anata-nft').then((result)=>{
      setWalletNFTs(result.nfts);
      console.log(result.nfts);
    })  
  }

  const back = () => {
    setViewMode(ViewMode.LANDING)
    !isMute && playSound('backNextButton');
  }

  const selectClass = async (index) => {
    setIsLoading(true)
    // Load manifest first
    characterManager.loadManifest(manifest[index].manifest).then(()=>{
      setViewMode(ViewMode.APPEARANCE)
      // When Manifest is Loaded, load initial traits from given manifest
      characterManager.loadInitialTraits().then(()=>{
        setIsLoading(false)
      })
    })
    !isMute && playSound('classSelect');
  }

  const appendManifest = () =>{
    console.log("ttt")
    characterManager.loadManifest(manifest[0].manifest).then(()=>{
      // setViewMode(ViewMode.APPEARANCE)
      
      characterManager.loadAppendManifest(manifest[1].manifest, true).then(()=>{
        console.log(characterManager.manifestData)
      })
      // When Manifest is Loaded, load initial traits from given manifest
      // characterManager.loadInitialTraits().then(()=>{
      //   setIsLoading(false)
      // })
    })
    //console.log(characterManager.appendManifest);

  }

  const hoverClass = () => {
    !isMute && playSound('classMouseOver');
  }
  
  return (
    <div className={`${styles.container} horizontalScroll`}>
      <div className={"sectionTitle"}>{t('pageTitles.chooseClass')}</div>
      <div className={styles.vrmOptimizerButton}>
      </div>
      <div className={styles.topLine} />
      
      <div className={styles.classContainer}>
        {walltNFTs.map((characterClass, i) => {
          return (
            <div
              key={i}
              className={styles.class}
              onClick={() => selectClass(i)}
              onMouseOver={() => hoverClass()}
            >
            <div
                className={styles.classFrame}
                style={{
                  "backgroundImage": `url(${characterClass["image_url"]})`,
                }}
              >
                <div className={styles.frameContainer}>
                  <img
                    src={"./assets/backgrounds/class-frame.svg"}
                    className={styles.frame}
                  />
                </div>

              </div>

              
              <div className={styles.name}>{characterClass["name"]}</div>
            </div>
          )
        })}
      </div>

      <div className={styles.bottomLine} />
      <div className={styles.buttonContainer}>
      <CustomButton
          theme="light"
          text={t('callToAction.back')}
          size={14}
          className={styles.buttonLeft}
          onClick={back}
      />
      <CustomButton
          theme="light"
          text={"test"}
          size={14}
          className={styles.buttonLeft}
          onClick={appendManifest}
      />
      </div>
    </div>
  )
}

export default Wallet
