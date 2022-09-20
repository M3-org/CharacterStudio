import React, { useState } from "react"
import { Stack } from '@mui/material'
import makeStyles from '@mui/styles/makeStyles'

const useStyles = makeStyles({
  inventoryItem: {
    margin: 10,
    filter: 'drop-shadow(0px 11.2376px 11.2376px rgba(0, 0, 0, 0.25))',
    borderRadius: '6.74257px',
    border: '2px solid rgba(137, 137, 242, 0.53)',
    boxShadow: '0px 11.23762321472168px 11.23762321472168px 0px #00000040',
    width: '25%',
    height: '60px',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  inventoryItemEmpty: {
    margin: 10,
    borderRadius: '8px',
    border: '2px solid #ffffff61',
    boxShadow: '0px 11.23762321472168px 11.23762321472168px 0px #00000040',
    backdropFilter: 'blur(50px)',
    width: '25%',
    height: '60px'
  },
  inventoryContent: {
    '&.being-dragged': {
      position: 'absolute',
      cursor: 'grab'
    },
    '&.being-moved': {
      display: 'none'
    }
  },
  inventoryInsideContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none'
  },
  inventoryItemPreview: {
    width: '50px',
    aspectRatio: '1.2'
  },
  inventoryItemName: {
    wordBreak: 'break-all',
    textAlign: 'center'
  }
})

const MainComponent = (props: any) => {
  const classes = useStyles()

  const ItemSlot = ({ value, slot }: any) => {
    return (
      <Stack justifyContent="center" alignItems="center" className={`${classes.inventoryItem}`}>
        <div
          id={`item-slot-${slot}`}
          className={`item-slot ${classes.inventoryContent}`}
          data-slot={props.slot}
          data-type={`item`}
        >
          <div className={`${classes.inventoryInsideContent}`}>
              <img className={`${classes.inventoryItemPreview}`} src={`data:image/svg+xml;utf8,${value.data}`} />
            <div>
              <span>{value.name}</span>
            </div>
          </div>
        </div>
      </Stack>
    )
  }

  const EmptySlot = ({ slot }: any) => {
    return (
      <Stack justifyContent="center" alignItems="center" className={`${classes.inventoryItemEmpty}`}>
        <div
          className="item-slot empty"
          style={{ width: '100%', height: '100%' }}
          data-slot={slot}
          data-type={`empty-slot`}
        ></div>
      </Stack>
    )
  }

  return props.value !== null ? <ItemSlot {...props} /> : <EmptySlot {...props} />
}

export default MainComponent
