import React from 'react';
import ReactDOM from 'react-dom';

import CharacterEditor from "./components";
import {sceneService} from "./services";

import { createTheme } from "@mui/material";

export const defaultTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#de2a5e",
    },
  },
});

export default {
    CharacterEditor,
    sceneService,
    defaultTheme
}