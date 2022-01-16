import * as React from "react";
import { Button } from "@mui/material";
import { threeService } from "../../actions/services";
import { useGlobalState } from "../GlobalProvider";
import "./style.scss";
import { SnapshotScene } from "../Scene";

export function DownloadTools() {
  const { scene, model, templateInfo }: any = useGlobalState();
  const downloadModel = (format: any) => {
    threeService.download(model, `CC_Model_${templateInfo.name.replace(" ", "_")}`, format, false);
  };
  return (
    <div>
      <Button
        onClick={() => downloadModel("gltf/glb")}
        variant="outlined"
        className="download-button"
      >
        Download GLTF/GLB
      </Button>
      <Button
        onClick={() => downloadModel("obj")}
        variant="outlined"
        className="download-button"
      >
        Download OBJ
      </Button>
      <Button
        onClick={() => downloadModel("vrm")}
        variant="outlined"
        className="download-button"
      >
        Download VRM
      </Button>
    </div>
  );
}
