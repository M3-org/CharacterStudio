import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

import "./style.scss";

import { useGlobalState } from "../AuthContextWrap";

export default function PoseEditor() {
  const { bones, rotationParameters }: any = useGlobalState();
  console.log("ROTATIONS: ", rotationParameters && rotationParameters);
  
  // Round the rotation parameter number to 2 decimals
  const roundNumber = (number:any) => {
    return Math.round(number * 100) / 100;
  }
  return (
    <div>
      <Grid container className="pose-editor-wrap">
        {bones && rotationParameters && 
          bones.map((bone: any, index: any) => {
            return (
              <Grid item xs={12} key={index} className="pose-wrap">
                <Typography variant="h4">{bone.name}</Typography>
                <div className="slider">
                  <Typography variant="h5" className="geo">
                    X:
                  </Typography>
                  <Slider
                    size="small"
                    defaultValue={roundNumber(rotationParameters[bone.bone].x)}
                    min={-3.1}
                    max={3.1}
                    step={0.1}
                    valueLabelDisplay="auto"
                    onChange={(e: any) => {
                          (window as any).changeRotation(bone.bone, e.target.value, "x");
                      }}
                  />
                </div>
                <div className="slider">
                  <Typography variant="h5" className="geo">
                    Y:
                  </Typography>
                  <Slider
                    size="small"
                    defaultValue={roundNumber(rotationParameters[bone.bone].y)}
                    min={-3.1}
                    max={3.1}
                    step={0.1}
                    aria-label="Small"
                    valueLabelDisplay="auto"
                    onChange={(e: any) => {
                        (window as any).changeRotation(bone.bone, e.target.value, "y");
                    }}
                  />
                </div>
                <div className="slider">
                  <Typography variant="h5" className="geo">
                    Z:
                  </Typography>
                  <Slider
                    size="small"
                    defaultValue={roundNumber(rotationParameters[bone.bone].z)}
                    min={-3.1}
                    max={3.1}
                    step={0.1}
                    aria-label="Small"
                    valueLabelDisplay="auto"
                    onChange={(e: any) => {
                        (window as any).changeRotation(bone.bone, e.target.value, "z");
                    }}
                  />
                </div>
              </Grid>
            );
          })}
      </Grid>
    </div>
  );
}
