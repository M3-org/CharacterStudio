import React from "react";
import { BrowserView, MobileView } from "react-device-detect";
import Typed from "react-typed";
import DownloadCharacter from "../Download";
import MeshSelector from "../Editor";
import "./style.scss";

export default function CharacterEditor() {
  return (
    <div>
      <BrowserView>
        <MeshSelector />
        <DownloadCharacter />
      </BrowserView>
      <MobileView>
        <div className="abs top left smartphone">
          <div className="fullScreenMessage">
            <Typed
              strings={[
                "Sorry, this content is currently unavailable on mobile... ^2000",
                "Come back soon for updates!",
              ]}
              typeSpeed={40}
              showCursor={false}
            />
          </div>
        </div>
      </MobileView>
    </div>
  );
}
