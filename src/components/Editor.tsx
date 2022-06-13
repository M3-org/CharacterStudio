import { Avatar } from "@mui/material";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import * as React from "react";
// import armsIcon from '../assets/thumbnails/arms.png';
// import colorIcon from '../assets/thumbnails/color.png';
// import faceIcon from '../assets/thumbnails/face.png';
// import hairIcon from '../assets/thumbnails/hair.png';
// import legsIcon from '../assets/thumbnails/legs.png';
// import shirtIcon from '../assets/thumbnails/shirt.png';
// import shoesIcon from '../assets/thumbnails/shoes.png';

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
          <Avatar style={selectorButtonIcon} /* src={colorIcon} */ />
          <br />
          Skin Tone
        </div>
        <div onClick={() => setCategory('body')} style={ category && category === "body" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon} /* src={faceIcon} */ />
          <br />
          Body
        </div>
        <div onClick={() => setCategory('hair')} style={ category && category === "hair" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon} /* src={hairIcon} */ />
          <br />
          Hair
        </div>
        <div onClick={() => setCategory('face')} style={ category && category === "face" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon} /* src={faceIcon} */ />
          <br />
          Face
        </div>
        <div onClick={() => setCategory('tops')} style={ category && category === "tops" ? selectorButton : selectorButtonActive }>
          <Avatar style={selectorButtonIcon} /* src={shirtIcon} */ />
          <br />
          Tops
        </div>
        <div onClick={() => setCategory('arms')} style={ category && category === "arms" ? selectorButton : selectorButtonActive } >
          <Avatar style={selectorButtonIcon} /* src={armsIcon} */ />
          <br />
          Arms
        </div>
        <div onClick={() => setCategory('shoes')} style={ category && category === "shoes" ? selectorButton : selectorButtonActive } >
          <Avatar style={selectorButtonIcon} /* src={shoesIcon} */ />
          <br />
          Shoes
        </div>
        <div onClick={() => setCategory('legs')} style={ category && category === "legs" ? selectorButton : selectorButtonActive } >
          <Avatar style={selectorButtonIcon} /* src={legsIcon} */ />
          <br />
          Legs
        </div>
      </Stack>
    </div>
  );
}
