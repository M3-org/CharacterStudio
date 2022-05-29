import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    position: 'absolute',
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
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const { modelNodes, scene, downloadPopup, setDownloadPopup } = useGlobalState();
    const saveScreenshot = async (id) => {
        threeService.saveScreenShotByElementId(id).then(() => { });
    };
    const handleOpen = () => {
        setDownloadPopup(true);
    };
    const handleClose = () => {
        setDownloadPopup(false);
    };
    return (_jsxs("div", { className: "download-wrap", children: [_jsx(Button, { id: "download-button", className: "download-button", "aria-controls": "download-menu", "aria-haspopup": "true", "aria-expanded": downloadPopup ? "true" : undefined, onClick: handleOpen, children: _jsx(Avatar, { className: "expand-download", children: _jsx(DownloadIcon, {}) }) }), _jsx(Modal, { open: downloadPopup, onClose: handleClose, "aria-labelledby": "child-modal-title", "aria-describedby": "child-modal-description", children: _jsxs(Box, { sx: { ...style, border: 0 }, children: [_jsx(Button, { onClick: handleClose, className: "close-popup", children: _jsx(CloseIcon, {}) }), _jsx(Typography, { children: "Download" }), _jsx(Button, { onClick: () => saveScreenshot('screenshot-canvas-wrap'), children: "Screenshot" }), _jsx("div", { id: "screenshot-canvas-wrap", className: `canvas-wrap`, style: { height: 2080, width: 2080, zoom: 0.2, background: "#111111" }, children: _jsxs(Canvas, { className: "canvas", id: "screenshot-scene", gl: { preserveDrawingBuffer: true }, children: [_jsx("spotLight", { 
                                        // ref={ref}
                                        intensity: 1, position: [0, 3.5, 2], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048, castShadow: true }), _jsx("spotLight", { 
                                        // ref={ref}
                                        intensity: 0.2, position: [-5, 2.5, 4], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048 }), _jsx("spotLight", { 
                                        // ref={ref}
                                        intensity: 0.2, position: [5, 2.5, 4], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048 }), _jsx("spotLight", { 
                                        // ref={ref}
                                        intensity: 0.3, position: [0, -2, -8], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048, castShadow: true }), _jsx(OrbitControls, { minDistance: 1, maxDistance: 2, minPolarAngle: 0, maxPolarAngle: Math.PI / 2 - 0.1, enablePan: false, target: [0, 1, 0] }), _jsx(PerspectiveCamera, { children: downloadPopup && (_jsx(TemplateModel, { nodes: modelNodes, scene: scene })) })] }) })] }) })] }));
}
