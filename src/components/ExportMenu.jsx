import { useWeb3React } from "@web3-react/core"
import { ethers } from "ethers"
import React, { useContext, useEffect, useState } from "react"
import { AccountContext } from "../context/AccountContext"
import { SceneContext } from "../context/SceneContext"
import CustomButton from "./custom-button"

import { downloadGLB, downloadVRM } from "../library/download-utils"

import styles from "./ExportMenu.module.css"


const defaultName = "Anon"


export const ExportMenu = () => {
  const { setEnsName, setConnected } = useContext(AccountContext)
  const { account } = useWeb3React()

  const [name] = React.useState(localStorage.getItem("name") || defaultName)
  const { model, avatar } = useContext(SceneContext)

  useEffect(() => {
    if (account) {
      _setAddress(account)
      setConnected(true)
    } else {
      setConnected(false)
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
        }}
      />
      <CustomButton
        theme="light"
        text="VRM"
        icon="download"
        size={14}
        className={styles.button}
        onClick={() => {
          downloadVRM(model, avatar, name)
        }}
      />
    </React.Fragment>
  )
}
