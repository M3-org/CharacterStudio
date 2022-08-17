import { Avatar } from "@mui/material";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import * as React from "react";

export default function Editor(props: any) {
  const { category, setCategory }: any = props;
  const selectorButton = {
    color: "#999999",
    fontSize: "12px",
    minWidth: "60px",
    cursor: "pointer",
  }

  const selectorButtonActive = {
    color: "#666666",
    fontSize: "12px",
    minWidth: "60px",
    cursor: "pointer",
  }

  const selectorButtonIcon = {
    display: "inline-block",
    width: "40px",
    height: "40px",
    padding: "2px",
  }

  return (
    <div style={{
      position: "absolute",
      left: "0",
      bottom: "0",
      width: "100vw",
      backgroundColor: "#111111",
      borderTop: "1px solid #303030",
      padding: "14px 0",
    }}>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={2}
        justifyContent="center"
        alignItems="center"
      >

        <div onClick={() => setCategory('color')} style={ category && category === "color" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon}  src={'/color.png'} />
          <br />
          Skin Tone
        </div>
        <div onClick={() => setCategory('gender')} style={ category && category === "gender" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon}  src={'/body.png'} />
          <br />
          Gender
        </div>
        <div onClick={() => setCategory('body')} style={ category && category === "body" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon}  src={'/shirt.png'} />
          <br />
          Body
        </div>
        <div onClick={() => setCategory('chest')} style={ category && category === "chest" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon}  src={'/shirt.png'} />
          <br />
          Chest
        </div>
        <div onClick={() => setCategory('head')} style={ category && category === "head" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon} src={'/face.png'} />
          <br />
          Head
        </div>
        <div onClick={() => setCategory('neck')} style={ category && category === "neck" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon}  src={'/neck.png'} />
          <br />
          Neck
        </div>
        <div onClick={() => setCategory('hand')} style={ category && category === "hand" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon} src={'/arms.png'} />
          <br />
          Hand
        </div>
        {/* <div onClick={() => setCategory('ring')} style={ category && category === "ring" ? selectorButton : selectorButtonActive } >
          <Avatar style={selectorButtonIcon}  src={'/arms.png'}  />
          <br />
          Ring
        </div> */}
        <div onClick={() => setCategory('waist')} style={ category && category === "waist" ? selectorButton : selectorButtonActive } >
          <Avatar style={selectorButtonIcon}  src={'/pants.png'} />
          <br />
          Waist
        </div>
        {/* <div onClick={() => setCategory('weapon')} style={ category && category === "weapon" ? selectorButton : selectorButtonActive } >
          <Avatar style={selectorButtonIcon}  src={'/arms.png'} />
          <br />
          Weapon
        </div> */}
        <div onClick={() => setCategory('legs')} style={ category && category === "legs" ? selectorButton : selectorButtonActive } >
          <Avatar style={selectorButtonIcon}  src={'/legs.png'} />
          <br />
          Legs
        </div>
        <div onClick={() => setCategory('foot')} style={ category && category === "foot" ? selectorButton : selectorButtonActive } >
          <Avatar style={selectorButtonIcon}  src={'/shoes.png'} />
          <br />
          Foot
        </div>
      </Stack>
    </div>
  );
}