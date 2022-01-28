import React from "react";
import Box from "@mui/material/Box";
import SettingsIcon from "@mui/icons-material/Settings";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Avatar from "@mui/material/Avatar";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

import "./style.scss";

import { useGlobalState } from "../GlobalProvider";
import { apiService } from "../../services";

export function MeshSelector() {
  const { categories, category, setCategory }: any = useGlobalState();

  //console.log(categories);

  const changeCategory = (category: any) => {
    setCategory({
      name: category.name,
      sideIndicator: category.sideIndicator,
    });
  };

  return (
    <List className="categories-wrap">
      {categories &&
        categories.map((cat: any, index: any) => {
          return (
            <ListItem
              key={index}
              onClick={() => changeCategory(cat)}
              className={
                category && category.name === cat.name
                  ? "mesh-nav-item active"
                  : "mesh-nav-item"
              }
            >
              <Avatar
                alt={`${cat.name}`}
                className="icon"
                src={`/img/graphics_creation/${cat.imgfile}`}
              />
            </ListItem>
          );
        })}
      <ListItem
        key={"settings"}
        onClick={() => changeCategory("settings")}
        className={
          category && category.name === "settings"
            ? "mesh-nav-item active"
            : "mesh-nav-item"
        }
      >
        <Avatar className="icons">
          <SettingsIcon />
        </Avatar>
      </ListItem>
    </List>
  );
}

export function MeshSelectorRadio(props: any) {
  const { scene, randomize }: any = useGlobalState();
  const meshes = props.meshes;

  const [selectedMesh, setSelectedMesh] = React.useState<string>();

  React.useEffect(() => {
    meshes.collection.map((key: any, index) => {
      const object = scene.getObjectByName(key.target);
      if (object.visible) {
        setSelectedMesh(key.target);
      }
    });
  }, [!randomize]);

  const onMeshChange = async (target: any) => {
    console.log(target);
    const object = scene.getObjectByName(selectedMesh);
    object.visible = false;
    const object2 = scene.getObjectByName(target);
    object2.visible = true;
    setSelectedMesh(target);
    //setCategory({
    //name: category.name,
    //sideIndicator: category.sideIndicator,
    //});
  };

  return (
    <>
      {meshes && selectedMesh && meshes.length > 0 && (
        <FormControl component="fieldset" className="radio-list">
          <FormLabel component="legend">{meshes.name}</FormLabel>
          <RadioGroup
            aria-label="gender"
            value={selectedMesh}
            name={`radio-buttons-group-${props.index}`}
          >
            {meshes.collection.map((key: any, index) => {
              return (
                <FormControlLabel
                  value={key.target}
                  control={<Radio />}
                  onClick={() => onMeshChange(key.target)}
                  label={key.name}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
      )}
    </>
  );
}
