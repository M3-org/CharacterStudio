import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useGlobalState } from "../GlobalProvider";
import "./style.scss";

export function XyzPositionSlider(props: any) {
  const { position, name } = props;
  const { scene }: any = useGlobalState();
  const [valueX, setValueX] = React.useState<number>(position && position.x);
  const [valueY, setValueY] = React.useState<number>(position && position.y);
  const [valueZ, setValueZ] = React.useState<number>(position && position.z);
  const handleChange = (value: any, axis: any) => {
    switch (axis) {
      case "x":
        setValueX(value);
        break;
      case "y":
        setValueY(value);
        break;
      case "z":
        setValueZ(value);
        break;
      default:
    }
    //threeService.changeBonePosition(name, value, axis, scene);
  };
  return (
    <div className="xyz-slider-wrap">
      <Typography variant="h6" className="title">
        {name}
      </Typography>
      <div>
        <Slider
          size="small"
          className="slider"
          value={valueX}
          min={-10}
          max={10}
          step={0.001}
          onChange={(e: any) => {
            handleChange(e.target.value, "x");
          }}
        />
        <input
          value={valueX}
          className="input"
          type="number"
          min={-10}
          max={10}
          step={0.001}
          onChange={(e: any) => {
            handleChange(e.target.value, "x");
          }}
        />
      </div>
      <div>
        <Slider
          size="small"
          className="slider"
          value={valueY}
          min={-10}
          max={10}
          step={0.001}
          onChange={(e: any) => {
            handleChange(e.target.value, "y");
          }}
        />
        <input
          value={valueY}
          className="input"
          type="number"
          min={-10}
          max={10}
          step={0.001}
          onChange={(e: any) => {
            handleChange(e.target.value, "y");
          }}
        />
      </div>
      <div>
        <Slider
          size="small"
          className="slider"
          value={valueZ}
          min={-10}
          max={10}
          step={0.001}
          onChange={(e: any) => {
            handleChange(e.target.value, "z");
          }}
        />
        <input
          value={valueZ}
          className="input"
          type="number"
          min={-10}
          max={10}
          step={0.001}
          onChange={(e: any) => {
            handleChange(e.target.value, "z");
          }}
        />
      </div>
    </div>
  );
}


export function SingleSlider(props: any) {
  const { position, name } = props;
  const { scene }: any = useGlobalState();
  const [value, setValue] = React.useState<number>(position && position.x);
  const handleChange = (value: any, axis: any) => {
    setValue(value);
    //threeService.changeBonePosition(name, value, axis, scene);
  };
  return (
    <div className="single-slider-wrap">
      <Typography variant="h6" className="title">
        {name}
      </Typography>
      <div>
        <Slider
          size="small"
          className="slider"
          value={value}
          min={-10}
          max={10}
          step={0.001}
          onChange={(e: any) => {
            handleChange(e.target.value, "x");
          }}
        />
        <input
          value={value}
          className="input"
          type="number"
          min={-10}
          max={10}
          step={0.001}
          onChange={(e: any) => {
            handleChange(e.target.value, "x");
          }}
        />
      </div>
    </div>
  );
}
