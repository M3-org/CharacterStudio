import styled from 'styled-components'

export const SnapshotButton = styled.div`
  position: fixed;
  bottom: 12px;
  width: 60px;
  height: 60px;
  left: 50%;
  padding: 12px;
  border-radius: 100%;
  z-index: 99;
  pointer-events: none;
  transform: translate(-50%, 0) scale(0) translateZ(0);
  transition: transform 0.4s cubic-bezier(0, 0, 0.01, 0.99);

  &::before {
    content: ' ';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(0) translateZ(0);
    width: 44px;
    height: 44px;
    border-radius: 100%;
    border: 1px solid #19110b;
    transition: transform 0.4s cubic-bezier(0, 0, 0.01, 0.99) 0.05s;
    z-index: -1;
  }

  &.active {
    pointer-events: all;
    transform: translate(-50%, 0) scale(1) translateZ(0);
    &::before {
      transform: translate(-50%, -50%) scale(1) translateZ(0);
    }
  }
`

export const SnapshotButtonContent = styled.div`
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 100%;
`

export const SnapshotPreviewContainer = styled.div`
  position: absolute;
  top: 24px;
  left: 24px;
  height: calc(100% - 100px - 60px);
  width: calc(100% - 60px);
  z-index: 99;
  opacity: 0;
  transform-origin: top center;
  transform: translate(120px, 60px) scale(1.1) rotate(-12deg) translateZ(0);
  transition: opacity 0.2s cubic-bezier(0, 0, 0.01, 0.99), transform 0.5s cubic-bezier(0, 0, 0.01, 0.99);
  pointer-events: none;
  &.active {
    pointer-events: all;
    opacity: 1;
    transform: translate(0, 0) rotate(0deg) scale(1) translateZ(0);
  }
`
export const SnapshotPreview = styled.a`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: all;
  & > img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const SnapshotGoBack = styled.div`
  position: fixed;
  bottom: 12px;
  width: 60px;
  height: 60px;
  padding: 12px;
  left: 12px;
  border-radius: 100%;
  z-index: 99;
  pointer-events: none;
  transform: scale(0) translateZ(0);
  transition: transform 0.4s cubic-bezier(0, 0, 0.01, 0.99);
  &::before {
    content: ' ';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) scale(0) translateZ(0);
    width: 44px;
    height: 44px;
    border-radius: 100%;
    border: 1px solid #19110b;
    transition: transform 0.4s cubic-bezier(0, 0, 0.01, 0.99) 0.05s;
    z-index: -1;
  }
  &.active {
    pointer-events: all;
    transform: scale(1) translateZ(0);
    &::before {
      transform: translate(-50%, -50%) scale(1) translateZ(0);
    }
    img {
      opacity: 1;
      transform: translateX(0px) translateZ(0);
    }
  }
`

export const SnapshotGoBackContent = styled.div`
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  vertical-align: middle;
  img {
    width: 30px;
    opacity: 0;
    transform: translateX(10px) translateZ(0);
    transition: transform 0.4s cubic-bezier(0, 0, 0.01, 0.99) 0.2s, opacity 0.3s cubic-bezier(0, 0, 0.01, 0.99) 0.2s;
  }
`

export const SnapshotBackDrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgb(18 18 18 / 35%);
  backdrop-filter: blur(5px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.6s cubic-bezier(0, 0, 0.01, 0.99);

  &.active {
    opacity: 1;
  }
`

export const DownloadButton = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 60px;
  height: 60px;
  padding: 12px;
  border-radius: 100%;
  z-index: 99;
  pointer-events: none;
  transform: scale(0) translateZ(0);
  transition: transform 0.4s cubic-bezier(0, 0, 0.01, 0.99);

  &.active {
    transform: scale(1) translateZ(0);
    img {
      opacity: 1;
      transform: translateX(0px) translateZ(0);
    }
  }
`

export const DownloadButtonContent = styled.div`
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 100%;
  display: flex;
  justify-content: center;
  vertical-align: middle;
  img {
    width: 14px;
    opacity: 0;
    transform: translateX(10px) translateZ(0);
    transition: transform 0.4s cubic-bezier(0, 0, 0.01, 0.99) 0.2ss, opacity 0.3s cubic-bezier(0, 0, 0.01, 0.99) 0.2s;
  }
`
