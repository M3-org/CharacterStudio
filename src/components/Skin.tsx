import { display } from "html2canvas/dist/types/css/property-descriptors/display"
import React from "react"
import { sceneService } from "../services"
import { RgbColorPicker  } from "react-colorful";
import { useEffect, useState, useRef } from "react"

function Skin({ scene, templateInfo }) {
  const [color, setColor] = useState("#aabbcc");
  const [checked, setChecked] = useState();
  const [colorPicker, setColorPick] = useState(false);
  const container = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0.5rem 0"
  }

  const btn = {
      width : "56.53px",
      height : "56.54px",
      display: "flex",
      justifyContent:"center",
      alignItems:"center",
    // borderRadius: "50%",
    // marginRight: "1rem",
    cursor: "pointer",
    // border: "1px solid rgb(90, 93, 121)",
  }
  const handleChangeSkin = (value: string) => {
    setChecked(value)
    const rgbColor = hexToRgbA(value)
    for (const bodyTarget of templateInfo.bodyTargets) {
      sceneService.setMaterialColor(scene, rgbColor, bodyTarget)
    }
  }

  const handleColorPick = (color :any) => {
    const col = "rgb(" + color.r + ', ' + color.g + ', ' + color.b + ")";
    handleChangeSkin(col)
  }

  const colorArray = [
    ["#8F7B72", "#7F6B5D", "#6A5144", "#5C4031", "#4C342D", "#3C2516", "#2B180A", "#0F0204"],
    ["#B08F7D", "#9E7E65", "#907045", "#765E37", "#704F20", "#653F1B", "#4F2F11", "#3F2202"],
    ["#D18D55", "#C47E44", "#AC703F", "#9D6434", "#89582D", "#7D4A25", "#6A3C1E", "#563019"]
  ];
  
  const hexToRgbA = (hex) =>{
      var c;
      if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
          c= hex.substring(1).split('');
          if(c.length== 3){
              c= [c[0], c[0], c[1], c[1], c[2], c[2]];
          }
          c= '0x'+c.join('');
          return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
      }
      throw new Error('Bad Hex');
  }

  return (
    <div 
      style={{ 
        ...container,
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gridGap: '0px',
        margin: 'auto',
        marginTop: '40px',
      }}
    >
    {colorArray.map((row) => {
      return row.map((col) => 
        (
          <div 
            style={{
              ...btn,
              backgroundColor: col,
            }}  onClick={() => handleChangeSkin(col)}>
           {(checked == col) && <img src={'Vector.png'} />}
          </div>
        )
      )
    })}
      {/*<button
        style={{
          ...btn,
          backgroundColor: "rgb(255, 207, 161)",
        }}
        onClick={() => handleChangeSkin("rgb(255, 207, 161)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(255, 199, 153)",
        }}
        onClick={() => handleChangeSkin("rgb(255, 199, 153)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(255, 191, 145)",
        }}
        onClick={() => handleChangeSkin("rgb(255, 191, 145)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(255, 183, 137)",
        }}
        onClick={() => handleChangeSkin("rgb(255, 183, 137)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(247, 175, 129)",
        }}
        onClick={() => handleChangeSkin("rgb(247, 175, 129)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(231, 159, 113)",
        }}
        onClick={() => handleChangeSkin("rgb(231, 159, 113)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(187, 129, 91)",
        }}
        onClick={() => handleChangeSkin("rgb(187, 129, 91)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(165, 114, 81)",
        }}
        onClick={() => handleChangeSkin("rgb(165, 114, 81)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(144, 99, 70)",
        }}
        onClick={() => handleChangeSkin("rgb(144, 99, 70)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(122, 84, 59)",
        }}
        onClick={() => handleChangeSkin("rgb(122, 84, 59)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(100, 69, 49)",
        }}
        onClick={() => handleChangeSkin("rgb(100, 69, 49)")}
      ></button>
      <button
        style={{
          ...btn,
          backgroundColor: "rgb(255, 0, 0)",
        }}
        onClick={() => setColorPick(!colorPicker)}
      >
      </button>*/}
      <>
      {!!colorPicker && <RgbColorPicker style = {{position:'absolute', zIndex : "99999"}} color={color} onChange={setColor} onClick={handleColorPick(color) } />}
      </>
    </div>
  )
}

export default Skin
