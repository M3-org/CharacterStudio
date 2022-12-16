import * as React from "react";

export function BaseModel(props) {
  const { nodes, scene } = props;
  const models =
    nodes &&
    Object.keys(nodes).map((keyName, i) => {
      if (nodes[keyName]) {
        return (
          <mesh
            key={i}
            geometry={nodes[keyName].geometry}
            position={nodes[keyName].position}
          >
            <meshPhysicalMaterial map={nodes[keyName].material && nodes[keyName].material.map} />
            <bufferGeometry attach="geometry" {...(nodes[keyName] && nodes[keyName].geometry)} />
          </mesh>
        );
      } else {
        return null;
      }
    });

  return (
    <mesh position={[0, 0, 0]}>
      <primitive object={scene} />
    </mesh>
  );
}

export function TemplateModel(props) {
  const { scene } = props;
  return (
    <mesh>
      <primitive object={scene} />
    </mesh>
  );
}

export function TemplateSnapshotModel(props) {
  const { scene } = props;
  return (
    <mesh position={[0, 0.02, 0]}>
      <primitive object={scene} />
    </mesh>
  );
}
