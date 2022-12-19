import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import { ethers } from "ethers"
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
  const { ensName, setEnsName, connected, setConnected } = useContext(AccountContext)
  const { activate, deactivate, library, account } = useWeb3React()

  const injected = new InjectedConnector({
    supportedChainIds: [137, 1, 3, 4, 5, 42, 97],
  })

  const { avatar, scene, skinColor, model } = useContext(SceneContext)

  const {currentView, setCurrentView} = useContext(ViewContext)

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
    const { name, avatar } = await getAccountDetails(address)
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
    showDownloadOptions ? setShowDownloadOptions(false) : setShowDownloadOptions(true)
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
        onClick={connected ? disconnectWallet : connectWallet}
      >
        {connected ? (
          <div className={styles['WalletInfo']} ens={ensName}>
            {ensName ? ensName : account ? account.slice(0, 15) + "..." : ""}
          </div>
        ) : (
          ""
        )}
        <div className={styles['WalletImg']} />
      </div>
    </div>
  )
}
