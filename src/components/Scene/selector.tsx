import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { Avatar, Slider, Stack, Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import { VRM } from "@pixiv/three-vrm";
import React, { useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { apiService, threeService } from "../../services";
import { useGlobalState } from "../GlobalProvider";
import "./style.scss";

export default function Selector() {
  const {
    category,
    scene,
    templateInfo,
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
  }: any = useGlobalState();
  const [selectValue, setSelectValue] = useState("0");

  const [collection, setCollection] = useState([]);
  const [traitName, setTraitName] = useState("");

  const [loadingTrait, setLoadingTrait] = useState(null);
  const [loadingTraitOverlay, setLoadingTraitOverlay] = useState(false);

  const [noTrait, setNoTrait] = useState(true);

  const handleChangeSkin = (event: Event, value: number | number[]) => {
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

  const selectTrait = (trait: any) => {
    if (scene) {
      if(trait === "0") {
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
      } else {
      setLoadingTraitOverlay(true);
      setNoTrait(false);
      const loader = new GLTFLoader();

      loader
        .loadAsync(
          `${templateInfo?.traitsDirectory}${trait?.directory}`,
          (e) => {
            console.log((e.loaded * 100) / e.total);
            setLoadingTrait(Math.round((e.loaded * 100) / e.total));
          }
        )
        .then((gltf) => {
          VRM.from( gltf ).then( ( vrm ) => {
          if (scene) {
            vrm.scene.scale.z = -1;
            scene.add(vrm.scene);
            vrm.scene.frustumCulled = false;
            console.log(trait);
            if (traitName === "hair") {
              console.log("HAIR");
              setHair({
                traitInfo: trait,
                model: vrm.scene,
              });
              if (hair) {
                scene.remove(hair.model);
              }
            }
            if (traitName === "face") {
              setFace({
                traitInfo: trait,
                model: vrm.scene,
              });
              if (face) {
                scene.remove(face.model);
              }
            }
            if (traitName === "tops") {
              setTops({
                traitInfo: trait,
                model: vrm.scene,
              });
              if (tops) {
                scene.remove(tops.model);
              }
            }
            if (traitName === "arms") {
              setArms({
                traitInfo: trait,
                model: vrm.scene,
              });
              if (arms) {
                scene.remove(arms.model);
              }
            }
            if (traitName === "neck") {
              setNeck({
                traitInfo: trait,
                model: vrm.scene,
              });
              if (neck) {
                scene.remove(neck.model);
              }
            }
            if (traitName === "bottoms") {
              setBottoms({
                traitInfo: trait,
                model: vrm.scene,
              });
              if (bottoms) {
                scene.remove(bottoms.model);
              }
            }
            if (traitName === "shoes") {
              setShoes({
                traitInfo: trait,
                model: vrm.scene,
              });
              if (shoes) {
                scene.remove(shoes.model);
              }
            }
            if (traitName === "legs") {
              setLegs({
                traitInfo: trait,
                model: vrm.scene,
              });
              if (legs) {
                scene.remove(legs.model);
              }
            }
            if (traitName === "accessories") {
              setAccessories({
                traitInfo: trait,
                model: vrm.scene,
              });
              if (accessories) {
                scene.remove(accessories.model);
              }
            }
            setLoadingTrait(null);
            setLoadingTraitOverlay(false);
          }
        });
      });
      }
    }
    setSelectValue(trait?.id);
  };

  return (
    <div className="selector-container">
      <Stack
        direction="row"
        spacing={2}
        justifyContent="left"
        alignItems="left"
        divider={<Divider orientation="vertical" flexItem />}
      >
        {category === "color" ? (
          <Slider
            defaultValue={255}
            valueLabelDisplay="off"
            step={1}
            max={255}
            min={0}
            onChange={handleChangeSkin}
            sx={{ width: "30%" }}
          />
        ) : (
          <React.Fragment>
            <div
              className={`selector-button ${
                noTrait ? "active" : ""
              }`}
              onClick={() => selectTrait("0")}
            >
              <Avatar className="icon">
                <DoNotDisturbIcon />
              </Avatar>
            </div>
            {collection &&
              collection.map((item: any) => {
                return (
                  <div
                    className={`selector-button coll-${traitName} ${
                      selectValue === item?.id ? "active" : ""
                    }`}
                    onClick={() => selectTrait(item)}
                  >
                    <Avatar
                      className="icon"
                      src={`${templateInfo?.thubnailsDirectory}${item?.thumbnail}`}
                    />
                    {selectValue === item?.id && loadingTrait > 0 && (
                      <Typography className="loading-trait">
                        {loadingTrait}%
                      </Typography>
                    )}
                  </div>
                );
              })}
            <div style={{ visibility: "hidden" }}>
              <Avatar className="icon" />
            </div>
          </React.Fragment>
        )}
      </Stack>
      <div className={loadingTraitOverlay ? "loading-trait-overlay show" : "loading-trait-overlay"} />
    </div>
  );
}
