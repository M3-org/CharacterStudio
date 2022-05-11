import * as React from "react";
import * as THREE from "three";

export function BaseModel(props: any) {
  const { nodes, scene }: any = props;
  const models =
    nodes &&
    Object.keys(nodes).map((keyName, i) => {
      if (nodes[keyName]) {
        return (
          <mesh
            key={i}
            geometry={nodes[keyName]?.geometry}
            position={nodes[keyName]?.position}
          >
            <meshPhysicalMaterial map={nodes[keyName]?.material?.map} />
            <bufferGeometry attach="geometry" {...nodes[keyName]?.geometry} />
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

export function TemplateModel(props: any) {
  const { scene, nodes }: any = props;
  return (
    <mesh position={[0, 0.02, 0]}>
      <primitive object={scene} />
    </mesh>
  );
}

export function TemplateSnapshotModel(props: any) {
  const { scene }: any = props;
  return (
    <mesh position={[0, 0.02, 0]}>
      <primitive object={scene} />
    </mesh>
  );
}
