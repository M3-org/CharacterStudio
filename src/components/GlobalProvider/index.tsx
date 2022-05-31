import * as React from "react";
import { Route } from "react-router-dom";

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
  const [category, setCategory] = React.useState("color");
  // 3D Model Content State Hooks ( Scene, Nodes, Materials, Animations e.t.c ) //

  const [model, setModel] = React.useState<object>(Object);

  const [nodes, setNodes] = React.useState<object>(Object);
  const [scene, setScene] = React.useState<object>(Object);
  const [materials, setMaterials] = React.useState<object>(Object);
  const [animations, setAnimations] = React.useState<object>(Object);
  // States Hooks used in template editor //
  const [templateInfo, setTemplateInfo] = React.useState<object>();
  const [downloadPopup, setDownloadPopup] = React.useState<boolean>(false);
  const [mintPopup, setMintPopup] = React.useState<boolean>(false);

  // MINT INFORMATION HOOKs

  const [template, setTemplate] = React.useState<number>(1);

  const [loadingModelProgress, setLoadingModelProgress] = React.useState<number>(0);

  const [ totalToBeMinted , setTotalToBeMinted ] = React.useState<number>(10000);
  const [ totalMinted , setTotalMinted ] = React.useState<number>(0);

  const [ mintPrice , setMintPrice ] = React.useState<string>("0.05");
  const [ mintPricePublic , setMintPricePublic ] = React.useState<string>("0.069");

  const [ hair , setHair ] = React.useState<any>();
  const [ body , setBody ] = React.useState<any>();
  const [ face , setFace ] = React.useState<any>();
  const [ tops , setTops ] = React.useState<any>();
  const [ arms , setArms ] = React.useState<any>();
  const [ shoes , setShoes ] = React.useState<any>();
  const [ legs , setLegs ] = React.useState<any>();

  return (
    <Route
      {...rest}
      render={(props) => {
        return (
          <GlobalContext.Provider
            value={{
              // ----- Selected Traits Hooks -------- //
              hair,
              setHair,
              body,
              setBody,
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
              downloadPopup,
              setDownloadPopup,
              mintPopup,
              setMintPopup
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
