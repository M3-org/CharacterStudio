// import { AuthService, useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import React, { useEffect, useState } from 'react'
import InventoryContent from './InventoryContent'
import styles from '../../styles/ui.module.scss'
import { InventoryService, useInventoryState } from '../../services/InventoryService'

export const Inventory = (): any => {
  const inventoryState = useInventoryState()
  let { data, user, type, isLoading, isLoadingtransfer, coinData } = inventoryState.value

  useEffect(() => {
    InventoryService.fetchInventoryList("11111")
  }, [])

  return (true
    // <div className={styles.menuPanel}>
    //     <InventoryContent />
    // </div>
  )
}

export default Inventory
