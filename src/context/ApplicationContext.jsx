import * as THREE from 'three'
import {useState, createContext} from 'react';
export const ApplicationContext = createContext();

export const ApplicationContextProvider = ({ children }) => {
    const [isMute, setMute] = useState(false);
    const [colorStatus, setColorStatus] = useState('');
    const [defaultModel, setDefaultModel] = useState(null);
    const [randomFlag, setRandomFlag] = useState(-1);
    const [avatar, setAvatar] = useState({
        skin:{},
        body:{},
        chest:{},
        head:{},
        neck:{},
        hand:{},
        ring:{},
        waist:{},
        weapon:{},
        legs:{},
        feet:{},
        accessories:{},
        eyes:{},
        outer:{},
        solo:{}
    });
    const [loadedTraits, setLoadedTraits] = useState(false);
    const [end, setEnd] = useState(false);
    const [template, setTemplate] = useState(1);
    const [scene, useScene] = useState(new THREE.Scene());
    const [category, setCategory] = useState({ category: "head" });
    const [templateInfo, setTemplateInfo] = useState({ file: null, format: null, bodyTargets:null });
    const [model, setModel] = useState({});
    const [controls, setControls] = useState({});
    const [camera, setCamera] = useState({});
    const [confirmWindow, setConfirmWindow] = useState(false);
    const [mintLoading, setMintLoading] = useState(false);
    const [mintStatus, setMintStatus] = useState("Please connect your wallet.");
    const [mintCost, setMintCost] = useState(0.1);
    const [loading, setLoading] = useState(true);
    const [selectedCharacterClass, setSelectedCharacterClass] = useState(null);
    const [mintDone, setMintDone] = useState(false);
    return (
        <ApplicationContext.Provider value={{
            isMute, setMute,
            colorStatus, setColorStatus,
            defaultModel, setDefaultModel,
            randomFlag, setRandomFlag,
            avatar, setAvatar,
            loadedTraits, setLoadedTraits,
            end, setEnd,
            template, setTemplate,
            scene, useScene,
            category, setCategory,
            templateInfo, setTemplateInfo,
            model, setModel,
            controls, setControls,
            camera, setCamera,
            confirmWindow, setConfirmWindow,
            mintLoading, setMintLoading,
            mintStatus, setMintStatus,
            mintCost, setMintCost,
            loading, setLoading,
            selectedCharacterClass, setSelectedCharacterClass,
            mintDone, setMintDone
        }}>
            {children}
        </ApplicationContext.Provider>
    )
}