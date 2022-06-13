import { createTheme, ThemeProvider } from "@mui/material";
import { VRM, VRMSchema } from "@pixiv/three-vrm";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { Suspense, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import DownloadCharacter from "./Download";
import LoadingOverlayCircularStatic from "./LoadingOverlay";
import { TemplateModel } from "./Models";
import Scene from "./Scene";

export default function CharacterEditor(props: any) {
  const { theme, templates, mintPopup } = props;

  // State Hooks For Character Editor ( Base ) //
  // ---------- //
  // Charecter Name State Hook ( Note: this state will also update the name over the 3D model. )
  const [characterName, setCharacterName] =
    React.useState<string>("Character Name");
  // Categories State and Loaded Hooks
  const [categories, setCategories] = React.useState([]);
  const [categoriesLoaded, setCategoriesLoaded] =
    React.useState<boolean>(false);
  // Selected category State Hook
  const [category, setCategory] = React.useState("color");
  // 3D Model Content State Hooks ( Scene, Nodes, Materials, Animations e.t.c ) //

  const [model, setModel] = React.useState<object>(Object);

  // TODO: Where is setNodes
  const [nodes, setNodes] = React.useState<object>(Object);
  const [scene, setScene] = React.useState<object>(Object);
  // const [materials, setMaterials] = React.useState<object>(Object);
  // const [animations, setAnimations] = React.useState<object>(Object);
  // States Hooks used in template editor //
  const [templateInfo, setTemplateInfo] = React.useState({ file: null, format: null });
  const [downloadPopup, setDownloadPopup] = React.useState<boolean>(false);

  const [template, setTemplate] = React.useState<number>(1);

  const [loadingModelProgress, setLoadingModelProgress] = React.useState<number>(0);

  const [hair, setHair] = React.useState<any>();
  const [body, setBody] = React.useState<any>();
  const [face, setFace] = React.useState<any>();
  const [tops, setTops] = React.useState<any>();
  const [arms, setArms] = React.useState<any>();
  const [shoes, setShoes] = React.useState<any>();
  const [legs, setLegs] = React.useState<any>();

  const [loadingModel, setLoadingModel] = React.useState<boolean>(false);

  const defaultTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#de2a5e",
      },
    },
  });

  React.useEffect(() => {
    if (templateInfo.file && templateInfo.format) {
      setLoadingModel(true);
      const loader = new GLTFLoader();
      loader
        .loadAsync(templateInfo.file, (e) => {
          setLoadingModelProgress(e.loaded * 100 / e.total);
        })
        .then((gltf) => {
          VRM.from(gltf).then((vrm) => {
            vrm.scene.traverse(o => {
              o.frustumCulled = false;
            })
            vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Hips).rotation.y = Math.PI;
            setLoadingModel(false);
            console.log(vrm.scene)
            setScene(vrm.scene);
            setModel(vrm);
          });
        });
    }
  }, [templateInfo.file]);

  return (
    <Suspense fallback="loading...">
      <ThemeProvider theme={theme ?? defaultTheme}>
        {templateInfo &&
          <React.Fragment>
            {loadingModel && <LoadingOverlayCircularStatic loadingModelProgress={loadingModelProgress} />}
            <DownloadCharacter
              scene={scene}
              templateInfo={templateInfo}
              model={model}
              downloadPopup={downloadPopup}
              setDownloadPopup={setDownloadPopup}
            />
            <Scene
              wrapClass="generator"
              templates={templates}
              scene={scene}
              downloadPopup={downloadPopup}
              mintPopup={mintPopup}
              category={category}
              setCategory={setCategory}
              hair={hair}
              setHair={setHair}
              face={face}
              setFace={setFace}
              tops={tops}
              setTops={setTops}
              arms={arms}
              setArms={setArms}
              shoes={shoes}
              setShoes={setShoes}
              legs={legs}
              setLegs={setLegs}
              setTemplate={setTemplate}
              template={template}
              setTemplateInfo={setTemplateInfo}
              templateInfo={templateInfo}
            />
          </React.Fragment>
        }
      </ThemeProvider>
    </Suspense>

  );
}
