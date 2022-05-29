import * as React from "react";
import { useGlobalState } from "../GlobalProvider";
import Scene from "../Scene";
import { apiService } from "../../services";
import "./style.scss";
import DownloadCharacter from "../Download";
import ConnectMint from "../ConnectMint";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import LoadingOverlayCircularStatic from "../LoadingOverlays";

export default function CharacterEditor(props: any) {
  const {
    setScene,
    scene,
    setModel,
    setTemplateInfo,
    templateInfo,
    template,
    setLoadingModelProgress
  }: any = useGlobalState();

  const [loadingModel, setLoadingModel] = React.useState<boolean>(false);

  function getLibrary(provider: any): Web3Provider {
    const library = new Web3Provider(provider);
    library.pollingInterval = 12000;
    return library;
  }

  React.useEffect(() => {
    apiService.fetchTemplate(template ?? "default").then((res) => {
      setTemplateInfo(res);
    });
  }, [template]);

  React.useEffect(() => {
    if (templateInfo?.file && templateInfo?.format) {
      setLoadingModel(true);
      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      loader
        .loadAsync(templateInfo?.file, (e) => {
          setLoadingModelProgress(e.loaded*100/e.total);
        })
        .then((model) => {
          model.scene.traverse(o => {
            o.frustumCulled = false;
          })
          setLoadingModel(false);
          console.log(model.scene)
          setScene(model.scene);
          setModel(model);
        });
      /*
      threeService
        .loadModel(
          templateInfo?.file,
          templateInfo?.format
        )
        .then((model: any) => {
          if (model.scene) {
            console.log(model.scene);
            setScene(model.scene);
            setModel(model);
          }
        });
        */
    }
  }, [templateInfo?.file]);

  return (
    <React.Fragment>
      {loadingModel && <LoadingOverlayCircularStatic />}
      {/* <DownloadCharacter /> */}
      <Web3ReactProvider getLibrary={getLibrary}>
        <ConnectMint />
      </Web3ReactProvider>
      <Scene editor="generator" wrapClass="generator" />
    </React.Fragment>
  );
}
