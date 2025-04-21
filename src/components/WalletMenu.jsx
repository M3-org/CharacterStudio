import React, { useContext } from "react"
import styles from "./FloatingMenu.module.css"
import MenuTitle from "./MenuTitle"
import { SceneContext } from "../context/SceneContext";

//import { useLocation } from "react-router-dom";
import axios from "axios";
//import { getUserCNFTs } from "./sola"

export default function WalletMenu({lockedManifests}){
    const {
        characterManager,
    } = useContext(SceneContext);




    const [user, setUser] = React.useState(null);
    //const location = useLocation();
    
    // Extract token from URL query
    //const token = new URLSearchParams(location.search).get("token");
  
    // React.useEffect(() => {
    //   if (token) {
    //     console.log("token");
    //     axios
    //       .get("https://api.github.com/user", {
    //         headers: { Authorization: `Bearer ${token}` },
    //       })
    //       .then((res) => setUser(res.data))
    //       .catch((err) => console.error(err));
    //   }
    // }, [token]);

    React.useEffect(() => {
        if (user) {
            console.log("welcome: ", user.name)
            console.log("avatar: ", user.avatar_url)
            console.log("public repos: ", user.public_repos)
        }
      }, [user]);

    const unlockManifest = (index) => {
        const addressTest = "0x2333FCc3833D2E951Ce8e821235Ed3B729141996";
        characterManager.unlockManifestByIndex(index, index === 1 ? addressTest : null)
    };

    const githubConnect = () => {
        window.location.href = "http://localhost:5000/auth/github";
    };
    return (
        
        <div>
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Unlock With Wallet" width={180} right={20}/>
                <div className={styles["scrollContainer"]}>
                    <div 
                        className={styles["actionButton"]}
                        onClick={() => {
                            githubConnect()
                        }}>
                        <div> Github Coonnect </div>
                    </div>
                    {lockedManifests && lockedManifests.length > 0 &&  lockedManifests.map((manifest, index) => {
                        return (
                            <div 
                                key={index}
                                className={styles["actionButton"]}
                                onClick={() => {
                                    unlockManifest(index)
                                }}>
                                <div>  {manifest.collectionLockID} </div>
                            </div>
                        )
                    })}
                    
                    </div>

            </div>
        </div>
      )
}