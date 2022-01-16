import * as React from "react";
import { NavLink } from "react-router-dom";
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ParticlesBg from 'particles-bg';
import "./style.scss";
import { useGlobalState } from "../../components/GlobalProvider";
export default function Start() {
  const {
    setGenerator
  }: any = useGlobalState();
  React.useEffect(() => {
    setGenerator(0);
  }, []);
  return (
    <React.Fragment>
      <div className="start-wrap">
      <ParticlesBg num={200} type="cobweb" color="#003b63" bg={true} />
        <div className="screen">
          <div className="content vh-centered">
            <Typography variant="h6">Base</Typography>
            <Typography>Start From Scratch<br />( Under Development )</Typography>
            <NavLink to="/"><Button variant="outlined">Start</Button></NavLink>
          </div>
        </div>
        <div className="screen">
          <div className="content vh-centered">
            <Typography variant="h6">Template</Typography>
            <Typography>Choose Premade Avatar</Typography>
            <NavLink to="/template"><Button variant="outlined">Start</Button></NavLink>
          </div>
        </div>
        <div className="screen">
          <div className="content vh-centered">
            <Typography variant="h6">Custom</Typography>
            <Typography>Import Existing Avatar<br />( Under Development )</Typography>
            <NavLink to="/"><Button variant="outlined">Start</Button></NavLink>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
