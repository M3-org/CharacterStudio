import React from "react"
import { SceneContext } from "../context/SceneContext"
import styles from "./RightPanel.module.css"
import MenuTitle from "./MenuTitle"
import traitsIcon from "../images/t-shirt.png"
import walletIcon from "../images/wallet.png"
import genSpriteIcon from "../images/users.png"
import emotionIcon from "../images/emotion.png"
import genLoraIcon from "../images/paste.png"
import genThumbIcon from "../images/portraits.png"
import { TokenBox } from "../components/token-box/TokenBox"
import WalletMenu from "./WalletMenu"
import TraitInformation from "../components/TraitInformation"
import LoraCreation from "./LoraCreation"
import SpriteCreation from "./SpriteCreation"
import ThumbnailCreation from "./ThumbnailCreation"
import Emotions from "./Emotions"

export default function RightPanel({selectedTrait, selectedVRM, traitGroupName}){
    const {
        characterManager,
    } = React.useContext(SceneContext)

    const [selectedOption, setSelectedOption] = React.useState("")
    const [lockedManifests, setLockedManifests] = React.useState("")
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
            {selectedOption=="wallet" && <WalletMenu lockedManifests={lockedManifests} />}
            {selectedOption=="Information" && <TraitInformation selectedTrait={selectedTrait} selectedVRM={selectedVRM} />}
            {selectedOption=="LoraCreation" && <LoraCreation selectedTrait={selectedTrait} selectedVRM={selectedVRM} />}
            {selectedOption=="SpriteCreation" && <SpriteCreation selectedTrait={selectedTrait} selectedVRM={selectedVRM} />}
            {selectedOption=="ThumbnailCreation" && <ThumbnailCreation selectedTrait={selectedTrait} traitGroupName={traitGroupName} />}
            {selectedOption=="EmotionManager" && <Emotions />}
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Tools" width={90} right={0}/>
                <div className={styles["scrollContainer"]}>
                <div className={styles["optionsContainer"]}>
                    <div
                        key={"wallet"}
                        onClick={()=>{
                            setSelectedOptionString("wallet"); 
                            console.log(setLockedManifests(characterManager.getLoadedLockedManifests(true)))
                        }}
                    >
                        <TokenBox
                        size={56}
                        icon={walletIcon}
                        rarity={selectedOption == "wallet" ? "mythic" : "none"}      
                        />
                    </div>
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
                     <div
                            key={"Emotions"}
                            onClick={()=>{setSelectedOptionString("EmotionManager")}}
                        >
                            <TokenBox
                            size={56}
                            icon={emotionIcon}
                            rarity={selectedOption == "EmotionManager" ? "mythic" : "none"}      
                            />
                        </div>
                    </div>    
                </div>

            </div>
        </div>
    )
}