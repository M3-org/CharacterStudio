import React from 'react';
import ReactDOM from 'react-dom';
import CharacterEditor from "./components";
import { createTheme } from "@mui/material";
import defaultTemplates from "./data/base_models.json";

const defaultTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#de2a5e",
    },
  },
});

function ExampleApp() {
  return (
    <CharacterEditor templates={defaultTemplates} theme={defaultTheme} />
  );
}
ReactDOM.render(<ExampleApp />, document.getElementById('root'));

