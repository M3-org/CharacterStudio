// import { AuthService, useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import React, { useEffect, useState } from "react"
import InventoryContent from "./InventoryContent"
import styles from "../../styles/ui.module.scss"
import { InventoryService } from "../../services/InventoryService"

export const Inventory = (): any => {
  const [svgImage, setSvgImage] = useState([])

  useEffect(() => {
    const nftImage = async () => {
      const image: any = await InventoryService.fetchInventoryList()
      console.log("aaa");
      setSvgImage([...image])
    }
    nftImage()
  }, [])

  return svgImage.length > 0 ? (
    <div className={styles.menuPanel}>
      <InventoryContent nftImage={svgImage} />
    </div>
  ) : (
    true
  )
}

export default Inventory
