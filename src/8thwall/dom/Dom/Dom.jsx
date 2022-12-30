import { useEffect, useRef } from 'react'
import useStore from '../../helpers/store'
import { Snapshot } from '../Snapshot/Snapshot'
import * as Style from './Dom.styles'
import { useGesture } from '@use-gesture/react'

const gestureOptions = {
  drag: {
    filterTaps: true,
    pointer: {
      touch: false,
    },
  },
  pinch: {
    scaleBounds: {
      min: 0.1,
      max: 10,
    },
    pointer: {
      touch: false,
    },
  },
}

const Dom = () => {
  const ref = useRef(null)

  useEffect(() => {
    useStore.setState({ dom: ref })
  }, [])

  const bind = useGesture(
    {
      onPinch: ({ offset }) => {
        const [scale] = offset
        useStore.setState({ setScale: scale, setPos: false })
      },
      onDrag: ({ xy }) => {
        useStore.setState({ setPos: true })
        useStore.setState({ mousePos: { x: (xy[0] / window.innerWidth) * 2 - 1, y: -(xy[1] / window.innerHeight) * 2 + 1 } })
      },
      onTouchEnd: () => {
        useStore.setState({ setPos: false })
      },
    },
    {
      ...gestureOptions,
    },
  )
  return (
    <>
      <Style.Container
        style={{
          touchAction: 'none',
        }}
        ref={ref}
        {...bind()}>
        <Style.Header>Utsubo 8thwall Starter</Style.Header>
      </Style.Container>
      <Snapshot />
    </>
  )
}

export default Dom
