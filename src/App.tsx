<<<<<<< HEAD
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
=======
import React, { Suspense } from "react";
import { MoralisProvider } from "react-moralis";
import { BrowserView, MobileView } from "react-device-detect";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import "./assets/styles/main.scss";
import { GPRoute } from "./components/GlobalProvider";
// Importing Pages
import Template from "./pages";
import Minter from "./pages/Minter";

export default function App() {
  return (
    <MoralisProvider
      appId={import.meta.env.VITE_PUBLIC_APP_ID}
      serverUrl={import.meta.env.VITE_PUBLIC_SERVER_URL}
    >
      <Suspense fallback="loading...">
        <BrowserView>
          <Router>
            <Switch>
              <GPRoute path="/mint" exact component={Minter} />
              <GPRoute path="/:id" exact component={Template} />
              <GPRoute path="/" exact component={Template} />
            </Switch>
          </Router>
        </BrowserView>
        <MobileView>
          <div className="abs top left smartphone">
            <div className="fullScreenMessage">
              Sorry, this content is currently unavailable on mobile.
            </div>
          </div>
        </MobileView>
      </Suspense>
    </MoralisProvider>
>>>>>>> cbba44eb5d0b005016adf73726b90de4037de768
  );
}

export default App;
