import { createContext, useState } from "react"
export const AccountContext = createContext()

export const AccountProvider = (props) => {
  const [ensName, setEnsName] = useState(null)
  const [connected, setConnected] = useState(false)

  return (
    <AccountContext.Provider
      value={{
        ensName,
        setEnsName,
        connected,
        setConnected,
      }}
    >
      {props.children}
    </AccountContext.Provider>
  )
}
