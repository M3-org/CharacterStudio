import React, { createContext, useState } from "react"

export type AccountContextType = {
  walletAddress: string|null,
  setWalletAddress: (walletAddress:string|null)=>void,
  ensName: string|null,
  setEnsName: (ensName:string|null)=>void,
  connected: boolean,
  setConnected: (connected:boolean)=>void,
  OTTokens: any[],
  setOTTokens: (OTTokens:any[])=>void,
}
export const AccountContext = createContext<AccountContextType | undefined>(undefined)

export const AccountProvider = ({children}:{children?:React.ReactNode}) => {
  const [walletAddress, setWalletAddress] = useState<string|null>(null)
  const [ensName, setEnsName] = useState<string|null>(null)
  const [connected, setConnected] = useState<boolean>(false)
  const [OTTokens, setOTTokens] = useState<any[]>([])

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
      {children}
    </AccountContext.Provider>
  )
}
