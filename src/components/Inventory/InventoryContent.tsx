import Typography from "@mui/material/Typography"
import makeStyles from "@mui/styles/makeStyles"
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material"
import React, { useState } from "react"
import {
  Box,
  IconButton,
  Stack,
} from "@mui/material"

import ItemSlot from "./Slot"
import DragAndDropAPI from "./DragAndDropAPI"

const useStyles = makeStyles({
  root1: {
    width: "50%",
  },
  root: {
    color: "white",
  },
  item: {
    border: "solid 1px",
    borderRadius: "5px",
    borderColor: "#d9d7d78c",
    cursor: "pointer",
  },
  modalBody: {
    backgroundColor: "#FFF",
  },
  modalBoxShadow: {
    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
    transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
    backgroundColor: "white",
  },
  itemscroll: {
    // maxHeight: '500px',
    overflow: "scroll",
  },
  backButton: {
    opacity: 0.8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    "&:hover": {
      background: "none",
      opacity: 1,
    },
  },
  title: {
    color: "white",
  },
  p10: {
    padding: "10px",
  },
  selecteditem: {
    border: "2px solid white",
  },
  card: {
    margin: "10px",
  },
  contents: {
    justifyContent: "center",
  },
  titlesize: {
    fontSize: "20px",
  },
  inventoryWrapper: {
    display: "flex",
    flexWrap: "wrap",
  },
  inventoryItem: {
    margin: 5,
    filter: "drop-shadow(0px 11.2376px 11.2376px rgba(0, 0, 0, 0.25))",
    borderRadius: "6.74257px",
    border: "2px solid rgba(137, 137, 242, 0.53)",
    boxShadow: "0px 11.23762321472168px 11.23762321472168px 0px #00000040",
    width: "15%",
    height: "100px",
    "&:hover": {
      cursor: "pointer",
    },
  },
  inventoryItemEmpty: {
    margin: 15,
    borderRadius: "8px",
    border: "2px solid #ffffff61",
    background:
      "linear-gradient(180deg, rgba(137, 137, 242, 0.5) 0%, rgba(92, 92, 92, 0.5) 100%)",
    boxShadow: "0px 11.23762321472168px 11.23762321472168px 0px #00000040",
    backdropFilter: "blur(50px)",
    width: "15%",
    height: "100px",
  },
  invenPaginationBtn: {
    "&:hover": {
      cursor: "pointer",
    },
    "&.disable": {
      opacity: "0.3",
    },
  },
})

const inventoryLimit = 9

const InventoryContent = ({nftImage}) => {
  const classes = useStyles()
  const [state, setState] = useState({
    url: "",
    metadata: "",
    selectedid: "",
    userid: "",
    anchorEl: null,
    selectedtype: "",
    inventory: [],
    currentPage: 1,
  })

  const totalPage = Math.ceil(nftImage?.length / inventoryLimit)

  const [items, setItems] = useState([...nftImage])
  const [draggingSlotId, setDraggingSlot] = useState(null)
  const getItemDataInSlot = (slot) => items.find((item) => item.slot === slot)

  const swapItemSlots = (oldSlot, newSlot) => {
    setItems((currentState) => {
      let newInventory = [...currentState]
      let oldIndex: any, newIndex: any

      // Finding the old ones..

      newInventory.forEach((item, index) => {
        if (item.slot === oldSlot) {
          oldIndex = index
        } else if (item.slot === newSlot) {
          newIndex = index
        }
      })

      // Replacing them

      newInventory[oldIndex] = { ...newInventory[oldIndex], slot: newSlot }
      newInventory[newIndex] = { ...newInventory[newIndex], slot: oldSlot }

      return [...newInventory]
    })
  }

  const moveItemToSlot = (oldSlot, newSlot) => {
    setItems((currentState) => {
      let newInventory = [...currentState]
      let targetIndex: any
      let isChange: any = true
      newInventory.forEach((item, index) => {
        if (item.slot === oldSlot) targetIndex = index
        if (item.slot === parseInt(newSlot)) isChange = false
      })
      if (isChange) {
        newInventory[targetIndex] = {
          ...newInventory[targetIndex],
          slot: parseInt(newSlot),
        }
      }
      return [...newInventory]
    })
  }

  const onInventoryItemDragged = ({ detail: eventData }: any) => {
    const oldSlot = parseInt(eventData.slot),
      newSlot = parseInt(eventData.destination.slot)

    if (eventData.destination.type === "empty-slot") {
      moveItemToSlot(oldSlot, newSlot)
    } else if (eventData.destination.type === "item") {
      swapItemSlots(oldSlot, newSlot)
    }
  }

  // ***********************************

  const goToNextPage = () => {
    setState((prevState) => ({
      ...prevState,
      currentPage: prevState.currentPage + 1,
    }))
  }
  const goToPrevPage = () => {
    setState((prevState) => ({
      ...prevState,
      currentPage: prevState.currentPage > 1 ? prevState.currentPage - 1 : 1,
    }))
  }
  const getCurrentSlots = () => {
    const res: any = []
    const startIndex = (state.currentPage - 1) * inventoryLimit
    const endIndex = state.currentPage * inventoryLimit
    for (let i = startIndex; i < endIndex; i++) res.push(i)
    return res
  }
  
  return (
    <Box
      sx={{ p: 2 }}
      className={`${classes.root} ${classes.contents} invenContentPanel`}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        className={classes.title}
      >
        <IconButton
          sx={{ svg: { color: "white" } }}
          className={classes.backButton}
        >
          <ArrowBackIos />
        </IconButton>
        <Stack justifyContent="center" sx={{ width: "90%" }}>
          <Typography className={`${classes.title} ${classes.titlesize}`}>
            Inventory
          </Typography>
          <Stack
            direction="row"
            justifyContent="center"
            className={`${classes.inventoryWrapper}`}
          >
            <Stack sx={{ marginTop: "15px", width: "100%" }}>
              {items.length !== 0 ? (
                <Stack>
                  {/* drag & drop API integration */}
                  <DragAndDropAPI
                    activeDraggedSlot={draggingSlotId}
                    setActiveDraggedSlot={setDraggingSlot}
                    changeItems={moveItemToSlot}
                  />

                  {/* inventory grid */}
                  <Stack
                    direction="row"
                    justifyContent="center"
                    flexWrap={"wrap"}
                    sx={{ position: "relative" }}
                    className={`inventory`}
                  >
                    {getCurrentSlots().map((slot) => {
                      return (
                        <ItemSlot
                          slot={slot}
                          value={getItemDataInSlot(slot) || null}
                          key={slot}
                        />
                      )
                    })}
                  </Stack>
                  {/* pagination */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <IconButton
                      sx={{ svg: { color: "white" } }}
                      className={`${classes.invenPaginationBtn} ${
                        state.currentPage <= 1 ? "disable" : ""
                      }`}
                      onClick={() => goToPrevPage()}
                      disabled={state.currentPage < 1 ? true : false}
                    >
                      <ArrowBackIos />
                    </IconButton>
                    <Typography>
                      Page {`${state.currentPage} - ${totalPage}`}
                    </Typography>

                    <IconButton
                      sx={{ svg: { color: "white" } }}
                      className={`${classes.invenPaginationBtn} ${
                        state.currentPage >= totalPage ? "disable" : ""
                      }`}
                      onClick={() => goToNextPage()}
                      disabled={state.currentPage >= totalPage ? true : false}
                    >
                      <ArrowForwardIos />
                    </IconButton>
                  </Stack>
                </Stack>
              ) : (
                <Stack>
                  <Typography>No Data Found</Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  )
}

export default InventoryContent
