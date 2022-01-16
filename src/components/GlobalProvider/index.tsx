import * as React from "react";
import { Route } from "react-router-dom";
import { useHistory } from "react-router";
import { apiService } from "../../actions/services";

const GlobalContext = React.createContext({});

export const GPRoute = ({ component: Component, ...rest }) => {
  // General State Hooks
  // ---------- //
  // Which character creator/generator is chosen ( base , template , custom )
  const [generator, setGenerator] = React.useState<any>(0);
  const [navigation, setNavigation] = React.useState<string>("body");
  const [modelLoaded, setModelLoaded] = React.useState<boolean>();
  // State Hooks For Character Editor ( Base ) //
  // ---------- //
  // Charecter Name State Hook ( Note: this state will also update the name over the 3D model. )
  const [characterName, setCharacterName] =
    React.useState<string>("Character Name");
  // Categories State and Loaded Hooks
  const [categories, setCategories] = React.useState([]);
  const [categoriesLoaded, setCategoriesLoaded] =
    React.useState<boolean>(false);
  // Collections State and Loaded Hooks
  const [collection, setCollection] = React.useState([]);
  const [collectionLoaded, setCollectionLoaded] =
    React.useState<boolean>(false);
  // Bones State and Loaded Hooks
  const [bones, setBones] = React.useState([]);
  const [bonesLoaded, setBonesLoaded] = React.useState<boolean>(false);
  // Pose State Hook
  const [pose, setPose] = React.useState(undefined);
  const [poseSelected, setPoseSelected] = React.useState("default");
  // Selected category State Hook
  const [category, setCategory] = React.useState({
    name: "head",
    sideIndicator: false,
  });
  // 3D Model Content State Hooks ( Scene, Nodes, Materials, Animations e.t.c ) //

  const [model, setModel] = React.useState<object>(Object);

  const [nodes, setNodes] = React.useState<object>(Object);
  const [scene, setScene] = React.useState<object>(Object);
  const [materials, setMaterials] = React.useState<object>(Object);
  const [animations, setAnimations] = React.useState<object>(Object);
  // States Hooks used in template editor //
  const [templateInfo, setTemplateInfo] = React.useState<object>();
  const [randomize, setRandomize] = React.useState<boolean>(false);

  return (
    <Route
      {...rest}
      render={(props) => {
        return (
          <GlobalContext.Provider
            value={{
              // ----- General Use State Hooks ------ //
              generator,
              setGenerator,
              navigation,
              setNavigation,
              modelLoaded,
              setModelLoaded,
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
              // ----- Template State Hooks ----- //
              templateInfo,
              setTemplateInfo,
              randomize,
              setRandomize,
            }}
          >
            <Component {...props} />
          </GlobalContext.Provider>
        );
      }}
    />
  );
};
export const useGlobalState = () => React.useContext(GlobalContext);
