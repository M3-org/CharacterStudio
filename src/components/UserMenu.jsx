import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import classnames from "classnames"
import { ethers } from "ethers"
import React, { useContext, useEffect, useState } from "react"
import { Object3D } from 'three'
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter"
import { createMeshesFromMultiMaterialMesh } from "three/examples/jsm/utils/SceneUtils"
import { AccountContext } from "../context/AccountContext"
import { SceneContext } from "../context/SceneContext"
import { combine } from "../library/merge-geometry"
import { getAvatarData } from "../library/utils"
import VRMExporter from "../library/VRMExporter"
import CustomButton from "./custom-button"

import styles from "./UserMenu.module.css"

export const UserMenu = () => {
  const type = "_Gen1" // class type

  const [showDownloadOptions, setShowDownloadOptions] = useState(false)
  const { ensName, setEnsName, connected, setConnected } =
    useContext(AccountContext)
  const { activate, deactivate, account } = useWeb3React()

  const injected = new InjectedConnector({
    supportedChainIds: [137, 1, 3, 4, 5, 42, 97],
  })

  const { skinColor, model, avatar } = useContext(SceneContext)

  const [mintStatus, setMintStatus] = useState("")

  useEffect(() => {
    if (account) {
      _setAddress(account)
      setConnected(true)
    } else {
      setConnected(false)
      setMintStatus("Please connect your wallet.")
    }
  }, [account])

  const _setAddress = async (address) => {
    const { name } = await getAccountDetails(address)
    console.log("ens", name)
    setEnsName(name ? name.slice(0, 15) + "..." : "")
  }

  const getAccountDetails = async (address) => {
    const provider = ethers.getDefaultProvider("mainnet", {
      alchemy: import.meta.env.VITE_ALCHEMY_API_KEY,
    })
    const check = ethers.utils.getAddress(address)

    try {
      const name = await provider.lookupAddress(check)
      if (!name) return {}
      return { name }
    } catch (err) {
      console.warn(err.stack)
      return {}
    }
  }

  const disconnectWallet = async () => {
    try {
      deactivate()
      setConnected(false)
    } catch (ex) {
      console.log(ex)
    }
  }

  const handleDownload = () => {
    showDownloadOptions
      ? setShowDownloadOptions(false)
      : setShowDownloadOptions(true)
  }

  const connectWallet = async () => {
    try {
      await activate(injected)
      setMintStatus("Your wallet has been connected.")
    } catch (ex) {
      console.log(ex)
    }
  }

  //
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

    console.log('avatarToDownload', avatarToDownload)

    // const avatarToCombine = avatarToDownload.clone()

    const exporter = format === "glb" ? new GLTFExporter() : new VRMExporter()
    //
    // const avatarModel = await combine({
    //   transparentColor: skinColor,
    //   avatar: avatarToCombine,
    //   atlasSize,
    // })
    // let toBeExported = avatarModel;
    // ---
    let body_geo;
    avatarToDownload.traverse(child => {
      if (child.name === 'body_geo') body_geo = child;
    })
    if (!body_geo) debugger
    // let toBeExported = body_geo;
    // let toBeExported = [
    //   body_geo,
    //   avatarToDownload.children[0].children[0].children[0],
    // ];
    // ok: exported body and bones gltf, but need manually fix `"max": [` `"min": [` bug.
    let toBeExported = new Object3D();
    toBeExported.add(body_geo);
    toBeExported.add(avatarToDownload.children[0].children[0].children[0]);
    // ---
    // toBeExported.children[0] = createMeshesFromMultiMaterialMesh(toBeExported.children[0]);
    // ---
    toBeExported.traverse(child => {
      if (Array.isArray(child.material)) {
        child.material = child.material[0];
      }
    })
    // ---
    if (format === "glb") {
      debugger
      exporter.parse(
        toBeExported,
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
          truncateDrawRange: false,
          binary: false,
          forcePowerOfTwoTextures: false,
          // maxTextureSize: 1024 || Infinity,
        },
      )
    } else {

      const vrmData = {...getVRMBaseData(avatar), ...getAvatarData(avatarModel, "UpstreetAvatar")}
      exporter.parse(vrmData, avatarModel, (vrm) => {
        saveArrayBuffer(vrm, `${downloadFileName}.vrm`)
      })
    }
  }

  function getVRMBaseData(avatar){
    // to do, merge data from all vrms, not to get only the first one
    for (const prop in avatar){
      if (avatar[prop].vrm){
        return avatar[prop].vrm
      }
    }
  }

  function getArrayBuffer(buffer) {
    return new Blob([buffer], { type: "application/octet-stream" })
  }

  return (
    <div className={classnames(styles.userBoxWrap)}>
      <div className={styles.leftCorner} />
      <div className={styles.rightCorner} />
      <ul>
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
                  // setCurrentView(ViewStates.MINT)
                }}
              />
            </li>
          </React.Fragment>
        {connected ? (
          <React.Fragment>
            <li>
              <div className={styles.loggedInText}>
                <div className={styles.chainName}>Mainnet</div>
                {connected ? (
                  <div className={styles.walletAddress}>
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
              <div className={styles.loggedOutText}>
                Not
                <br />
                Connected
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
