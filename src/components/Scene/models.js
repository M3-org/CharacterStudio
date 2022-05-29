import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function BaseModel(props) {
    const { nodes, scene } = props;
    const models = nodes &&
        Object.keys(nodes).map((keyName, i) => {
            if (nodes[keyName]) {
                return (_jsxs("mesh", { geometry: nodes[keyName]?.geometry, position: nodes[keyName]?.position, children: [_jsx("meshPhysicalMaterial", { map: nodes[keyName]?.material?.map }), _jsx("bufferGeometry", { attach: "geometry", ...nodes[keyName]?.geometry })] }, i));
            }
            else {
                return null;
            }
        });
    return (_jsx("mesh", { position: [0, 0, 0], children: _jsx("primitive", { object: scene }) }));
}
export function TemplateModel(props) {
    const { scene, nodes } = props;
    return (_jsx("mesh", { position: [0, 0.02, 0], children: _jsx("primitive", { object: scene }) }));
}
export function TemplateSnapshotModel(props) {
    const { scene } = props;
    return (_jsx("mesh", { position: [0, 0.02, 0], children: _jsx("primitive", { object: scene }) }));
}
