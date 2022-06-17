import { createTheme, ThemeProvider } from "@mui/material"
import { VRM, VRMSchema } from "@pixiv/three-vrm"
import React, { Suspense, useState, useEffect, Fragment } from "react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import DownloadCharacter from "./Download"
import LoadingOverlayCircularStatic from "./LoadingOverlay"
import Scene from "./Scene"

export default function CharacterEditor(props: any) {
  // State Hooks For Character Editor ( Base ) //
  // ---------- //
  // Charecter Name State Hook ( Note: this state will also update the name over the 3D model. )
  // const [characterName, setCharacterName] =
  //   useState<string>("Character Name");
  // Categories State and Loaded Hooks
  // const [categories, setCategories] = useState([]);
  // const [categoriesLoaded, setCategoriesLoaded] =
  //   useState<boolean>(false);
  // TODO: Where is setNodes
  // const [nodes, setNodes] = useState<object>(Object);
  // const [materials, setMaterials] = useState<object>(Object);
  // const [animations, setAnimations] = useState<object>(Object);
  // const [body, setBody] = useState<any>();

  const { theme, templates, mintPopup } = props
  // Selected category State Hook
  const [category, setCategory] = useState("color")
  // 3D Model Content State Hooks ( Scene, Nodes, Materials, Animations e.t.c ) //
  const [model, setModel] = useState<object>(Object)

  const [scene, setScene] = useState<object>(Object)
  // States Hooks used in template editor //
  const [templateInfo, setTemplateInfo] = useState({ file: null, format: null })

  const [downloadPopup, setDownloadPopup] = useState<boolean>(false)
  const [template, setTemplate] = useState<number>(1)
  const [loadingModelProgress, setLoadingModelProgress] = useState<number>(0)
  const [hair, setHair] = useState<any>()
  const [face, setFace] = useState<any>()
  const [tops, setTops] = useState<any>()
  const [arms, setArms] = useState<any>()
  const [shoes, setShoes] = useState<any>()
  const [legs, setLegs] = useState<any>()

  const [loadingModel, setLoadingModel] = useState<boolean>(false)

  const defaultTheme = createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: "#de2a5e",
      },
    },
  })

  useEffect(() => {
    if (templateInfo.file && templateInfo.format) {
      setLoadingModel(true)
      const loader = new GLTFLoader()
      loader
        .loadAsync(templateInfo.file, (e) => {
          setLoadingModelProgress((e.loaded * 100) / e.total)
        })
        .then((gltf) => {
          VRM.from(gltf).then((vrm) => {
            vrm.scene.traverse((o) => {
              o.frustumCulled = false
            })
            vrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Hips,
            ).rotation.y = Math.PI
            setLoadingModel(false)
            setScene(vrm.scene)
            setModel(vrm)
          })
        })
    }
  }, [templateInfo.file])

  return (
    <Suspense fallback="loading...">
      <ThemeProvider theme={theme ?? defaultTheme}>
        {templateInfo && (
          <Fragment>
            {loadingModel && (
              <LoadingOverlayCircularStatic
                loadingModelProgress={loadingModelProgress}
              />
            )}
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
          </Fragment>
        )}
      </ThemeProvider>
    </Suspense>
  )
}
