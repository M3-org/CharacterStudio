/**
 * i18n pre-flight tests — run these BEFORE merging PR #226 (i18next 22→25).
 *
 * These tests verify that the current i18n initialization and translation
 * lookup API works as expected. If they fail after the version bump, the
 * init config or react-i18next integration needs to be updated.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import translations from '../../src/lib/localization/translations.json'

// Initialize a fresh i18n instance without LanguageDetector (browser-only plugin)
beforeAll(async () => {
  if (!i18n.isInitialized) {
    await i18n
      .use(initReactI18next)
      .init({
        fallbackLng: 'en',
        lng: 'en',
        interpolation: { escapeValue: false },
        resources: translations,
      })
  }
})

describe('i18n initialization', () => {
  it('initializes without error', () => {
    expect(i18n.isInitialized).toBe(true)
  })

  it('defaults to English fallback', () => {
    expect(i18n.language).toBe('en')
  })
})

describe('translation lookups — current key structure', () => {
  it('resolves pageTitles keys', () => {
    expect(i18n.t('pageTitles.chooseClass')).toBe('Choose Character Class')
    expect(i18n.t('pageTitles.chooseAppearance')).toBe('Choose Appearance')
    expect(i18n.t('pageTitles.saveCharacter')).toBe('Save Your Character')
  })

  it('resolves callToAction keys', () => {
    expect(i18n.t('callToAction.next')).toBe('Next')
    expect(i18n.t('callToAction.back')).toBe('Back')
    expect(i18n.t('callToAction.randomize')).toBe('Randomize')
  })

  it('resolves editor section keys', () => {
    expect(i18n.t('editor.title')).toBe('Appearance')
    expect(i18n.t('editor.head')).toBe('Head')
    expect(i18n.t('editor.body')).toBe('Body')
  })

  it('returns the key itself for missing translations', () => {
    const missing = i18n.t('nonexistent.key.that.does.not.exist')
    expect(missing).toBe('nonexistent.key.that.does.not.exist')
  })
})

describe('interpolation', () => {
  it('escapeValue: false passes HTML through unchanged', () => {
    // Verify interpolation config hasn't changed
    expect(i18n.options.interpolation.escapeValue).toBe(false)
  })
})
