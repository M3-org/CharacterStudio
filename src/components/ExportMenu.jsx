import React, { useContext } from "react"
import { SceneContext } from "../context/SceneContext"
import CustomButton from "./custom-button"

import { downloadGLB, downloadVRMWithAvatar } from "../library/download-utils"
import { getAtlasSize } from "../library/utils"

import styles from "./ExportMenu.module.css"
import { local } from "../library/store"
import { LanguageContext } from "../context/LanguageContext"

const defaultName = "Anon"

export const ExportMenu = ({getFaceScreenshot}) => {
  // Translate hook
  const { t } = useContext(LanguageContext);
  const [name] = React.useState(localStorage.getItem("name") || defaultName)
  const { model, avatar, templateInfo, characterManager } = useContext(SceneContext)

  const getOptions = () =>{
    const currentOption = local["mergeOptions_sel_option"] || 0;
    const screenshot = getFaceScreenshot();
    console.log(local["mergeOptions_create_atlas"]);
    const createTextureAtlas = local["mergeOptions_create_atlas"] == null ? true:local["mergeOptions_create_atlas"] 
    return {
      // isVrm0 : true,
      // createTextureAtlas : createTextureAtlas,
      mToonAtlasSize:getAtlasSize(local["mergeOptions_atlas_mtoon_size"] || 6),
      mToonAtlasSizeTransp:getAtlasSize(local["mergeOptions_atlas_mtoon_transp_size"] || 6),
      stdAtlasSize:getAtlasSize(local["mergeOptions_atlas_std_size"] || 6),
      stdAtlasSizeTransp:getAtlasSize(local["mergeOptions_atlas_std_transp_size"] || 6),
      exportStdAtlas:(currentOption === 0 || currentOption == 2),
      exportMtoonAtlas:(currentOption === 1 || currentOption == 2),
      screenshot:screenshot,
      // scale:templateInfo.exportScale||1,
      // vrmMeta:templateInfo.vrmMeta
    }
  }

  const downloadModel = () =>{
    const options = getOptions();
    characterManager.downloadVRM(name, options);
    // downloadVRMWithAvatar(model, avatar, name, options);
  }

  return (
    <React.Fragment>
      <CustomButton
        theme="light"
        text="GLB"
        icon="download"
        size={14}
        className={styles.button}
        onClick={() => {
          downloadGLB(model, true, name)
        }}
      />
      <CustomButton
        theme="light"
        text={`GLB (${t('text.unoptimized')})`}
        icon="download"
        size={14}
        className={styles.button}
        onClick={() => {
          downloadGLB(model, false, name)
        }}
      />
      <CustomButton
        theme="light"
        text="VRM"
        icon="download"
        size={14}
        className={styles.button}
        onClick={downloadModel}
      />
    </React.Fragment>
  )
}
