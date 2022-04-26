import * as React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.scss';
import AvatarGenerator from "./components/AvatarGenerator";

import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: '#9c27b0',
    }
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
    <div className="App">
      <AvatarGenerator />
    </div>
    </ThemeProvider>
  );
}

export default App;
