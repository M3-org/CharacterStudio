import React, { Suspense } from "react";
import { BrowserView, MobileView } from "react-device-detect";
import {
  BrowserRouter as Router,
  Switch
} from "react-router-dom";
import "./assets/styles/main.scss";
// Importing Route Component with Global Variables
import { GPRoute } from "./components/GlobalProvider";
import CharacterEditor from "./pages/CharacterEditor";
// Importing Pages
import Template from "./pages";


export default function App() {
  return (
    <Suspense fallback="loading...">
      <BrowserView>
        <Router>
          <Switch>

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
  );
}
