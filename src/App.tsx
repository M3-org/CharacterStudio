import CharacterEditor from "./components";
import { createTheme } from "@mui/material";
import defaultTemplates from "./data/base_models";

import React from 'react';
import * as ReactDOMClient from 'react-dom/client';

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

const container = document.getElementById('root');
const root = ReactDOMClient.createRoot(container);
root.render(<App />);
