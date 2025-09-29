import { TraitModelsGroup } from "@/library/CharacterManifestData";
import React from "react";
import { SceneContext } from "../../context/SceneContext";
import cancel from '../../images/cancel.png';
import { combineURLs } from "../../library/load-utils";
import styles from "../../pages/Appearance.module.css";
import CustomButton from "../custom-button";
import DecalItem from "./decalItem";

const DecalGridView = ({selectedTraitGroup,onBack}:{
    selectedTraitGroup:TraitModelsGroup,
    onBack:()=>void
})=>{
    const {decalManager,characterManager} = React.useContext(SceneContext);
    const [selectedDecals, setSelectedDecals] = React.useState<string[]>([]);
  
    const decals = selectedTraitGroup.getAllDecals();
    React.useEffect(()=>{
      const selected= Array.from(decalManager.applied.keys())
      setSelectedDecals(selected.map((x)=>x));
    },[])
  
  
    return (
      <div className={styles["selector-container-column"]}>
          <CustomButton
            theme="dark"
            text={"Back"}
            size={14}
            className={styles.buttonLeft}
            onClick={onBack}
          />
          <div className={styles["selector-container"]} >
                <DecalItem key={"empty"}
                    src={cancel}
                    active={false}
                    select={()=>{
                      decalManager.removeAllOverlayedTextures()
                      setSelectedDecals([]);
                    }}
                />
            {decals.map((decal)=>{
              const path = combineURLs(characterManager.manifestData.getTraitsDirectory(),decal.thumbnail);
  
              return (
                <DecalItem 
                  key={decal.id}
                    src={path}
                    active={selectedDecals.includes(decal.id)}
                    select={()=>{
                      if(selectedDecals.includes(decal.id)){
                        decalManager.removeOverlayTexture(decal.id).then(()=>{
                          setSelectedDecals(selectedDecals.filter((x)=>x!==decal.id));
                        })
  
                      }else{
                        decalManager.loadOverlayTexture(selectedTraitGroup,decal.id).then(()=>{
                          setSelectedDecals(selectedDecals.concat([decal.id]));
                        })
                      }
                    }}
                    />
              )
            })}
          </div>
  
      </div>
    )
  }
  

  export default DecalGridView;
