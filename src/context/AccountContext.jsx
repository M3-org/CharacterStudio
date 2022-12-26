import React, { createContext, useState } from "react"
export const AccountContext = createContext()

export const AccountProvider = (props) => {
  const [walletAddress, setWalletAddress] = useState(null)
  const [ensName, setEnsName] = useState(null)
  const [connected, setConnected] = useState(false)
  const [OTTokens, setOTTokens] = useState([])

  return (
    <AccountContext.Provider
      value={{
        walletAddress,
        setWalletAddress,
        ensName,
        setEnsName,
        connected,
        setConnected,
        OTTokens,
        setOTTokens
      }}
    >
      {props.children}
    </AccountContext.Provider>
  )
}
