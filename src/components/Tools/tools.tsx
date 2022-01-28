import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { Slider } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Scrollbars } from "react-custom-scrollbars";
import "./style.scss";

import { useGlobalState } from "../GlobalProvider";
import { threeService } from "../../services";
import { XyzPositionSlider } from "./sliders";

import { MeshSelectorRadio } from "./selections";

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
      <Typography color="#FFFFFF">{props.keyName}</Typography>
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
      <Typography color="#FFFFFF">Skin Color</Typography>
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
  const { scene, nodes, templateInfo, randomize }: any = useGlobalState();
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
    <>
      <Scrollbars className="tools-scroll-wrap">
        {shapeKeys && shapeKeys.length > 0 && (
          <React.Fragment>
              {shapeKeys.map((key: any, index) => {
                console.log(key.name);
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
      </Scrollbars>
    </>
  );
}
