import * as React from "react";
import "./style.scss";

import { useGlobalState } from "../GlobalProvider";
import { Button } from "@mui/material";
import dice from '../../assets/media/dice.svg'

export default function RandomizeButton(props: any) {
  const { randomize, setRandomize }: any = useGlobalState();
  return (
    <React.Fragment>
    <Button
      onClick={() => !randomize && setRandomize(true)}
      className="randomize-button"
    >
      <img src={dice} alt="randomize" className={randomize && "spin"} />
    </Button>
    </React.Fragment>
  );
}
