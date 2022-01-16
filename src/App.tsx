import React, { Suspense } from "react";
import { BrowserView, MobileView } from "react-device-detect";
import {
  BrowserRouter as Router,
  Switch
} from "react-router-dom";
import "./assets/styles/main.scss";
// Importing Route Component with Global Variables
import { GPRoute } from "./components/GlobalProvider";
import Navigation from "./components/Navigation";
import Base from "./pages/Base";
import CharacterEditor from "./pages/CharacterEditor";
import Custom from "./pages/Custom";
// Importing Pages
import Start from "./pages/Start";
import Template from "./pages/Template";
import TemplateList from "./pages/Template/list";




export default function App() {
  return (
    <Suspense fallback="loading...">
      <BrowserView>
        <Navigation />
        <Router>
          <Switch>

            <GPRoute path="/" exact component={Start} />
            <GPRoute path="/base" exact component={Base} />
            <GPRoute path="/template" exact component={TemplateList} />
            <GPRoute path="/template/:id" exact component={Template} />
            <GPRoute path="/custom" exact component={Custom} />
            <GPRoute path="/character-editor" exact component={CharacterEditor} />

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
