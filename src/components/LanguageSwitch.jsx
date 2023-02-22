import React, { useContext } from "react"
import { useTranslation, Trans } from "react-i18next"
import styles from "./LanguageSwitch.module.css"

const lngs = {
  // English
  en: { nativeName: "English" },
  // Russian
  ru: { nativeName: "Русский" },
  // Chinese
  zh: { nativeName: "中文" },
}

export default function LanguageSwitch() {
  const { t, i18n } = useTranslation()
  return (
    <div className={styles.languageSwitchWrap}>
      {Object.keys(lngs).map((lng) => (
        <button
          key={lng}
          style={{
            fontWeight: i18n.resolvedLanguage === lng ? "bold" : "normal",
          }}
          type="submit"
          onClick={() => i18n.changeLanguage(lng)}
        >
          {lngs[lng].nativeName}
        </button>
      ))}
    </div>
  )
}
