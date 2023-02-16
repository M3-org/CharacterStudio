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


const defaultName = "Anon"


export const ExportMenu = () => {
  // const type = "_Gen1" // class type

  const [showDownloadOptions, setShowDownloadOptions] = useState(false)
  const { ensName, setEnsName, connected, setConnected } =
    useContext(AccountContext)
  const { activate, deactivate, account } = useWeb3React()

  const [name] = React.useState(
    localStorage.getItem("name")
    || defaultName
  )

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
      console.error(ex)
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
      console.error(ex)
    }
  }

  async function download(
    avatarToDownload,
    fileName,
    format,
    atlasSize = 4096,
    isUnoptimized = false,
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

    const avatarToDownloadClone = avatarToDownload.clone()
    /*
      NOTE: After avatar clone, the origIndexBuffer/BufferAttribute in userData will lost many infos:
      From: BufferAttribute {isBufferAttribute: true, name: '', array: Uint32Array(21438), itemSize: 1, count: 21438, …}
      To:   Object          {itemSize: 1, type: 'Uint32Array',  array: Array(21438), normalized: false}
      Especailly notics the change of `array` type, and lost of `count` property, will cause errors later.
      So have to reassign `userData.origIndexBuffer` after avatar clone.
    */
    const origIndexBuffers = []
    avatarToDownload.traverse((child) => {
      if (child.userData.origIndexBuffer)
        origIndexBuffers.push(child.userData.origIndexBuffer)
    })
    avatarToDownloadClone.traverse((child) => {
      if (child.userData.origIndexBuffer)
        child.userData.origIndexBuffer = origIndexBuffers.shift()
    })

    let avatarModel

    const exporter = format === "glb" ? new GLTFExporter() : new VRMExporter()
    if (isUnoptimized) {
      let skeleton
      const skinnedMeshes = []

      avatarToDownloadClone.traverse((child) => {
        if (!skeleton && child.isSkinnedMesh) {
          skeleton = cloneSkeleton(child)
        }
        if (child.isSkinnedMesh) {
          child.geometry = child.geometry.clone()
          child.skeleton = skeleton
          skinnedMeshes.push(child)
          if (Array.isArray(child.material)) {
            const materials = child.material
            child.material = new MeshStandardMaterial()
            child.material.map = materials[0].map
          }
          if (child.userData.origIndexBuffer) {
            child.geometry.setIndex(child.userData.origIndexBuffer)
          }
        }
      })

      avatarModel = new Group()
      skinnedMeshes.forEach((skinnedMesh) => {
        avatarModel.add(skinnedMesh)
      })
      avatarModel.add(skeleton.bones[0])
    } else {
      avatarModel = await combine({
        transparentColor: skinColor,
        avatar: avatarToDownloadClone,
        atlasSize,
      })
    }
    if (format === "glb") {
      exporter.parse(
        avatarModel,
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
      const vrmData = {
        ...getVRMBaseData(avatar),
        ...getAvatarData(avatarModel, "CharacterCreator"),
      }
      exporter.parse(vrmData, avatarModel, (vrm) => {
        saveArrayBuffer(vrm, `${downloadFileName}.vrm`)
      })
    }
  }

  function getVRMBaseData(avatar) {
    // to do, merge data from all vrms, not to get only the first one
    for (const prop in avatar) {
      if (avatar[prop].vrm) {
        return avatar[prop].vrm
      }
    }
  }

  function getArrayBuffer(buffer) {
    return new Blob([buffer], { type: "application/octet-stream" })
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
          downloadGLB(model, true, name)
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
          downloadGLB(model, false, name)
          //download(model, `${name}_unoptimized`, "glb", undefined, true)
        }}
      />
      <CustomButton
        theme="light"
        text="VRM"
        icon="download"
        size={14}
        className={styles.button}
        onClick={() => {
          downloadVRM(model, avatar, name, 4096, true)
          //download(model, name, "vrm")
        }}
      />
    </React.Fragment>
  )
}
