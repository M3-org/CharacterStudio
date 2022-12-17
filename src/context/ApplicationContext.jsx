import * as THREE from 'three'
import {useState, createContext} from 'react';
export const ApplicationContext = createContext();

export const ApplicationContextProvider = ({ children }) => {

    const [colorStatus, setColorStatus] = useState('');
    const [defaultModel, setDefaultModel] = useState(null);
    const [randomFlag, setRandomFlag] = useState(-1); // TODO: wtf?
    const [skinColor, setSkinColor] = useState(new THREE.Color(1,1,1));
    const [avatar, _setAvatar] = useState({
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
    const setAvatar = (state) => {
        cullHiddenMeshes(avatar, scene, avatarTemplateSpec);
        _setAvatar(state);
    }
    const [loadedTraits, setLoadedTraits] = useState(false);  // difference?
    const [template, setTemplate] = useState(1); // difference from above? can derive one from other?
    const [templateInfo, setTemplateInfo] = useState({ file: null, format: null, bodyTargets:null }); // TODO: and this? 
    const [avatarTemplateSpec, setAvatarTemplateSpec] = useState(null); // AND THISSSS??

    const [categoryList, setSelectorCategoryList] = useState([
            "chest",
            "head",
            "neck",
            "legs",
            "feet"
          ]);

    const [isMute, setMute] = useState(false);

    const [end, setEnd] = useState(false); // replace with view state
    const [mintDone, setMintDone] = useState(false); // TODO: replace with view state
    const [confirmWindow, setConfirmWindow] = useState(false);  // TODO: replace with view state

    const [scene, useScene] = useState(new THREE.Scene());
    const [selectorCategory, setSelectorCategory] = useState({ selectorCategory: "head" });
    const [model, setModel] = useState({});
    const [controls, setControls] = useState({});
    const [camera, setCamera] = useState({});

    const [loading, setLoading] = useState(true);
    const [selectedCharacterClass, setSelectedCharacterClass] = useState(null);

    const [mintLoading, setMintLoading] = useState(false);
    const [mintStatus, setMintStatus] = useState("Please connect your wallet.");
    const [mintCost, setMintCost] = useState(0.1);
    return (
        <ApplicationContext.Provider value={{
            isMute, setMute,
            skinColor, setSkinColor,
            categoryList, setSelectorCategoryList,
            colorStatus, setColorStatus,
            defaultModel, setDefaultModel,
            randomFlag, setRandomFlag,
            avatar, setAvatar,
            loadedTraits, setLoadedTraits,
            end, setEnd,
            template, setTemplate,
            scene, useScene,
            selectorCategory, setSelectorCategory,
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