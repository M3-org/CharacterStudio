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
      <select
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        value={i18n.resolvedLanguage}
      >
        {Object.keys(lngs).map((lng) => (
          <option key={lng} value={lng}>
            {lngs[lng].nativeName}
          </option>
        ))}
      </select>
    </div>
  )
}
