import * as React from "react";
import { useGlobalState } from "../GlobalProvider";
import logo from "../../assets/media/logo-dark.png";
import Scene from "../Scene";
import RandomizeButton from "../Randomize";
import { apiService, threeService } from "../../services";
import "./style.scss";
import { NavLink } from "react-router-dom";
import DownloadCharacter from "../Download";
import ConnectMint from "../ConnectMint";
import * as THREE from "three";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { awsService } from "../../services/aws";
import LoadingOverlayCircularStatic from "../LoadingOverlays";

export default function CharacterEditor(props: any) {
  const {
    setScene,
    scene,
    setModel,
    setTemplateInfo,
    templateInfo,
    randomize,
    setRandomize,
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

  React.useEffect(() => {
    if (scene) {
      const loader = new GLTFLoader();
      loader
        .loadAsync("https://nolimitcrypto.s3.us-west-2.amazonaws.com/female_muscular_traits/Female_Muscular_1/Female_Muscular_1_Choker.vrm", (e) => {
          console.log(e.loaded*100/e.total);
        })
        .then((model) => {
          if(scene) {
            console.log(model.scene)
            scene.add( model.scene );
          }
        });
    }
  }, [scene]);

  React.useEffect(() => {
    if (scene?.children && templateInfo?.editor && randomize) {
      console.log("Randomized!!!");
      //threeService.randomizeMeshes(scene, templateInfo).then(() => {
      //setRandomize(false);
      //});
    }
  }, [randomize]);

  return (
    <React.Fragment>
      {loadingModel && <LoadingOverlayCircularStatic />}
      <RandomizeButton />
      <DownloadCharacter />
      <Web3ReactProvider getLibrary={getLibrary}>
        <ConnectMint />
      </Web3ReactProvider>
      <NavLink to="/">
        <img src={logo} alt="" className="logo" />
      </NavLink>
      <Scene editor="generator" wrapClass="generator" />
    </React.Fragment>
  );
}
