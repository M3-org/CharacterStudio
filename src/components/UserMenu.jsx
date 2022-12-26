import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import classnames from "classnames"
import { ethers } from "ethers"
import React, { useContext, useEffect, useState } from "react"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter"
import { AccountContext } from "../context/AccountContext"
import { SceneContext } from "../context/SceneContext"
import { ViewContext, ViewStates } from "../context/ViewContext"
import { combine } from "../library/merge-geometry"
import VRMExporter from "../library/VRMExporter"
import CustomButton from "./custom-button"
import { CHAINS } from "./Contract"

import styles from "./UserMenu.module.css"

export const UserMenu = () => {
  const type = "_Gen1" // class type

  const [showDownloadOptions, setShowDownloadOptions] = useState(false)
  const { ensName, setEnsName, connected, setConnected } =
    useContext(AccountContext)
  const { activate, deactivate, account, chainId } = useWeb3React()

  const injected = new InjectedConnector({
    supportedChainIds: [137, 1, 3, 4, 5, 42, 97],
  })

  const { skinColor, model } = useContext(SceneContext)

  const { currentView, setCurrentView } = useContext(ViewContext)

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

  const getChainName = () => {
    const chainIDMap = Object.keys(CHAINS).reduce((acc, key) => {
      acc[CHAINS[key].chainId] = key;
      return acc;
    }, {})
    const chainName = chainIDMap[chainId];
    return chainName;
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
              <div className={styles.loggedInText}>
                <div className={styles.chainName}>{getChainName()}</div>
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
