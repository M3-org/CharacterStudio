import * as React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

export function BaseModel(props: any) {
  const { nodes, scene }: any = props;
  console.log(nodes);
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
  const { scene, setGL, setCamera }: any = props;
  const { gl , camera} = useThree();
  React.useEffect(()=> {
    setGL(gl);
    setCamera(camera);
  }, [gl, camera])
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
