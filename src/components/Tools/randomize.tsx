import * as React from "react";
import "./style.scss";

import { useGlobalState } from "../GlobalProvider";
import { Button } from "@mui/material";

export default function RandomizeButton(props: any) {
  const { randomize, setRandomize }: any = useGlobalState();
  return (
    <Button
      onClick={() => !randomize && setRandomize(true)}
      className="randomize-button"
      variant="outlined"
    >
      Randomize
    </Button>
  );
}
