import React, { createContext } from "react"
import { useTranslation } from "react-i18next"

export const LanguageContext = createContext()

export const LanguageProvider = (props) => {
  const { t } = useTranslation()

  return (
    <LanguageContext.Provider
      value={{
        t,
      }}
    >
      {props.children}
    </LanguageContext.Provider>
  )
}
