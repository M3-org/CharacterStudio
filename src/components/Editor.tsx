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
        <div onClick={() => setCategory('body')} style={ category && category === "body" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon}  src={'/face.png'} />
          <br />
          Body
        </div>
        <div onClick={() => setCategory('hair')} style={ category && category === "hair" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon} src={'/hair.png'} />
          <br />
          Hair
        </div>
        <div onClick={() => setCategory('face')} style={ category && category === "face" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon} src={'/face.png'} />
          <br />
          Face
        </div>
        <div onClick={() => setCategory('tops')} style={ category && category === "tops" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon}  src={'/shirt.png'} />
          <br />
          Tops
        </div>
        <div onClick={() => setCategory('arms')} style={ category && category === "arms" ? selectorButton : selectorButtonActive } >
          <Avatar style={selectorButtonIcon}  src={'/arms.png'}  />
          <br />
          Arms
        </div>
        <div onClick={() => setCategory('shoes')} style={ category && category === "shoes" ? selectorButton : selectorButtonActive } >
          <Avatar style={selectorButtonIcon}  src={'/shoes.png'} />
          <br />
          Shoes
        </div>
        <div onClick={() => setCategory('legs')} style={ category && category === "legs" ? selectorButton : selectorButtonActive } >
          <Avatar style={selectorButtonIcon}  src={'/legs.png'} />
          <br />
          Legs
        </div>
      </Stack>
    </div>
  );
}