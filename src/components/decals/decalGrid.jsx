import React from "react";
import styles from "../../pages/Appearance.module.css";
import cancel from '../../images/cancel.png';
import {SceneContext} from "../../context/SceneContext";
import CustomButton from "../custom-button";
import {combineURLs} from "../../library/load-utils";
import DecalItem from "./decalItem";

const DecalGridView = ({selectedTraitGroup,onBack})=>{
    // const {characterManager,moveCamera} = React.useContext(SceneContext);
    const {decalManager,characterManager} = React.useContext(SceneContext);
    const [selectedDecals, setSelectedDecals] = React.useState([]);
  
    const decals = selectedTraitGroup.decals;
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
                    }}
                />
            {decals.map((decal)=>{
              const path = combineURLs(characterManager.manifestData.getDecalsDirectory(),decal.diffuse);
  
              return (
                <DecalItem 
                  key={decal.id}
                    src={path}
                    active={selectedDecals.includes(decal.id)}
                    select={()=>{
                      console.log(selectedDecals)
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
