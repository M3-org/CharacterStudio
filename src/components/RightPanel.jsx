import React, { useContext, useState, useEffect } from "react"
import styles from "./RightPanel.module.css"
import MenuTitle from "./MenuTitle"
import randomizeIcon from "../images/randomize.png"
import { TokenBox } from "../components/token-box/TokenBox"
import TraitInformation from "../components/TraitInformation"

export default function RightPanel({selectedTrait, selectedVRM}){
    const [selectedOption, setSelectedOption] = React.useState("")
    const setSelectedOptionString = (option) => {
        if (option != selectedOption){
            setSelectedOption(option);
        }
        else{
            setSelectedOption("");
        }
    }
    return (
        <div>
            {selectedOption=="Information" && <TraitInformation selectedTrait={selectedTrait} selectedVRM={selectedVRM} />}
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Tools" width={90} right={0}/>
                <div className={styles["scrollContainer"]}>
                <div className={styles["optionsContainer"]}>
                    <div
                        key={"Information"}
                        onClick={()=>{setSelectedOptionString("Information")}}
                    >
                        <TokenBox
                        size={56}
                        icon={randomizeIcon}
                        rarity={selectedOption == "Information" ? "mythic" : "none"}      
                        />
                    </div>
                    <div
                        key={"LoraCreation"}
                        onClick={()=>{setSelectedOptionString("LoraCreation")}}
                    >
                        <TokenBox
                        size={56}
                        icon={randomizeIcon}
                        rarity={selectedOption == "LoraCreation" ? "mythic" : "none"}      
                        />
                    </div>
                    <div
                        key={"SpriteCreation"}
                        onClick={()=>{setSelectedOptionString("SpriteCreation")}}
                    >
                        <TokenBox
                        size={56}
                        icon={randomizeIcon}
                        rarity={selectedOption == "SpriteCreation" ? "mythic" : "none"}      
                        />
                    </div>
                    <div
                        key={"ThumbnailCreation"}
                        onClick={()=>{setSelectedOptionString("ThumbnailCreation")}}
                    >
                        <TokenBox
                        size={56}
                        icon={randomizeIcon}
                        rarity={selectedOption == "ThumbnailCreation" ? "mythic" : "none"}      
                        />
                    </div>
                    </div>    
                </div>

            </div>
        </div>
    )
}