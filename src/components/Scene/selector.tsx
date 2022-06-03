import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { Avatar, Slider, Stack, Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import { VRM, VRMSchema } from "@pixiv/three-vrm";
import React, { useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { apiService, threeService } from "../../services";
import { useGlobalState } from "../GlobalProvider";
import templates from "../../data/base_models.json";
import "./style.scss";

export default function Selector() {
  const {
    category,
    scene,
    hair,
    setHair,
    face,
    setFace,
    tops,
    setTops,
    arms,
    setArms,
    shoes,
    setShoes,
    legs,
    setLegs,
    setTemplate,
    template,
    setTemplateInfo,
    templateInfo
  }: any = useGlobalState();
  const [selectValue, setSelectValue] = useState("0");
  
  const [collection, setCollection] = useState([]);
  const [traitName, setTraitName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const [loadingTrait, setLoadingTrait] = useState(null);
  const [loadingTraitOverlay, setLoadingTraitOverlay] = useState(false);

  const [noTrait, setNoTrait] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const handleChangeSkin = (event: Event, value: number | number[]) => {
    threeService.setMaterialColor(scene, value, "Bra001_2");
  };
   

  React.useEffect(() => {
    if(!scene) return;
    if (category) {
      if(category === "body"){
        for(const template of templates && templates){
          setCollection(templates);
          setTraitName('body');
        }
      }
      apiService.fetchTraitsByCategory(category).then((traits) => {
        if (traits) {
          setCollection(traits?.collection);
          setTraitName(traits?.trait);
        }
      });        

    }
  }, [category, scene]);


  React.useEffect(() => {
    if(!scene) return;
    async function _get() {
      const categories = [
        'hair',
        'tops',
        'legs',
        'shoes'
      ]
      if(!loaded){
        setTempInfo('2');
        if (scene && templateInfo) {
          for(const category of categories){
            apiService.fetchTraitsByCategory(category).then((traits) => {
              if (traits) {
               selectTrait(traits?.collection[0])
              }
            }); 
          }
        }
      }
    }
    _get();
  }, [loaded, scene, templateInfo ? Object.keys(templateInfo).length : templateInfo]);

  const setTempInfo = (id) => {
    apiService.fetchTemplate(id).then((res) => {
      setTemplateInfo(res);
    });
  }
  const selectTrait = (trait: any) => {
    if(trait.bodyTargets){
      setTemplate(trait?.id);
    }

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
      } else {
        if(trait.bodyTargets){
          setTemplate(trait?.id);
        }else{
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
              VRM.from( gltf ).then( async( vrm ) => {
                // vrm.scene.scale.z = -1;
                console.log("scene.add", scene.add)
                // TODO: This is a hack to prevent early loading, but we seem to be loading traits before this anyways
                // await until scene is not null
                await new Promise<void>((resolve) => {
                  // if scene, resolve immediately
                  if (scene && scene.add) {
                    resolve();
                  } else {
                    // if scene is null, wait for it to be set
                    const interval = setInterval(() => {
                      if (scene && scene.add) {
                        clearInterval(interval);
                        resolve();
                      }
                    }, 100);
                  }
                });






                scene.add(vrm.scene);
                vrm.humanoid.getBoneNode( VRMSchema.HumanoidBoneName.Hips ).rotation.y = Math.PI;
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
                setLoadingTrait(null);
                setLoadingTraitOverlay(false);
              
            });
          });
        }
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
              collection.map((item: any, index) => {
                return (
                  <div key = {index}
                    className={`selector-button coll-${traitName} ${
                      selectValue === item?.id ? "active" : ""
                    }`}
                    onClick={() => {
                      if(category === 'body'){
                        setLoaded(true);
                        setTempInfo(item.id);
                      }
                      selectTrait(item);
                    }}
                  >
                    <Avatar
                      className="icon"
                      src={item.thubnailsDirectory ? item.thumbnail : `${templateInfo?.thubnailsDirectory}${item?.thumbnail}`}
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
