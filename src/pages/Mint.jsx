import React from "react"
import styles from "./Mint.module.scss"
import { ViewMode, ViewContext } from "../context/ViewContext"

import { SceneContext } from "../context/SceneContext"
import * as THREE from 'three'

import CustomButton from "../components/custom-button"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"
import { mintAsset } from "../library/mint-utils"

const localVector = new THREE.Vector3();

function MintComponent({screenshotManager, blinkManager, animationManager}) {
  const { templateInfo, model, avatar } = React.useContext(SceneContext)
  const { setViewMode } = React.useContext(ViewContext)
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)

  const back = () => {
    setViewMode(ViewMode.SAVE)
    !isMute && playSound('backNextButton');
  }

  const next = () => {
    setViewMode(ViewMode.CHAT)
    !isMute && playSound('backNextButton');
  }

  function MenuTitle() {
    return (
      <div className={styles["mainTitleWrap"]}>
        <div className={styles["topLine"]} />
        <div className={styles["mainTitle"]}>Mint</div>
      </div>
    )
  }

  async function Mint(){
    const screenshot = takeScreenshot();
    console.log(screenshot)
    console.log(mintAsset)
    const result = await mintAsset(getAvatarTraits(),screenshot,model)
    console.log(result);
  }

  // 
  const getAvatarTraits = () => {
    let metadataTraits = []
    Object.keys(avatar).map((trait) => {
      if (Object.keys(avatar[trait]).length !== 0) {
        metadataTraits.push({
          trait_type: trait,
          value: avatar[trait].name,
        })
      }
    })
    return metadataTraits
  }

  function takeScreenshot(){
    animationManager.enableScreenshot();
    blinkManager.enableScreenshot();

    model.traverse(o => {
      if (o.isSkinnedMesh) {
        const headBone = o.skeleton.bones.filter(bone => bone.name === 'head')[0];
        headBone.getWorldPosition(localVector);
      }
    });
    const headPosition = localVector;

    // change it to work from manifest
    const female = templateInfo.name === "Drophunter";
    const cameraFov = female ? 0.78 : 0.85;
    screenshotManager.setCamera(headPosition, cameraFov);
    let imageName = "AvatarImage_" + Date.now() + ".png";
    
    const screenshot = screenshotManager.saveAsImage(imageName);
    blinkManager.disableScreenshot();
    animationManager.disableScreenshot();
    return screenshot;
  }

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>Mint Your Character</div>
          
        {/* <Mint screenshotManager = {screenshotManager} blinkManager = {blinkManager} animationManager = {animationManager}/> */}
      
        {/* <ResizableDiv setScreenshotPosition = {setScreenshotPosition} screenshotPosition = {screenshotPosition}/> */}

      <div className={styles.mintContainer}>
        <MenuTitle />

        <div className={styles.mintButtonContainer}>
          <CustomButton
            size={16}
            theme="light"
            icon="polygon"
            text="Open Edition"
            className={styles.mintButton}
            onClick= {Mint}
          />

          <div className={styles.divider}></div>

          <CustomButton
            size={16}
            theme="light"
            icon="tokens"
            text="Genesis Edition"
            className={styles.mintButton}
            onClick= {Mint}
          />

          <span className={styles.genesisText}>(<span className={styles.required}>Genesis pass holders only</span>)</span>
        </div>
      </div>

      <div className={styles.bottomContainer}>
        <CustomButton
          theme="light"
          text="Back"
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
        <CustomButton
          theme="light"
          text="Chat"
          size={14}
          className={styles.buttonRight}
          onClick={next}
        />
      </div>
    </div>
  )
}

export default MintComponent
