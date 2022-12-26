import React from "react"

export const ViewStates = {
  INTRO: "INTRO",
  LANDER_LOADING: "LANDER_LOADING",
  LANDER: "LANDER",
  CREATOR_LOADING: "CREATOR_LOADING",
  CREATOR: "CREATOR",
  MINT_LOADING: "MINT_LOADING",
  MINT: "MINT",
  MINT_CONFIRM: "MINT_CONFIRM",
  MINT_COMPLETE: "MINT_COMPLETE"
}

export const ViewContext = React.createContext()

export const ViewProvider = (props) => {
  const [currentView, setCurrentView] = React.useState(ViewStates.INTRO)
  return (
    <ViewContext.Provider value={{currentView, setCurrentView}}>
      {props.children}
    </ViewContext.Provider>
  )
}
