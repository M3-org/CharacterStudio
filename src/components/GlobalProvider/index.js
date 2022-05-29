import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import { Route } from "react-router-dom";
const GlobalContext = React.createContext({});
export const GPRoute = ({ component: Component, ...rest }) => {
    // General State Hooks
    // ---------- //
    // Which character creator/generator is chosen ( base , template , custom )
    const [generator, setGenerator] = React.useState(0);
    const [navigation, setNavigation] = React.useState("body");
    const [modelLoaded, setModelLoaded] = React.useState();
    // State Hooks For Character Editor ( Base ) //
    // ---------- //
    // Charecter Name State Hook ( Note: this state will also update the name over the 3D model. )
    const [characterName, setCharacterName] = React.useState("Character Name");
    // Categories State and Loaded Hooks
    const [categories, setCategories] = React.useState([]);
    const [categoriesLoaded, setCategoriesLoaded] = React.useState(false);
    // Collections State and Loaded Hooks
    const [collection, setCollection] = React.useState([]);
    const [collectionLoaded, setCollectionLoaded] = React.useState(false);
    // Bones State and Loaded Hooks
    const [bones, setBones] = React.useState([]);
    const [bonesLoaded, setBonesLoaded] = React.useState(false);
    // Pose State Hook
    const [pose, setPose] = React.useState(undefined);
    const [poseSelected, setPoseSelected] = React.useState("default");
    // Selected category State Hook
    const [category, setCategory] = React.useState("color");
    // 3D Model Content State Hooks ( Scene, Nodes, Materials, Animations e.t.c ) //
    const [model, setModel] = React.useState(Object);
    const [nodes, setNodes] = React.useState(Object);
    const [scene, setScene] = React.useState(Object);
    const [materials, setMaterials] = React.useState(Object);
    const [animations, setAnimations] = React.useState(Object);
    // States Hooks used in template editor //
    const [templateInfo, setTemplateInfo] = React.useState();
    const [randomize, setRandomize] = React.useState(false);
    const [downloadPopup, setDownloadPopup] = React.useState(false);
    const [mintPopup, setMintPopup] = React.useState(false);
    // MINT INFORMATION HOOKs
    const [avatarCategory, setAvatarCategory] = React.useState(0);
    const [gender, setGender] = React.useState(0);
    const [template, setTemplate] = React.useState(0);
    const [loadingModelProgress, setLoadingModelProgress] = React.useState(0);
    const [totalToBeMinted, setTotalToBeMinted] = React.useState(10000);
    const [totalMinted, setTotalMinted] = React.useState(0);
    const [mintPrice, setMintPrice] = React.useState("0.05");
    const [mintPricePublic, setMintPricePublic] = React.useState("0.069");
    const [skin, setSkin] = React.useState();
    const [hair, setHair] = React.useState();
    const [face, setFace] = React.useState();
    const [tops, setTops] = React.useState();
    const [arms, setArms] = React.useState();
    const [neck, setNeck] = React.useState();
    const [bottoms, setBottoms] = React.useState();
    const [shoes, setShoes] = React.useState();
    const [legs, setLegs] = React.useState();
    const [accessories, setAccessories] = React.useState();
    return (_jsx(Route, { ...rest, render: (props) => {
            return (_jsx(GlobalContext.Provider, { value: {
                    // ----- Selected Traits Hooks -------- //
                    skin,
                    setSkin,
                    hair,
                    setHair,
                    face,
                    setFace,
                    tops,
                    setTops,
                    arms,
                    setArms,
                    neck,
                    setNeck,
                    bottoms,
                    setBottoms,
                    shoes,
                    setShoes,
                    legs,
                    setLegs,
                    accessories,
                    setAccessories,
                    // ----- General Use State Hooks ------ //
                    generator,
                    setGenerator,
                    navigation,
                    setNavigation,
                    modelLoaded,
                    setModelLoaded,
                    totalToBeMinted,
                    setTotalToBeMinted,
                    totalMinted,
                    setTotalMinted,
                    mintPrice,
                    setMintPrice,
                    mintPricePublic,
                    setMintPricePublic,
                    // ----- Navigation Categories / State Hooks ----- //
                    categories,
                    setCategories,
                    categoriesLoaded,
                    setCategoriesLoaded,
                    category,
                    setCategory,
                    characterName,
                    setCharacterName,
                    // ----- 3D Model Content State Hooks ----- //
                    model,
                    setModel,
                    nodes,
                    setNodes,
                    scene,
                    setScene,
                    materials,
                    setMaterials,
                    animations,
                    setAnimations,
                    loadingModelProgress,
                    setLoadingModelProgress,
                    // ----- Template State Hooks ----- //
                    template,
                    setTemplate,
                    templateInfo,
                    setTemplateInfo,
                    randomize,
                    setRandomize,
                    downloadPopup,
                    setDownloadPopup,
                    mintPopup,
                    setMintPopup,
                    // ----- Avatar Select Category ---- //
                    avatarCategory,
                    setAvatarCategory,
                    gender,
                    setGender
                }, children: _jsx(Component, { ...props }) }));
        } }));
};
export const useGlobalState = () => React.useContext(GlobalContext);
