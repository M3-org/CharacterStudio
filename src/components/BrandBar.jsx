import React, { useContext } from "react"
import { AccountContext } from "../context/AccountContext"

// Hydra SVG mark — three overlapping ellipses forming heads, shared with hotkeys.html
function HydraMark({ size = 20 }) {
  const h = Math.round(size * 0.8)
  return (
    <svg width={size} height={h} viewBox="0 0 40 32" fill="none" aria-hidden="true">
      <ellipse cx="9"  cy="9"  rx="6" ry="7" fill="#16b195" opacity="0.7" />
      <ellipse cx="20" cy="5"  rx="6" ry="7" fill="#16b195" />
      <ellipse cx="31" cy="9"  rx="6" ry="7" fill="#16b195" opacity="0.7" />
      <path d="M9 16 Q14 24 20 26 Q26 24 31 16"
        stroke="#16b195" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function BrandBar() {
  const { connected, grudgeId, login, logout } = useContext(AccountContext)

  return (
    <div className="gcs-brand-bar" role="banner">
      {/* Left: mark + wordmark */}
      <a className="gcs-brand-mark" href="https://grudge-studio.com" target="_blank" rel="noopener noreferrer">
        <HydraMark size={20} />
        <span className="gcs-wordmark">GCS</span>
        <div className="gcs-divider" />
        <span className="gcs-studio-name">Grudge Character Studio</span>
      </a>

      {/* Right: account state */}
      <div className="gcs-account-area">
        {connected ? (
          <>
            <span className="gcs-grudge-id">
              {grudgeId ? `#${grudgeId}` : "Connected"}
            </span>
            <button className="gcs-btn gcs-btn-logout" onClick={logout} title="Sign out">
              Sign Out
            </button>
          </>
        ) : (
          <button className="gcs-btn gcs-btn-login" onClick={login}>
            Sign In
          </button>
        )}
      </div>
    </div>
  )
}
