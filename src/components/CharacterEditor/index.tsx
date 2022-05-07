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

import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

export default function CharacterEditor(props: any) {
  const {
    setScene,
    scene,
    setModel,
    setTemplateInfo,
    templateInfo,
    randomize,
    setRandomize,
  }: any = useGlobalState();

  function getLibrary(provider: any): Web3Provider {
    const library = new Web3Provider(provider)
    library.pollingInterval = 12000
    return library
  }

  React.useEffect(() => {
    apiService
      .fetchTemplate(props?.match?.params?.id ?? "default")
      .then((res) => {
        setTemplateInfo(res);
      });
  }, [props?.match?.params?.id]);

  React.useEffect(() => {
    // console.log("Template Information Response: ", templateInfo);
    if (
      templateInfo?.directory &&
      templateInfo?.file &&
      templateInfo?.format &&
      templateInfo?.editor
    ) {
      threeService
        .loadModel(
          templateInfo?.directory + templateInfo?.file,
          templateInfo?.format
        )
        .then((model: any) => {
          if (model.scene) {
            console.log(model.scene);
            setScene(model.scene);
            setModel(model);
          }
        });
    }
  }, [templateInfo?.file]);

  React.useEffect(() => {
    if (scene?.children && templateInfo?.editor) {
      threeService.randomizeMeshes(scene, templateInfo);
      threeService.randomize(scene, templateInfo);
    }
  }, [scene]);

  React.useEffect(() => {
    if (scene?.children && templateInfo?.editor && randomize) {
      console.log("Randomized!!!");
      threeService.randomizeMeshes(scene, templateInfo).then(() => {
        setRandomize(false);
      });
    }
  }, [randomize]);

  return (
    <React.Fragment>
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
