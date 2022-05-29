import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Slider, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import { apiService, threeService } from "../../services";
import { useGlobalState } from "../GlobalProvider";
import Divider from "@mui/material/Divider";
import { Avatar } from "@mui/material";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "./style.scss";
export default function Selector() {
    const { category, scene, templateInfo, skin, setSkin, hair, setHair, face, setFace, tops, setTops, arms, setArms, neck, setNeck, bottoms, setBottoms, shoes, setShoes, legs, setLegs, accessories, setAccessories, } = useGlobalState();
    const [selectValue, setSelectValue] = useState("0");
    const [collection, setCollection] = useState([]);
    const [traitName, setTraitName] = useState("");
    const [loadingTrait, setLoadingTrait] = useState(null);
    const [loadingTraitOverlay, setLoadingTraitOverlay] = useState(false);
    const [noTrait, setNoTrait] = useState(true);
    const handleChangeSkin = (event, value) => {
        threeService.setMaterialColor(scene, value, "Bra001_2");
    };
    React.useEffect(() => {
        if (category) {
            apiService.fetchTraitsByCategory(category).then((traits) => {
                console.log(traits);
                if (traits) {
                    setCollection(traits?.collection);
                    setTraitName(traits?.trait);
                }
            });
        }
    }, [category]);
    const selectTrait = (trait) => {
        if (scene) {
            if (trait === "0") {
                setNoTrait(true);
                if (traitName === "hair") {
                    if (hair) {
                        scene.remove(hair.model);
                    }
                }
                if (traitName === "face") {
                    if (face) {
                        scene.remove(face.model);
                    }
                }
                if (traitName === "tops") {
                    if (tops) {
                        scene.remove(tops.model);
                    }
                }
                if (traitName === "arms") {
                    if (arms) {
                        scene.remove(arms.model);
                    }
                }
                if (traitName === "neck") {
                    if (neck) {
                        scene.remove(neck.model);
                    }
                }
                if (traitName === "bottoms") {
                    if (bottoms) {
                        scene.remove(bottoms.model);
                    }
                }
                if (traitName === "shoes") {
                    if (shoes) {
                        scene.remove(shoes.model);
                    }
                }
                if (traitName === "legs") {
                    if (legs) {
                        scene.remove(legs.model);
                    }
                }
                if (traitName === "accessories") {
                    if (accessories) {
                        scene.remove(accessories.model);
                    }
                }
            }
            else {
                setLoadingTraitOverlay(true);
                setNoTrait(false);
                const loader = new GLTFLoader();
                loader
                    .loadAsync(`${templateInfo?.traitsDirectory}${trait?.directory}`, (e) => {
                    console.log((e.loaded * 100) / e.total);
                    setLoadingTrait(Math.round((e.loaded * 100) / e.total));
                })
                    .then((model) => {
                    if (scene) {
                        model.scene.scale.z = -1;
                        scene.add(model.scene);
                        console.log(trait);
                        if (traitName === "hair") {
                            console.log("HAIR");
                            setHair({
                                traitInfo: trait,
                                model: model.scene,
                            });
                            if (hair) {
                                scene.remove(hair.model);
                            }
                        }
                        if (traitName === "face") {
                            setFace({
                                traitInfo: trait,
                                model: model.scene,
                            });
                            if (face) {
                                scene.remove(face.model);
                            }
                        }
                        if (traitName === "tops") {
                            setTops({
                                traitInfo: trait,
                                model: model.scene,
                            });
                            if (tops) {
                                scene.remove(tops.model);
                            }
                        }
                        if (traitName === "arms") {
                            setArms({
                                traitInfo: trait,
                                model: model.scene,
                            });
                            if (arms) {
                                scene.remove(arms.model);
                            }
                        }
                        if (traitName === "neck") {
                            setNeck({
                                traitInfo: trait,
                                model: model.scene,
                            });
                            if (neck) {
                                scene.remove(neck.model);
                            }
                        }
                        if (traitName === "bottoms") {
                            setBottoms({
                                traitInfo: trait,
                                model: model.scene,
                            });
                            if (bottoms) {
                                scene.remove(bottoms.model);
                            }
                        }
                        if (traitName === "shoes") {
                            setShoes({
                                traitInfo: trait,
                                model: model.scene,
                            });
                            if (shoes) {
                                scene.remove(shoes.model);
                            }
                        }
                        if (traitName === "legs") {
                            setLegs({
                                traitInfo: trait,
                                model: model.scene,
                            });
                            if (legs) {
                                scene.remove(legs.model);
                            }
                        }
                        if (traitName === "accessories") {
                            setAccessories({
                                traitInfo: trait,
                                model: model.scene,
                            });
                            if (accessories) {
                                scene.remove(accessories.model);
                            }
                        }
                        setLoadingTrait(null);
                        setLoadingTraitOverlay(false);
                    }
                });
            }
        }
        setSelectValue(trait?.id);
    };
    return (_jsxs("div", { className: "selector-container", children: [_jsx(Stack, { direction: "row", spacing: 2, justifyContent: "left", alignItems: "left", divider: _jsx(Divider, { orientation: "vertical", flexItem: true }), children: category === "color" ? (_jsx(Slider, { defaultValue: 255, valueLabelDisplay: "off", step: 1, max: 255, min: 0, onChange: handleChangeSkin, sx: { width: "30%" } })) : (_jsxs(React.Fragment, { children: [_jsx("div", { className: `selector-button ${noTrait ? "active" : ""}`, onClick: () => selectTrait("0"), children: _jsx(Avatar, { className: "icon", children: _jsx(DoNotDisturbIcon, {}) }) }), collection &&
                            collection.map((item) => {
                                return (_jsxs("div", { className: `selector-button coll-${traitName} ${selectValue === item?.id ? "active" : ""}`, onClick: () => selectTrait(item), children: [_jsx(Avatar, { className: "icon", src: `${templateInfo?.thubnailsDirectory}${item?.thumbnail}` }), selectValue === item?.id && loadingTrait > 0 && (_jsxs(Typography, { className: "loading-trait", children: [loadingTrait, "%"] }))] }));
                            }), _jsx("div", { style: { visibility: "hidden" }, children: _jsx(Avatar, { className: "icon" }) })] })) }), _jsx("div", { className: loadingTraitOverlay ? "loading-trait-overlay show" : "loading-trait-overlay" })] }));
}
