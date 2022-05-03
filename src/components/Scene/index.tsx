/* eslint-disable */
import { Avatar, Button, Typography } from "@mui/material";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as React from "react";
import { threeService } from "../../services";
import { useGlobalState } from "../GlobalProvider";
import { TemplateModel } from "./models";
import "./style.scss";

import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";

export default function Scene(props: any) {
  const { editor, wrapClass }: any = props;
  const { modelNodes, scene, downloadPopup }: any = useGlobalState();
  return (
    <div className="scene-wrap">
      <div
        id="canvas-wrap"
        className={`canvas-wrap ${wrapClass && wrapClass}`}
        style={{ height: window.innerHeight - 89 }}
      >
        <Canvas
          className="canvas"
          id="editor-scene"
        >
          <gridHelper
            args={[50, 25, "#101010", "#101010"]}
            position={[0, 0, 0]}
          />
          <spotLight
            intensity={1}
            position={[0, 3.5, 2]}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            castShadow
          />
          <spotLight
            intensity={0.2}
            position={[-5, 2.5, 4]}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <spotLight
            intensity={0.2}
            position={[5, 2.5, 4]}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <spotLight
            intensity={0.3}
            position={[0, -2, -8]}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            castShadow
          />
          <OrbitControls
            minDistance={1}
            maxDistance={2}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2 - 0.1}
            enablePan={false}
            target={[0, 1, 0]}
          />
          <PerspectiveCamera>
          {!downloadPopup && (
            <TemplateModel nodes={modelNodes} scene={scene} />
          )}
          </PerspectiveCamera>
        </Canvas>
      </div>
      <div className="editor-wrap">
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          <div className="selector-button">
            <Avatar className="icon" />
            <br />
            Skin Tone
          </div>
          <div className="selector-button">
            <Avatar className="icon" />
            <br />
            Hair
          </div>
          <div className="selector-button">
            <Avatar className="icon" />
            <br />
            Face
          </div>
          <div className="selector-button">
            <Avatar className="icon" />
            <br />
            Tops
          </div>
          <div className="selector-button">
            <Avatar className="icon" />
            <br />
            Arms
          </div>
          <div className="selector-button">
            <Avatar className="icon" />
            <br />
            Neck
          </div>
          <div className="selector-button">
            <Avatar className="icon" />
            <br />
            Bottoms
          </div>
          <div className="selector-button">
            <Avatar className="icon" />
            <br />
            Shoes
          </div>
          <div className="selector-button">
            <Avatar className="icon" />
            <br />
            Legs
          </div>
          <div className="selector-button">
            <Avatar className="icon" />
            <br />
            Accessories
          </div>
        </Stack>
      </div>
    </div>
  );
}
