import { TFunction } from "i18next"
import React, { createContext } from "react"
import { useTranslation } from "react-i18next"

export const LanguageContext = createContext<{
  t: TFunction<"translation", undefined, "translation">
}>({
  t: null!
})

export const LanguageProvider = (props: React.PropsWithChildren<{}>) => {
  //@ts-ignore
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
