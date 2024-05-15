import React, { useContext, useState, useEffect } from "react"
import styles from "./RightPanel.module.css"
import MenuTitle from "./MenuTitle"
import traitsIcon from "../images/t-shirt.png"
import genSpriteIcon from "../images/users.png"
import genLoraIcon from "../images/paste.png"
import genThumbIcon from "../images/portraits.png"
import { TokenBox } from "../components/token-box/TokenBox"
import TraitInformation from "../components/TraitInformation"
import LoraCreation from "./LoraCreation"
import SpriteCreation from "./SpriteCreation"
import ThumbnailCreation from "./ThumbnailCreation"

export default function RightPanel({selectedTrait, selectedVRM, traitGroupName}){
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
            {selectedOption=="LoraCreation" && <LoraCreation selectedTrait={selectedTrait} selectedVRM={selectedVRM} />}
            {selectedOption=="SpriteCreation" && <SpriteCreation selectedTrait={selectedTrait} selectedVRM={selectedVRM} />}
            {selectedOption=="ThumbnailCreation" && <ThumbnailCreation selectedTrait={selectedTrait} traitGroupName={traitGroupName} />}
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
                        icon={traitsIcon}
                        rarity={selectedOption == "Information" ? "mythic" : "none"}      
                        />
                    </div>
                    <div
                        key={"LoraCreation"}
                        onClick={()=>{setSelectedOptionString("LoraCreation")}}
                    >
                        <TokenBox
                        size={56}
                        icon={genLoraIcon}
                        rarity={selectedOption == "LoraCreation" ? "mythic" : "none"}      
                        />
                    </div>
                    <div
                        key={"SpriteCreation"}
                        onClick={()=>{setSelectedOptionString("SpriteCreation")}}
                    >
                        <TokenBox
                        size={56}
                        icon={genSpriteIcon}
                        rarity={selectedOption == "SpriteCreation" ? "mythic" : "none"}      
                        />
                    </div>
                    <div
                        key={"ThumbnailCreation"}
                        onClick={()=>{setSelectedOptionString("ThumbnailCreation")}}
                    >
                        <TokenBox
                        size={56}
                        icon={genThumbIcon}
                        rarity={selectedOption == "ThumbnailCreation" ? "mythic" : "none"}      
                        />
                    </div>
                    </div>    
                </div>

            </div>
        </div>
    )
}