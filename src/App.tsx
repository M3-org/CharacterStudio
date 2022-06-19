import CharacterEditor from "./components";
import { createTheme } from "@mui/material";
import defaultTemplates from "./data/base_models";

import React from 'react';
import ReactDOM from 'react-dom';


const defaultTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#de2a5e",
    },
  },
});

function App() {
  return (
    <CharacterEditor templates={defaultTemplates} theme={defaultTheme} />
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)