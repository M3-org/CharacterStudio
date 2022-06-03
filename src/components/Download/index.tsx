import DownloadIcon from "@mui/icons-material/Download";
import { Modal, Typography } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { TemplateModel } from "../Scene/models";
import { Box } from "@mui/system";
import React from "react";
import "./style.scss";
import { useGlobalState } from "../GlobalProvider";
import { threeService } from "../../services";
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  pt: 2,
  px: 4,
  pb: 3,
};

export default function DownloadCharacter() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { modelNodes, scene, templateInfo, model, downloadPopup, setDownloadPopup }: any = useGlobalState();
  const saveScreenshot = async (id:string) => {
    threeService.saveScreenShotByElementId(id).then(() => {});
  };
  const downloadModel = (format: any) => {
    threeService.download(model, `CC_Model_${templateInfo.name.replace(" ", "_")}`, format, false);
  };
  const handleOpen = () => {
    setDownloadPopup(true);
  };
  const handleClose = () => {
    setDownloadPopup(false);
  };

  return (
    <div className="download-wrap">
      <Button
        id="download-button"
        className="download-button"
        aria-controls="download-menu"
        aria-haspopup="true"
        aria-expanded={downloadPopup ? "true" : undefined}
        onClick={handleOpen}
      >
        <Avatar className="expand-download">
          <DownloadIcon />
        </Avatar>
      </Button>
      <Modal
        open={downloadPopup}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, border: 0 }}>
        <Button onClick={handleClose} className="close-popup"><CloseIcon /></Button>
        <Button onClick={() => downloadModel('vrm')}>Download VRM</Button>
        <Button onClick={() => downloadModel('gltf/glb')}>Download GLB</Button>
          <Button onClick={() => saveScreenshot('screenshot-canvas-wrap')}>Screenshot</Button>
        <div
        id="screenshot-canvas-wrap"
        className={`canvas-wrap`}
        style={{ height: 2080, width: 2080, zoom: 0.2, background: "#111111" }}
      >
        <Canvas
          className="canvas"
          id="screenshot-scene"
          gl={{ preserveDrawingBuffer: true }}
        >
          <spotLight
            // ref={ref}
            intensity={1}
            position={[0, 3.5, 2]}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            castShadow
          />
          <spotLight
            // ref={ref}
            intensity={0.2}
            position={[-5, 2.5, 4]}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            // castShadow
          />
          <spotLight
            // ref={ref}
            intensity={0.2}
            position={[5, 2.5, 4]}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            // castShadow
          />
          <spotLight
            // ref={ref}
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
            {downloadPopup && (
            <TemplateModel nodes={modelNodes} scene={scene} />
            )}
          </PerspectiveCamera>
        </Canvas>
      </div>
        </Box>
      </Modal>
    </div>
  );
}
