import React from "react"
import styles from "./PurchaseMenu.module.css"
import MenuTitle from "./MenuTitle"
import { TokenBox } from "../components/token-box/TokenBox"
import CustomButton from "./custom-button"

export default function PurchaseMenu({purchaseTraits, currentPrice, onConfirmPurchase, cancelPurchase, currency}){    
    return (
        <div>
            <div className={styles["InformationContainerPos"]}>
                
                <MenuTitle title="Purchase" width={600} left={0}/>
                {/* <div className={styles["traitsTitle"]}>
                    Once purchased you can reuse them in future characters connecting with your wallet
                </div> */}
                    <div className={styles["traitsTitle"]}>
                        <div className={styles["traitTextSmall"] }>{"Icon"}</div>
                        <div className={styles["traitText"] }>{"Asset Name"}</div>
                        <div className={styles["traitText"]}>{"Price"}</div>
                        <div className={styles["traitText"]}>{"Group"}</div>
                    </div>
                    <div className={styles["scrollContainer"]}>
                        <div className={styles["optionsContainer"]}>
                            {/* All buttons section */
                                purchaseTraits.map((trait, index) => {
                                return (
                                    <div 
                                        key={index} 
                                        className={styles["traitDisplay"]}>
                                            <TokenBox
                                                size={56}
                                                icon={ trait.fullThumbnail }
                                                rarity={"mythic"}
                                            />
                                            <div className={styles["traitText"] }>{trait.name}</div>
                                            <div className={styles["traitText"]}>{trait.price + " " + currency}</div>
                                            <div className={styles["traitText"]}>{trait.traitGroup.trait}</div>
                                    </div>
                                )
                            })}
                            <div className={styles["traitsTitle"]}>
                                
                                <div className={styles["traitTextLarge"] }>{"Total: " + currentPrice + " " + currency}</div>
                            </div>
                            <div className={styles["buttonAlign"] }>
                                
                                <CustomButton
                                    theme="light"
                                    text={'Buy Assets'}
                                    size={14}
                                    minWidth={60}
                                    onClick={onConfirmPurchase}
                                />
                                <CustomButton
                                    theme="light"
                                    text={'Cancel'}
                                    size={14}
                                    minWidth={60}
                                    onClick={cancelPurchase}
                                />
                            </div>
                        </div>    
                    </div>
            </div>
        </div>
    )
}