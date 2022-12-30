import React from 'react'
import Canvas from './canvas/Canvas'
import Dom from './dom/Dom/Dom'
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
html,
body,
#root,
canvas {
  position: fixed;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  top: 0;
  left: 0;
  overflow: hidden;
}
#root {
  z-index: 2;
}
* {
  user-select: none;
}
html, body {touch-action: none;}

#requestingCameraPermissions {
  color: rgb(25, 17, 11);
  background-color: #f6f5f3;
  font-family: "Louis Vuitton Web","Helvetica Neue","Helvetica",Arial,sans-serif !important;
  box-shadow: 0 1px 0 0 #eae8e4 !important;
  font-size: 1rem;
  letter-spacing: .025rem;
  line-height: 2rem;
  font-weight: 300;
}
#loadBackground {
  background-color: rgba(0, 0,0, .3) !important;
}

#requestingCameraIcon {
  display: none;
}

#requestingCameraIcon {
  /* This changes the image from white to black */
  filter: invert(1);
}

.prompt-box-8w {
  background-color: #fff !important;
  border-radius: 0 !important;
  color: rgb(25, 17, 11) !important;
  width: calc(100% - 56px);
  font-family: "Louis Vuitton Web","Helvetica Neue","Helvetica",Arial,sans-serif !important;
  box-shadow: none !important;
  padding: 14px;
  font-size: 14px;
  strong {
    font-size: 20px;
  }

}

.prompt-button-8w {
  background-color: #fff !important;
  color: rgb(25, 17, 11) !important;
  box-shadow: inset 0 0 0 1px rgb(25, 17, 11) !important;
  border-radius: 0 !important;
  font-size: 14px;
  letter-spacing: .05rem;
  line-height: 1rem;
  font-weight: 500;
  white-space: nowrap;
  margin: 7px;
}

.button-primary-8w {
  background-color: rgb(25, 17, 11) !important;
  border-radius: 0 !important;
  color: #fff !important;
  font-size: 14px;
  padding: 14px;
  font-size: .8125rem;
  letter-spacing: .05rem;
  line-height: 1rem;
  font-weight: 500;
  white-space: nowrap;
  margin: 7px;
}
`

function App() {
  let inDom = false
  const observer = new MutationObserver(() => {
    if (document.querySelector('.prompt-box-8w')) {
      if (!inDom) {
        document.querySelector('.prompt-box-8w p').innerHTML = '<strong>UTSUBO AR</strong><br/><br/>Press Approve to continue.'
        document.querySelector('.prompt-button-8w').innerHTML = 'Deny'
        document.querySelector('.button-primary-8w').innerHTML = 'Approve'
      }
      inDom = true
    } else if (inDom) {
      inDom = false
      observer.disconnect()
    }
  })
  observer.observe(document.body, { childList: true })
  return (
    <>
      <Canvas />
      <Dom />
      <GlobalStyle />
    </>
  )
}

export default App
