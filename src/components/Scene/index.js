import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useGlobalState } from "../GlobalProvider";
import { TemplateModel } from "./models";
import "./style.scss";
import Editor from "./editor";
import Selector from "./selector";
export default function Scene(props) {
    const { editor, wrapClass } = props;
    const { modelNodes, scene, downloadPopup, mintPopup } = useGlobalState();
    return (_jsxs("div", { className: "scene-wrap", children: [_jsx("div", { id: "canvas-wrap", className: `canvas-wrap ${wrapClass && wrapClass}`, style: { height: window.innerHeight - 89 }, children: _jsxs(Canvas, { className: "canvas", id: "editor-scene", children: [_jsx("gridHelper", { args: [50, 25, "#101010", "#101010"], position: [0, 0, 0] }), _jsx("spotLight", { intensity: 1, position: [0, 3.5, 2], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048, castShadow: true }), _jsx("spotLight", { intensity: 0.2, position: [-5, 2.5, 4], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048 }), _jsx("spotLight", { intensity: 0.2, position: [5, 2.5, 4], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048 }), _jsx("spotLight", { intensity: 0.3, position: [0, -2, -8], "shadow-mapSize-width": 2048, "shadow-mapSize-height": 2048, castShadow: true }), _jsx(OrbitControls, { minDistance: 1, maxDistance: 2, minPolarAngle: 0, maxPolarAngle: Math.PI / 2 - 0.1, enablePan: false, target: [0, 1, 0] }), _jsx(PerspectiveCamera, { children: !downloadPopup && !mintPopup && (_jsx(TemplateModel, { nodes: modelNodes, scene: scene })) })] }) }), _jsxs("div", { children: [_jsx(Selector, {}), _jsx(Editor, {})] })] }));
}
