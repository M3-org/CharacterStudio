import React, { useState } from "react"

export const ViewStates = {
  INTRO: "INTRO",
  LANDER_LOADING: "LANDER_LOADING",
  LANDER: "LANDER",
  CREATOR_LOADING: "CREATOR_LOADING",
  CREATOR: "CREATOR",
  MINT_LOADING: "MINT_LOADING",
  MINT: "MINT",
  MINT_COMPLETE: "MINT_COMPLETE"
}

export const ViewContext = React.createContext()

export const ViewProvider = (props) => {
  const [currentView, setCurrentView] = React.useState(ViewStates.INTRO)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [end, setEnd] = useState(false); // replace with view state
  const [mintDone, setMintDone] = useState(false); // TODO: replace with view state
  const [confirmWindow, setConfirmWindow] = useState(false);  // TODO: replace with view state
  const [loading, setLoading] = useState(true)

  return (
    <ViewContext.Provider value={{currentView, setCurrentView}}>
      {props.children}
    </ViewContext.Provider>
  )
}
