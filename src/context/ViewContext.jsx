import React from "react"

export const ViewStates = {
  INIT: "INIT",
  INTRO_LOADING: "INTRO_LOADING",
  INTRO_TRANSITION: "INTRO_TRANSITION",
  LANDER: "LANDER",
  CREATOR_LOADING: "CREATOR_LOADING",
  CREATOR: "CREATOR",
  MINT_LOADING: "MINT_LOADING",
  MINT: "MINT",
  MINT_COMPLETE: "MINT_COMPLETE",
  MINT_AGAIN: "MINT_AGAIN",
}

export const ViewContext = React.createContext()

export const ViewProvider = (props) => {
  const [viewState, setViewState] = React.useState(ViewStates.INIT)

  return (
    <ViewContext.Provider value={[viewState, setViewState]}>
      {props.children}
    </ViewContext.Provider>
  )
}
