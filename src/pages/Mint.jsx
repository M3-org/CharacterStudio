import React from "react"
import styles from "./Mint.module.scss"
import { ViewMode, ViewContext } from "../context/ViewContext"
import { SceneContext } from "../context/SceneContext"
import CustomButton from "../components/custom-button"
import { SoundContext } from "../context/SoundContext"
import { AudioContext } from "../context/AudioContext"
import { mintAsset } from "../library/mint-utils"

function MintComponent() {
  const { model, avatar } = React.useContext(SceneContext)
  const { setViewMode } = React.useContext(ViewContext)
  const { playSound } = React.useContext(SoundContext)
  const { isMute } = React.useContext(AudioContext)

  const [status, setStatus] = React.useState("")
  const [minting, setMinting]= React.useState(false)

  const back = () => {
    setViewMode(ViewMode.SAVE)
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
    !isMute && playSound('backNextButton');
    setMinting(true)
    setStatus("Please check your wallet")
    //const fullBioStr = localStorage.getItem(`${templateInfo.id}_fulBio`)
    const fullBio = {name:"XXXRestore"};//JSON.parse(fullBioStr)
    const screenshot = null;// getFaceScreenshot(256,256,true);
    const result = await mintAsset(avatar,screenshot,model, fullBio.name)
    setStatus(result)
    setMinting(false)
    console.log(result);
  }

  return (
    <div className={styles.container}>
      <div className={"sectionTitle"}>Mint Your Character</div>
      <div className={styles.mintContainer}>
        <MenuTitle />
        <div className={styles.mintButtonContainer}>
          <CustomButton
            size={16}
            theme="light"
            icon="polygon"
            text={minting ? "Minting...":"Open Edition"}
            className={styles.mintButton}
            disabled = {minting}
            onClick= {Mint}
            minWidth = {220}
          />

          <div className={styles.divider}></div>

          <CustomButton
            size={16}
            theme="light"
            icon="tokens"
            text="Genesis Edition"
            className={styles.mintButton}
            disabled = {true}
            minWidth = {220}
            // onClick= {Mint}
          />
          {/* Genesis pass holders only */}
          <span className={styles.genesisText}>(<span className={styles.required}>Coming Soon!</span>)</span>
          
        </div>
        <span className={styles.mintInfo}>{status} </span>
        
      </div>

      <div className={styles.bottomContainer}>
        <CustomButton
          theme="light"
          text="Back"
          size={14}
          className={styles.buttonLeft}
          onClick={back}
        />
      </div>
    </div>
  )
}

export default MintComponent
