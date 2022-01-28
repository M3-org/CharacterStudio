import React, { createContext, useContext, useEffect, useState } from "react";
import { Route } from "react-router-dom";
import { apiService, meshService } from "../../services";


const GlobalContext = createContext({});

export const PrivateRoute = ({ component: Component, ...rest }) => {
  // Side indicator hook
  const [isLeft, setIsLeft] = useState(true);
  // Search State Hook
  const [search, setSearch] = useState("");
  // Categories State and Loaded Hooks
  const [categories, setCategories] = useState([]);
  // Collections State and Loaded Hooks 
  const [collection, setCollection] = useState([]);
  // Bones State and Loaded Hooks
  const [bones, setBones] = useState([]);
  const [bonesLoaded, setBonesLoaded] = useState(false);
  // Scene Loaded Hook
  const [sceneLoaded, setSceneLoaded] = useState(false);
  // Pose State Hook
  const [pose, setPose] = useState(undefined);
  const [poseSelected, setPoseSelected] = useState("default");
  // Pose Editor Parameters Hook
  const [rotationParameters, setRotationParameters] = useState({});
  // Category State Hook
  const [category, setCategory] = useState({
    name: "head",
    sideIndicator: false,
  });


  const [meshType, setMeshType] = useState("Head");
  const [loadedMeshes, setLoadedMeshes] = useState({
    Torso: "default_torso",
    LegR: "default_leg_R",
    LegL: "default_leg_L",
    Head: "default_head",
    ArmR: "default_arm_R",
    ArmL: "default_arm_L",
    HandR: "open_hand_R",
    HandL: "open_hand_L",
    FootR: "default_foot_R",
    FootL: "default_foot_L",
    Stand: "circle",
    pose: "default",
  });

  // Loading Categories
  useEffect(() => {
    if (!bonesLoaded) {
    apiService.fetchBones().then((res: any) => {
      setBones(res);
      setBonesLoaded(true);
    });
  } else {
      console.log("Bones Loaded");
      meshService.initialLoad(bones).then((res: any) => {
        setPose(res);
        setSceneLoaded(true);
      });
    }
  }, [bonesLoaded]);

  
  // Loading/Updating Mesh Type
  useEffect(() => {
    console.log("Mesh Type Changed/Saved");
    if (sceneLoaded) {
      meshService.getMeshType(category.name, isLeft).then((meshName) => {
        meshService.setMeshType(meshName);
        setMeshType(meshName);
      });
    }
  }, [sceneLoaded, isLeft, category]);
  
  // Loading Default Bone Rotation Parameters
  useEffect(() => {
    setTimeout(() => {
      console.log();
      meshService.setDefaultBoneRotations().then((res) => {
        setRotationParameters(res);
      });
    }, 1000);
  }, [(window as any).scene.loaded]);

  // Updating Meshes
  const updateMesh = async (category: any, selection: any) => {
    if (selection) {
      const newLoadedMeshes: any = {
        ...loadedMeshes,
        [meshType]: category.sideIndicator
          ? selection.file[isLeft ? 0 : 1]
          : selection.file,
      };
      setLoadedMeshes(newLoadedMeshes);
      if(category.name === "pose") {
        meshService.setPose(selection,bones);
      } else if(category.name === "stand") {
        meshService.setStand(selection);
      } else {
        meshService.updateMesh(category.name, selection, isLeft, bones, pose);
      }
    }
  };

  const changeSide = async (side) => {
    setIsLeft(side);
  };

  return (
    <Route
      {...rest}
      render={(props: any) => {
        return (
          <GlobalContext.Provider
            value={{
              categories,
              setCategories,
              category,
              setCategory,
              collection,
              setCollection,
              loadedMeshes,
              setLoadedMeshes,
              bones,
              setBones,
              pose,
              setPose,
              poseSelected,
              setPoseSelected,
              isLeft,
              changeSide,
              meshType,
              updateMesh,
              search,
              setSearch,
              sceneLoaded,
              rotationParameters,
              setRotationParameters
            }}
          >
            <Component {...props} />
          </GlobalContext.Provider>
        );
      }}
    />
  );
};

export const useGlobalState = () => useContext(GlobalContext);
