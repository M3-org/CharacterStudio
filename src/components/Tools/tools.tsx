import { Slider } from "@mui/material";
import * as React from "react";
import { Scrollbars } from "react-custom-scrollbars";
import { threeService } from "../../services";
import { useGlobalState } from "../GlobalProvider";
import { MeshSelectorRadio } from "./selections";
import { XyzPositionSlider } from "./sliders";
import "./style.scss";

function ChangeMorphValueSlider(props: any) {
  const { scene, randomize }: any = useGlobalState();
  const [currValue, setCurrValue] = React.useState();
  const updateMorphValue = (value: any) => {
    threeService
      .updateMorphValue(props.keyName, value, scene, props.targets)
      .then(() => {
        setCurrValue(value);
      });
  };

  React.useEffect(() => {
    if (props.keyName && props.targets && scene) {
      threeService
        .getMorphValue(props.keyName, scene, props.targets[0])
        .then((res) => {
          console.log(res);
          setCurrValue(res);
        });
    }
  }, [props.targets && props.keyName && scene && randomize]);
  return (
    <>
      <span color="#FFFFFF">{props.keyName}</span>
      {currValue && (
        <Slider
          className="slider"
          size="small"
          value={currValue}
          min={0.1}
          max={1}
          step={0.05}
          onChange={(e: any) => {
            updateMorphValue(e.target.value);
          }}
        />
      )}
    </>
  );
}

function ChangeColorValueSlider(props: any) {
  const { scene, randomize }: any = useGlobalState();
  const [currValue, setCurrValue] = React.useState(30);
  const updateMorphValue = (value: any) => {
    threeService
      .setMaterialColor(scene, value, "model")
      .then(() => {
        setCurrValue(value);
      });
  };
  return (
    <>
      <span color="#FFFFFF">Skin Color</span>
      {currValue && (
        <Slider
          className="slider"
          size="small"
          value={currValue}
          min={30}
          max={255}
          step={5}
          onChange={(e: any) => {
            updateMorphValue(e.target.value);
          }}
        />
      )}
    </>
  );
}

export function TemplateEditorTools(props: any) {
  const { scene, nodes, templateInfo }: any = useGlobalState();
  const [shapeKeys, setShapeKeys] = React.useState<any>();
  const [shapeTargets, setShapeTargets] = React.useState<any>();
  const [meshes, setMeshes] = React.useState<any>();
  const [poses, setposes] = React.useState<any>();
  const [textures, setTextures] = React.useState<any>();
  const [shapeKeyDefaultValues, setShapeKeyDefaultValues] =
    React.useState<any>();

  const { category } = props;
  React.useEffect(() => {
    if (templateInfo?.editor?.morphs && category) {
      const shapes = templateInfo?.editor?.morphs.filter(
        (morph) => morph.mesh === category
      )[0];
      if (shapes?.keys) {
        setShapeKeys(shapes.keys);
        setShapeTargets(shapes.targets);
      }
    }
  }, [templateInfo?.editor?.shapes && category && scene]);

  React.useEffect(() => {
    if (templateInfo?.editor?.textures && category) {
      const array = templateInfo?.editor?.textures.filter(
        (texture) => texture.category === category
      );
      if (array) {
        setTextures(array);
      }
    }
  }, [templateInfo?.editor?.textures]);

  React.useEffect(() => {
    if (templateInfo?.editor?.meshes && category) {
      const array = templateInfo?.editor?.meshes.filter(
        (mesh) => mesh.category === category
      );
      if (array) {
        setMeshes(array);
      }
    }
  }, [templateInfo?.editor?.meshes]);

  const onMeshChange = (object) => {
    console.log(object.taget.value);
  };

  return (
    <React.Fragment>
        {shapeKeys && shapeKeys.length > 0 && (
          <React.Fragment>
              {shapeKeys.map((key: any, index) => {
                return (
                  <ChangeMorphValueSlider
                    key={index}
                    keyName={key.name}
                    targets={shapeTargets}
                  />
                );
              })}
            </React.Fragment>
        )}
        {console.log(meshes)}
        {meshes && scene && meshes.length > 0 && (
          <React.Fragment>
              {meshes.map((mesh: any, index) => {
                return <MeshSelectorRadio meshes={mesh} key={index} index={index} />;
              })}
            </React.Fragment>
        )}

{textures && scene && textures.length > 0 && (
              <ChangeColorValueSlider />
        )}

        {poses && scene && poses.length > 0 && (
              <Scrollbars className="scroll">
                {nodes &&
                  Object.keys(nodes).map((keyName, i) => {
                    if (nodes[keyName].type === "Bone") {
                      return (
                        <XyzPositionSlider
                          position={nodes[keyName]?.position}
                          name={nodes[keyName]?.name}
                          key={i}
                        />
                      );
                    }
                  })}
              </Scrollbars>
        )}
    </React.Fragment>
  );
}
