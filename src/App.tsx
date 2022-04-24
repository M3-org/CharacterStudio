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
  );
}
