import * as React from "react";
import { useGlobalState } from "../components/GlobalProvider";
import logo from "../assets/media/logo-dark.png";
import Scene from "../components/Scene";
import RandomizeButton from "../components/Randomize";
import { apiService, threeService } from "../services";
import "./style.scss";
import { NavLink } from "react-router-dom";
import DownloadCharacter from "../components/Download";
import ConnectMint from "../components/ConnectMint";

export default function Template(props: any) {
  const {
    setScene,
    scene,
    setModel,
    setTemplateInfo,
    templateInfo,
    randomize,
    setRandomize,
  }: any = useGlobalState();
  React.useEffect(() => {
    apiService
      .fetchTemplate(props?.match?.params?.id ?? "default")
      .then((res) => {
        setTemplateInfo(res);
      });
  }, [props.match.params.id]);

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
      <ConnectMint />
      <NavLink to="/">
        <img src={logo} alt="" className="logo" />
      </NavLink>
      <Scene editor="generator" wrapClass="generator" />
    </React.Fragment>
  );
}
