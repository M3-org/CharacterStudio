import React from 'react';
import ReactDOM from 'react-dom';

import CharacterEditor from "./components";
import {sceneService} from "./services";

import { createTheme } from "@mui/material";

const defaultTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#de2a5e",
    },
  },
});

export {
    CharacterEditor,
    sceneService,
    defaultTheme
}