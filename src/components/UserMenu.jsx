import React, { Fragment, useContext, useEffect, useState } from "react"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter"
import { SceneContext } from "../context/SceneContext"
import { ViewStates, ViewContext } from "../context/ViewContext"
import { combine } from "../library/merge-geometry"
import VRMExporter from "../library/VRMExporter"
import { AccountContext } from "../context/AccountContext"

import styles from "./UserMenu.module.css"

export const UserMenu = ({template}) => {
  const type = "CHANGEME" // class type

  const [showDownloadOptions, setShowDownloadOptions] = useState(false)
  const { ensName, connected, walletAddress } = useContext(AccountContext)

  const { avatar, scene, skinColor, model } = useContext(SceneContext)

  const {currentView, setCurrentView} = useContext(ViewContext)

  const [mintStatus, setMintStatus] = useState("")

  const handleDownload = () => {
    showDownloadOptions ? setShowDownloadOptions(false) : setShowDownloadOptions(true)
  }

  async function download(
    avatarToDownload,
    fileName,
    format,
    atlasSize = 4096
  ) {
    // We can use the SaveAs() from file-saver, but as I reviewed a few solutions for saving files,
    // this approach is more cross browser/version tested then the other solutions and doesn't require a plugin.
    const link = document.createElement("a");
    link.style.display = "none";
    document.body.appendChild(link);
    function save(blob, filename) {
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }

    function saveString(text, filename) {
      save(new Blob([text], { type: "text/plain" }), filename);
    }

    function saveArrayBuffer(buffer, filename) {
      save(getArrayBuffer(buffer), filename);
    }
    // Specifying the name of the downloadable model
    const downloadFileName = `${fileName && fileName !== "" ? fileName : "AvatarCreatorModel"}`;
      
    const avatarToCombine = avatarToDownload.scene.clone();

    const exporter = format === "glb" ? new GLTFExporter() : new VRMExporter();
    const avatar = await combine({ transparentColor: skinColor, avatar: avatarToCombine, atlasSize });
    if (format === "glb") {
      exporter.parse(avatar, (result) => {
          if (result instanceof ArrayBuffer) {
            saveArrayBuffer(result, `${downloadFileName}.glb`);
          } else {
            const output = JSON.stringify(result, null, 2);
            saveString(output, `${downloadFileName}.gltf`);
          }
        },
        (error) => { console.error("Error parsing", error) },
        {
          trs: false,
          onlyVisible: false,
          truncateDrawRange: true,
          binary: true,
          forcePowerOfTwoTextures: false,
          maxTextureSize: 1024 || Infinity
        }
      );
    } else {
      avatarToDownload.materials = [avatar.userData.atlasMaterial];
      exporter.parse(avatarToDownload, avatar, (vrm) => {
        saveArrayBuffer(vrm, `${downloadFileName}.vrm`);
      });
    }
  }

  function getArrayBuffer(buffer) { return new Blob([buffer], { type: "application/octet-stream" }); }

  return (
    <div className={styles['TopRightMenu']}>
    {currentView.includes('CREATOR') && (
      <Fragment>
        {showDownloadOptions && (
          <Fragment>
            <div className={styles['TextButton']}
              onClick={() => {
                download(model, `UpstreetAvatar_${type}`, "vrm")
              }
              }
            >
              <span>VRM</span>
            </div>
            <div className={styles['TextButton']}
              onClick={() => {
                download(model, `UpstreetAvatar_${type}`, "glb")
              }
              }
            >
              <span>GLB</span>
            </div>
          </Fragment>
        )}
        <div className={styles['DownloadButton']} onClick={handleDownload} />
        <div className={styles['MintButton']}
          onClick={() => {
            setCurrentView(ViewStates.MINT)
          }}
        />
      </Fragment>
    )}
      <div className={styles['WalletButton']}
      >
        {connected ? (
          <div className={styles['WalletInfo']} ens={ensName}>
            {ensName ? ensName : walletAddress ? walletAddress.slice(0, 15) + "..." : ""}
          </div>
        ) : (
          ""
        )}
        <div className={styles['WalletImg']} />
      </div>
    </div>
  )
}
