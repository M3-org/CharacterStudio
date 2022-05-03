import React, { Suspense } from "react";
import { BrowserView, MobileView } from "react-device-detect";
import { BrowserRouter as Router, Switch } from "react-router-dom";
import "./assets/styles/main.scss";
import AvatarGenerator from "./components/AvatarGenerator";
import { GPRoute } from "./components/GlobalProvider";
// Importing Pages
import Template from "./pages";
import { ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#9c27b0",
    },
  },
});

export default function App() {
  return (
    <Suspense fallback="loading...">
      <BrowserView>
        <ThemeProvider theme={theme}>
          <div className="main-wrap">
            <Router>
              <Switch>
                <GPRoute path="/" exact component={AvatarGenerator} />
                <GPRoute path="/template/:id" exact component={Template} />
                <GPRoute path="/template" exact component={Template} />
              </Switch>
            </Router>
          </div>
        </ThemeProvider>
      </BrowserView>
      <MobileView>
        <div className="abs top left smartphone">
          <div className="fullScreenMessage">
            Sorry, this content is currently unavailable on mobile.
          </div>
        </div>
      </MobileView>
    </Suspense>
  );
}
