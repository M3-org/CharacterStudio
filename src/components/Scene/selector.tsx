import { Slider, Stack } from '@mui/material';
import React, { useState } from 'react';
import { threeService } from '../../services';
import { useGlobalState } from '../GlobalProvider';
import Divider from "@mui/material/Divider";
import { Avatar } from "@mui/material";
import hairColor from '../../assets/media/Female_Dom_Hair_10_Red_Long_Isometric.png'
import './style.scss'

export default function Selector() {
    const { category, scene }: any = useGlobalState();
    const [selectValue, setSelectValue] = useState(0)

    const handleChangeSkin = (event: Event, value: number | number[]) => {
       threeService.setMaterialColor(scene,value,'Bra001_2');
    }

    return (
        <div className='selector-container'>
            <Stack
                direction='row'
                spacing={2}
                justifyContent='center'
                alignItems='center'
                divider={<Divider orientation="vertical" flexItem />}
            >
                {category === 'color' &&
                    <Slider
                        defaultValue={255}
                        valueLabelDisplay='off'
                        step={1}
                        max={255}
                        min={0}
                        onChange={handleChangeSkin}
                        sx={{width: '30%'}}
                    />
                }
                {
                  category === 'hair' && <React.Fragment>
                      <div className={`selector-button ${selectValue === 0 ? 'active': ''}`} onClick={() => setSelectValue(0)}>
                        <Avatar className="icon" src={hairColor} />
                      </div>
                      <div className={`selector-button ${selectValue === 1 ? 'active': ''}`} onClick={() => setSelectValue(1)}>
                        <Avatar className="icon" src={hairColor} />
                      </div>
                      <div className={`selector-button ${selectValue === 2 ? 'active': ''}`} onClick={() => setSelectValue(2)}>
                        <Avatar className="icon" src={hairColor} />
                      </div>
                      <div className={`selector-button ${selectValue === 3 ? 'active': ''}`} onClick={() => setSelectValue(3)}>
                        <Avatar className="icon" src={hairColor} />
                      </div>
                      <div className={`selector-button ${selectValue === 4 ? 'active': ''}`} onClick={() => setSelectValue(4)}>
                        <Avatar className="icon" src={hairColor} />
                      </div>
                  </React.Fragment>
                }
            </Stack>
        </div>
    );
}
