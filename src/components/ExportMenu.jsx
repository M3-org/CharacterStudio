import { useWeb3React } from "@web3-react/core"
import { InjectedConnector } from "@web3-react/injected-connector"
import classnames from "classnames"
import { ethers } from "ethers"
import React, { useContext, useEffect, useState } from "react"
import { Group, MeshStandardMaterial } from "three"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter"
import { AccountContext } from "../context/AccountContext"
import { SceneContext } from "../context/SceneContext"
import { cloneSkeleton, combine } from "../library/merge-geometry"
import { getAvatarData } from "../library/utils"
import VRMExporter from "../library/VRMExporter"
import CustomButton from "./custom-button"

import { downloadGLB, downloadVRM } from "../library/download-utils"

import styles from "./ExportMenu.module.css"

export const ExportMenu = () => {
  // const type = "_Gen1" // class type

  const [showDownloadOptions, setShowDownloadOptions] = useState(false)
  const { ensName, setEnsName, connected, setConnected } =
    useContext(AccountContext)
  const { activate, deactivate, account } = useWeb3React()

  const injected = new InjectedConnector({
    supportedChainIds: [137, 1, 3, 4, 5, 42, 97],
  })

  const { skinColor, model, avatar } = useContext(SceneContext)

  // const [mintStatus, setMintStatus] = useState("")

  useEffect(() => {
    if (account) {
      _setAddress(account)
      setConnected(true)
    } else {
      setConnected(false)
      // setMintStatus("Please connect your wallet.")
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
      // setMintStatus("Your wallet has been connected.")
    } catch (ex) {
      console.log(ex)
    }
  }

  return (
    <React.Fragment>
      <CustomButton
        theme="light"
        text="GLB"
        icon="download"
        size={14}
        className={styles.button}
        onClick={() => {
          downloadGLB(model,true,`CharacterCreator_exported`)
          //download(model, `CharacterCreator_exported`, "glb")
        }}
      />
      <CustomButton
        theme="light"
        text="GLB Unoptimized"
        icon="download"
        size={14}
        className={styles.button}
        onClick={() => {
          downloadGLB(model,false,`CharacterCreator_exported`)
          //download(model, `CharacterCreator_exported_unoptimized`, "glb", undefined, true)
        }}
      />
      <CustomButton
        theme="light"
        text="VRM"
        icon="download"
        size={14}
        className={styles.button}
        onClick={() => {
          downloadVRM(model, avatar, `CharacterCreator_exported`)
          //download(model, `CharacterCreator_exported`, "vrm")
        }}
      />
    </React.Fragment>
  )
}
