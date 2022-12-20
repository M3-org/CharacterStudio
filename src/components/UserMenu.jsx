import React, { Fragment, useContext, useEffect, useState } from "react"
import { useWeb3React } from "@web3-react/core"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter"
import { SceneContext } from "../context/SceneContext"
import { ViewStates, ViewContext } from "../context/ViewContext"
import { combine } from "../library/merge-geometry"
import VRMExporter from "../library/VRMExporter"
import { AccountContext } from "../context/AccountContext"
import CustomButton from "./custom-button"
import classnames from "classnames"

import styles from "./UserMenu.module.css"

export const UserMenu = ({ template }) => {
  const type = "CHANGEME" // class type

  const [showDownloadOptions, setShowDownloadOptions] = useState(false)
  const { ensName, connected, walletAddress } = useContext(AccountContext)
  const { activate, deactivate, library, account } = useWeb3React()

  const { avatar, scene, skinColor, model } = useContext(SceneContext)

  const { currentView, setCurrentView } = useContext(ViewContext)

  const [mintStatus, setMintStatus] = useState("")

  const handleDownload = () => {
    showDownloadOptions
      ? setShowDownloadOptions(false)
      : setShowDownloadOptions(true)
  }

  async function download(
    avatarToDownload,
    fileName,
    format,
    atlasSize = 4096,
  ) {
    // We can use the SaveAs() from file-saver, but as I reviewed a few solutions for saving files,
    // this approach is more cross browser/version tested then the other solutions and doesn't require a plugin.
    const link = document.createElement("a")
    link.style.display = "none"
    document.body.appendChild(link)
    function save(blob, filename) {
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
    }

    function saveString(text, filename) {
      save(new Blob([text], { type: "text/plain" }), filename)
    }

    function saveArrayBuffer(buffer, filename) {
      save(getArrayBuffer(buffer), filename)
    }
    // Specifying the name of the downloadable model
    const downloadFileName = `${
      fileName && fileName !== "" ? fileName : "AvatarCreatorModel"
    }`

    const avatarToCombine = avatarToDownload.scene.clone()

    const exporter = format === "glb" ? new GLTFExporter() : new VRMExporter()
    const avatar = await combine({
      transparentColor: skinColor,
      avatar: avatarToCombine,
      atlasSize,
    })
    if (format === "glb") {
      exporter.parse(
        avatar,
        (result) => {
          if (result instanceof ArrayBuffer) {
            saveArrayBuffer(result, `${downloadFileName}.glb`)
          } else {
            const output = JSON.stringify(result, null, 2)
            saveString(output, `${downloadFileName}.gltf`)
          }
        },
        (error) => {
          console.error("Error parsing", error)
        },
        {
          trs: false,
          onlyVisible: false,
          truncateDrawRange: true,
          binary: true,
          forcePowerOfTwoTextures: false,
          maxTextureSize: 1024 || Infinity,
        },
      )
    } else {
      avatarToDownload.materials = [avatar.userData.atlasMaterial]
      exporter.parse(avatarToDownload, avatar, (vrm) => {
        saveArrayBuffer(vrm, `${downloadFileName}.vrm`)
      })
    }
  }

  function getArrayBuffer(buffer) {
    return new Blob([buffer], { type: "application/octet-stream" })
  }

  const disconnectWallet = async () => {
    try {
      deactivate()
      setConnected(false)
    } catch (ex) {
      console.log(ex)
    }
  }

  const connectWallet = async () => {
    try {
      await activate(injected)
      setMintStatus("Your wallet has been connected.")
    } catch (ex) {
      console.log(ex)
    }
  }

  return (
    <div className={classnames(styles.userBoxWrap)}>
      <div className={styles.leftCorner} />
      <div className={styles.rightCorner} />
      <ul>
        {currentView.includes("CREATOR") && (
          <React.Fragment>
            <li>
              <CustomButton
                type="icon"
                theme="light"
                icon={showDownloadOptions ? "close" : "download" }
                size={32}
                onClick={handleDownload}
              />
              {showDownloadOptions && (
                <div className={styles.dropDown}>
                  <CustomButton
                    theme="light"
                    text="Download GLB"
                    icon="download"
                    size={14}
                    onClick={() => {
                      download(model, `UpstreetAvatar_${type}`, "glb")
                    }}
                  />
                  <CustomButton
                    theme="light"
                    text="Download VRM"
                    icon="download"
                    size={14}
                    onClick={() => {
                      download(model, `UpstreetAvatar_${type}`, "vrm")
                    }}
                  />
                </div>
              )}
            </li>
            <li>
              <CustomButton
                type="icon"
                theme="light"
                icon="mint"
                size={32}
                onClick={() => {
                  setCurrentView(ViewStates.MINT)
                }}
              />
            </li>
          </React.Fragment>
        )}
        {connected ? (
          <React.Fragment>
            <li>
              <div className={styles.profileImage}>
                <div className={styles.image}>
                  <img
                    src={"/assets/profile-no-image.png"}
                    crossOrigin="Anonymous"
                  />
                </div>
              </div>
            </li>
            <li>
              <div className={styles.loggedInText}>
                <div className={styles.chainName}>Polygon</div>
                {connected ? (
                  <div className={styles.walletAddress} ens={ensName}>
                    {ensName
                      ? ensName
                      : account
                      ? account.slice(0, 5) + "..." + account.slice(37, 50)
                      : ""}
                  </div>
                ) : (
                  ""
                )}
              </div>
              <CustomButton
                type="login"
                theme="dark"
                icon="logout"
                onClick={disconnectWallet}
                size={28}
                className={styles.loginButton}
              />
            </li>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <li>
              <div className={styles.profileImage}>
                <div className={styles.image}>
                  <img src={"/assets/profile-no-image.png"} />
                </div>
              </div>
            </li>
            <li>
              <div className={styles.loggedOutText}>
                Not
                <br />
                Logged In
              </div>
              <CustomButton
                type="login"
                theme="dark"
                icon="login"
                onClick={connectWallet}
                size={28}
                className={styles.loginButton}
              />
            </li>
          </React.Fragment>
        )}
      </ul>
    </div>
  )
}
