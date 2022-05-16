import { Slider, Stack } from "@mui/material";
import React, { useState } from "react";
import { apiService, threeService } from "../../services";
import { useGlobalState } from "../GlobalProvider";
import Divider from "@mui/material/Divider";
import { Avatar } from "@mui/material";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import "./style.scss";

export default function Selector() {
  const { category, scene, templateInfo }: any = useGlobalState();
  const [selectValue, setSelectValue] = useState("0");

  const [collection, setCollection] = useState([]);

  const handleChangeSkin = (event: Event, value: number | number[]) => {
    threeService.setMaterialColor(scene, value, "Bra001_2");
  };

  React.useEffect(() => {
    if (category) {
      apiService.fetchTraitsByCategory(category).then((traits) => {
        console.log(traits);
        if (traits) {
          setCollection(traits?.collection);
        }
      });
    }
  }, [category]);

  const selectTrait = (id: any) => {
    setSelectValue(id);
  }

  return (
    <div className="selector-container">
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="center"
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
              className={`selector-button ${selectValue === "0" ? "active" : ""}`}
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
                    className={`selector-button ${
                      selectValue === item?.id ? "active" : ""
                    }`}
                    onClick={() => selectTrait(item?.id)}
                  >
                    <Avatar
                      className="icon"
                      src={`${templateInfo?.thubnailsDirectory}${item?.thumbnail}`}
                    />
                  </div>
                );
              })}
          </React.Fragment>
        )}
      </Stack>
    </div>
  );
}
