import useStore, { getState, setState } from '../../helpers/store'
import * as Style from './Snapshot.styles'

export const TakeScreenshot = () => {
  const image = useStore((s) => s.image)
  // const isShooting = useStore((s) => s.isShooting)

  return (
    <Style.SnapshotButton
      className={`${!image ? 'active' : ''}`}
      onClick={(event) => {
        event.preventDefault()
        if (getState().isShooting) {
          return
        }
        setState({ isShooting: true })

        window.XR8.canvasScreenshot()
          .takeScreenshot()
          .then(
            (data) => {
              // myImage is an <img> HTML element
              // const image = document.getElementById('myImage')
              const src = 'data:image/jpeg;base64,' + data
              useStore.setState({ image: src, isShooting: false })
            },
            (error) => {
              console.log(error)
            },
          )
      }}>
      <Style.SnapshotButtonContent />
    </Style.SnapshotButton>
  )
}

export const PreviewScreenshot = () => {
  const image = useStore((s) => s.image)
  const isShooting = useStore((s) => s.isShooting)

  return (
    <Style.SnapshotPreviewContainer className={`${image && !isShooting ? 'active' : ''}`}>
      {image && !isShooting ? (
        <Style.SnapshotPreview href={image} download>
          <DownloadScreenshot />
          <img alt="preview" src={image} />
        </Style.SnapshotPreview>
      ) : null}
    </Style.SnapshotPreviewContainer>
  )
}

export const PreviewBackDrop = () => {
  const image = useStore((s) => s.image)
  const isShooting = useStore((s) => s.isShooting)

  return <Style.SnapshotBackDrop className={`${image && !isShooting ? 'active' : ''}`} />
}

export const GoBackScreenshot = () => {
  const image = useStore((s) => s.image)

  return (
    <Style.SnapshotGoBack
      onClick={(event) => {
        event.preventDefault()
        useStore.setState({ image: null })
      }}
      className={`${image ? 'active' : ''}`}>
      <Style.SnapshotGoBackContent>
        <img src="/icons/back.svg" />
      </Style.SnapshotGoBackContent>
    </Style.SnapshotGoBack>
  )
}

export const DownloadScreenshot = () => {
  const image = useStore((s) => s.image)

  return (
    <Style.DownloadButton className={`${image ? 'active' : ''}`}>
      <Style.DownloadButtonContent>
        <img src="/icons/download.svg" />
      </Style.DownloadButtonContent>
    </Style.DownloadButton>
  )
}

export const Snapshot = () => {
  return (
    <>
      <TakeScreenshot />
      <PreviewScreenshot />
      <GoBackScreenshot />
      <PreviewBackDrop />
    </>
  )
}
