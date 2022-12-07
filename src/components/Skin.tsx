import React from "react"
import { sceneService } from "../services"
import { RgbColorPicker  } from "react-colorful";
import { useState } from "react"
import skinSelector from '../ui/skinSelector/Vector.png'
import { useColorStatus, useScene, useTemplateInfo } from "../store";
function Skin({ category, avatar}) {
  const [color, setColor] = useState("#aabbcc");
  const [checked, setChecked] = useState();
  const [colorPicker, setColorPick] = useState(false);
  const colorStatus = useColorStatus((state) => state.colorStatus)
  const setColorStatus = useColorStatus((state) => state.setColorStatus)
  const scene = useScene((state) => state.scene)
  const templateInfo = useTemplateInfo((state) => state.templateInfo);
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

  React.useEffect(() => {
    setChecked(colorStatus)
  }, [templateInfo])

  const getHairMaterial = () => {
     let material = [];
     const hairModel = avatar.head.model;
      hairModel.traverse((o)=> {
        if(o.isSkinnedMesh){
          material = [...material, o.name]
        }
      })
      return material;
  }

  const handleChangeSkin = (value: string) => {
    setChecked(value)
    const rgbColor = hexToRgbA(value)
    let colorTargets;
    if(category === "head"){
      colorTargets = getHairMaterial();
    }
    if(category === "eyeColor"){
      colorTargets = templateInfo.EyeTargets;
    }
    if(category === "color"){
      colorTargets = templateInfo.bodyTargets;
    }
    for (const bodyTarget of colorTargets) {
      sceneService.setMaterialColor(scene, value, bodyTarget)
      setColorStatus(value)
      sceneService.setSkinColor(value)
    }
  }

  const handleColorPick = (color :any) => {
    const col = "rgb(" + color.r + ', ' + color.g + ', ' + color.b + ")";
    handleChangeSkin(col)
  }
  const colorArray = {
    color : [
      ["#8F7B72", "#7F6B5D", "#6A5144", "#5C4031", "#4C342D", "#3C2516", "#2B180A", "#0F0204"],
      ["#B08F7D", "#9E7E65", "#907045", "#765E37", "#704F20", "#653F1B", "#4F2F11", "#3F2202"],
      ["#D18D55", "#C47E44", "#AC703F", "#9D6434", "#89582D", "#7D4A25", "#6A3C1E", "#563019"]
    ],
    eyeColor : [
      ["#8F7B72", "#817071", "#7F6B52", "#6F5B42", "#5F4B32", "#4F3B22", "#3F2B12", "#f00000"],
      ["#B08F7D", "#9E7E65", "#907045", "#765E37", "#704F20", "#653F1B", "#4F2F11", "#3F2202"],
      ["#D18D55", "#C47E44", "#AC703F", "#9D6434", "#89582D", "#7D4A25", "#6A3C1E", "#563019"]
    ],
    head : [
      ["#ff0000", "#00ff00", "#0000ff", "#090807", "#f7e6b5", "#c37c3c", "#e4a1c1", "#8F7B72"],
      ["#B08F7D", "#9E7E65", "#907045", "#765E37", "#704F20", "#653F1B", "#4F2F11", "#3F2202"],
      ["#D18D55", "#C47E44", "#AC703F", "#9D6434", "#89582D", "#7D4A25", "#6A3C1E", "#563019"]
    ]
};
  
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
    {colorArray[category].map((row, i) => {
      return row.map((col, k) => 
        (
          <div 
            style={{
              ...btn,
              backgroundColor: col,
            }}  onClick={() => handleChangeSkin(col)} key={i * row.length + k}>
           {(checked == col) && <img src={skinSelector}/>}
          </div>
        )
      )
    })}
      <>
      {!!colorPicker && <RgbColorPicker style = {{position:'absolute', zIndex : "99999"}} color={color} onChange={setColor} onClick={handleColorPick(color) } />}
      </>
    </div>
  )
}

export default Skin
