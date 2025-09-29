import { ModelTrait, ThumbnailJson } from "@/library/CharacterManifestData";
import React, { useEffect, useState } from "react";
import Select from 'react-select';
import { SceneContext } from "../context/SceneContext";
import styles from "./FloatingMenu.module.css";
import MenuTitle from "./MenuTitle";

const maxResolution = 4096;

export default function ThumbnailCreation({selectedTrait, traitGroupName}:{
    selectedTrait:ModelTrait|null,
    traitGroupName?:string|null
}){
    const { manifest, thumbnailsGenerator, sceneElements, characterManager } = React.useContext(SceneContext)

    const [ options, setOptions ] = useState<(ThumbnailJson&{value:number})[]>([]) 
    const [ description, setDescription ] = useState<string>("");
    const [ selection, setSelection ] = useState<string>("");
    const [ manifestLocation, setManifestLocation ] = useState<string>("");
    const [ viewingManifests,setViewingManifests ] = useState<boolean>(false);

    const [width, setWidth] = useState<number>(512);
    const [height, setHeight] = useState<number>(512);
    const [botFrame, setBotFrame] = useState<number>(0.1);
    const [topFrame, setTopFrame] = useState<number>(0.1);

    const [zCam, setZCam] = useState<string>("center");
    const [xCam, setXCam] = useState<string>("center");
    const [yCam, setYCam] = useState<string>("center");

    const [topBone, setTopBone] = useState<string>("head");
    const [bottomBone, setBottomBone] = useState<string>("chest");
    const [topVertexMax, setTopVertexMax] = useState<boolean>(true);
    const [bottomVertexMax, setBottomVertexMax] = useState<boolean>(false);


    const xCamOpts = [{label:"center"}, {label:"left"}, {label:"right"}];
    const yCamOpts = [{label:"center"}, {label:"top"}, {label:"bottom"}];
    const zCamOpts = [{label:"center"}, {label:"front"}, {label:"back"}];



    const bones = [{label:"head"}, {label:"neck"}, {label:"chest"}, {label:"spine"}, {label:"hips"}, 
                    {label:"upperLeg"}, {label:"lowerLeg"}, {label:"foot"}];

    const onSelect = (sel:(ThumbnailJson & { value: number }) | null) =>{
        if(!sel) return;
        if (manifest?.thumbnails != null){
            setDescription(manifest.thumbnails[sel.value].description||'')
            setManifestLocation(manifest.thumbnails[sel.value].manifest);
            setSelection(manifest.thumbnails[sel.value].name);
        }
    }
    const validateValue = (value:number, min:number, max:number, fallback:number) => {
        if (isNaN(value)) {
            return fallback;
        } else if (value > max) {
            return max;
        } else if (value < min){
            return min;
        }else{
            return value;
        }
    }

    const blurWidth = (event: React.FocusEvent<HTMLInputElement>)=>{
        const val = parseInt(event.target.value);
        setWidth (validateValue(val,1,maxResolution,512))
    }
    const blurHeight = (event: React.FocusEvent<HTMLInputElement>)=>{
        const val = parseInt(event.target.value);
        setHeight(validateValue(val,1,maxResolution,512));
    }
    const blurBotFrame = (event: React.FocusEvent<HTMLInputElement>) =>{
        const val = parseFloat(event.target.value);
        setBotFrame(validateValue(val,0,1,0.1))
    }
    const blurTopFrame = (event: React.FocusEvent<HTMLInputElement>) =>{
        const val = parseFloat(event.target.value);
        setTopFrame(validateValue(val,0,1,0.1))
    }


    
    const switchAction = (manifestActive:boolean) =>{
        setViewingManifests(manifestActive);
    }

    const createThumbnails = async () =>{
        const parentScene = sceneElements.parent;
        if(!parentScene){
            console.warn("No parent scene found");
            return;
        }
        if(!manifest.thumbnails){
            console.warn("No thumbnail manifest found");
            return;
        }
        parentScene.remove(sceneElements);
        
        await thumbnailsGenerator.createThumbnails(manifest.thumbnails[0]);
        parentScene.add(sceneElements);
    }

    const getOptions = (exportAll = true) =>{
        return {
            topFrameOffset:topFrame,
            bottomFrameOffset:botFrame,
            thumbnailsWidth:width,
            thumbnailsHeight:height,
            backgroundColor:[0,0,0,0],
            thumbnailsCollection:[
                {
                    traitGroup:traitGroupName,
                    cameraPosition:xCam+'-'+yCam+'-'+zCam,
                    topBoneName:(topBone === "upperLeg" || topBone === "lowerLeg" || topBone === "foot") ? 
                        "left" + topBone[0].toUpperCase() + topBone.slice(1) :
                        topBone,
                    topBoneMaxVertex:topVertexMax,
                    // cameraFrame:'cowboyShot',
                    bottomBoneName:(bottomBone === "upperLeg" || bottomBone === "lowerLeg" || topBone === "foot") ? 
                        "left" + bottomBone[0].toUpperCase() + bottomBone.slice(1) :
                        bottomBone,
                    bottomBoneMaxVertex:bottomVertexMax,
                    saveOnlyIDs:exportAll ? null : selectedTrait!.id
                }
            ]
        }
    }

    const createCustomThumbnails = async (createAll = false) => {
        characterManager.storeCurrentAvatar();
        //await characterManager.soloTargetGroupTrait(traitGroupName);
        const parentScene = sceneElements.parent;

        if(!parentScene){
            console.warn("No parent scene found");
            return;
        }

        parentScene.remove(sceneElements);
        
        if (createAll)
            await thumbnailsGenerator.createThumbnailsWithObjectData(getOptions(),false,null,traitGroupName + "_thumbnails");
        else
            await thumbnailsGenerator.createThumbnailsWithObjectData(getOptions(false),false);
        parentScene.add(sceneElements);

       characterManager.loadStoredAvatar();
    }


    useEffect(() => {
    if (manifest?.thumbnails != null){
        const manifestOptions = manifest.thumbnails.map((c,i) => {
            return {
                value:i, 
                ...c,
                label:c.name
            }
          })
          setOptions(manifestOptions);
    }
    }, [manifest])

    return (
        
        <div>
            <div className={styles["InformationContainerPos"]}>
                <MenuTitle title="Thumbnail Creation" width={180} right={20}/>
                <div className={styles["scrollContainer"]}>
                    <div className={styles["tabHolder"]}>
                        <div 
                            className={styles["tabButton"] +(!viewingManifests ? ' ' + styles["tabButtonSelected"]:'')}
                            onClick={()=>{switchAction(false)}}>
                            <div>  {"Custom"} </div>
                        </div>
                        <div 
                            className={styles["tabButton"] +(viewingManifests ? ' ' + styles["tabButtonSelected"]:'')}
                            onClick={()=>{switchAction(true)}}>
                            <div>  {"Manifest"} </div>
                        </div>

                    </div>
                    <br />
                    
                    {viewingManifests ? 
                    // manifest section
                    <>
                        <div className={styles["traitInfoTitle"] + ' ' + styles["centerAlign"]}>
                            Thumbnail Manifests
                        </div>
                        <Select 
                            className={styles.dropdownControl}
                            options={options} 
                            onChange={onSelect} 
                            placeholder="Select an option" 
                        />;
                        
                    
                        <div className={styles["traitInfoText"]}>
                            {description || ""}
                        </div>
                        {
                            manifestLocation != "" && 
                            <div 
                                className={styles["actionButton"]}
                                onClick={createThumbnails}>
                                <div>  Create Thumbnails </div>
                            </div>
                        }
                    </>:
                    // custom section

                    // topFrameOffset = 0.1,
                    // bottomFrameOffset = 0.1,
                    // animationTime,
                    // to do, add bg color
                    // backgroundColor = [1,1,1,0],

                    // traitGroup,
                    // cameraPosition = "front",
                    // bottomBoneName,
                    // bottomBoneMaxVertex = false,
                    // topBoneName,
                    // topBoneMaxVertex = true,
                    // groupTopOffset,
                    // groupBotomOffset,
                    // cameraFrame
                    <>

                    <div className={styles["traitInfoText"]}>
                        <div className={styles["traitInfoTitle"] + ' ' + styles["centerAlign"]}style={{ margin: '10px 0px 10px' }}>
                            Resolution
                        </div>
                        Width <input value={width} className={styles["input-box"]} step ={1}
                            onChange={(e)=>{setWidth(parseFloat(e.target.value))}}
                            onBlur={blurWidth}
                        />
                        <br />
                        Height <input value={height} className={styles["input-box"]}  step ={1}
                            onChange={(e)=>{setHeight(parseFloat(e.target.value))}}
                            onBlur={blurHeight}
                        />
                        <br />
                        Top Spacing <input value={botFrame} className={styles["input-box"]}  step ={0.1}
                            onChange={(e)=>{setBotFrame(parseFloat(e.target.value))}}
                            onBlur={blurBotFrame}
                        />
                        <br />
                        Bottom Spacing <input value={topFrame} className={styles["input-box"]}  step ={0.1}
                            onChange={(e)=>{setTopFrame(parseFloat(e.target.value))}}
                            onBlur={blurTopFrame}
                        />
                        <br />
                        <div className={styles["traitInfoTitle"] + ' ' + styles["centerAlign"]}style={{ margin: '20px' }}>
                            Camera Position
                        </div>
                        </div>
                        <div className={styles["dropdownFlex"]}>
                            <div className={styles["traitInfoTitle"]} style={{ margin: '0px' }}>
                                X
                            </div>
                            <Select 
                                className={styles.dropdownControlSmall}
                                options={xCamOpts} 
                                onChange={(e:any)=>{
                                    setXCam(e.label)
                                }} 
                                value={xCam} 

                            />
                        </div>
                        <div className={styles["dropdownFlex"]}>
                            <div className={styles["traitInfoTitle"]} style={{ margin: '0px' }}>
                                Y
                            </div>
                            <Select 
                                className={styles.dropdownControlSmall}
                                options={yCamOpts} 
                                onChange={(e:any)=>{
                                    setYCam(e.label)
                                }} 
                                value={yCam} 

                            />
                        </div>
                        <div className={styles["dropdownFlex"]}>
                            <div className={styles["traitInfoTitle"]} style={{ margin: '0px' }}>
                                Z
                            </div>
                            <Select 
                                className={styles.dropdownControlSmall}
                                options={zCamOpts} 
                                onChange={(e:any)=>{
                                    setZCam(e.label)
                                }} 
                                value={zCam} 

                            />
                        </div>
                        <div className={styles["traitInfoTitle"] + ' ' + styles["centerAlign"]}style={{ margin: '30px 0px 30px' }}>
                            Target Bones
                        </div>
                        <div className={styles["dropdownFlex"]} style={{justifyContent:'space-between'}}>
                            <div className={styles["traitInfoTitle"]} style={{ margin: '0px' }}>
                                Top
                            </div>
                            <Select 
                                className={styles.dropdownControlSmall}
                                options={bones} 
                                onChange={(e:any)=>{
                                    setTopBone(e.label)
                                }} 
                                value={topBone} 

                            />
                        </div>
                        <div className={styles["dropdownFlex"]} style={{justifyContent:'space-between'}}>
                            <div className={styles["traitInfoTitle"]} style={{ margin: '0px' }}>
                                Bottom
                            </div>
                            <Select 
                                className={styles.dropdownControlSmall}
                                options={bones} 
                                onChange={(e:any)=>{
                                    setBottomBone(e.label)
                                }} 
                                value={bottomBone} 
                            />
                        </div>
                        <div style={{textAlign:'left'}}>
                            <div className={styles["checkboxFlex"]} style={ {marginTop:'20px'}}>
                                <input type="checkbox" 
                                    checked={topVertexMax} 
                                    onChange={(e)=>{
                                        setTopVertexMax(e.target.checked);
                                    }}
                                    
                                />
                                <div className={styles["traitInfoText"]} style={{ margin: '0px', fontSize:'12px'}}>
                                    {`Top bone ${topVertexMax ? "uses Top" : "uses Low"} Vertex`} 
                                </div>
                            </div>
                            <div className={styles["checkboxFlex"]} style={{marginTop:'10px'}}>
                                <input type="checkbox"
                                    checked={bottomVertexMax} 
                                    onChange={(e)=>{
                                        setBottomVertexMax(e.target.checked);
                                    }}
                                />
                                <div className={styles["traitInfoText"]} style={{ margin: '0px',  fontSize:'12px'}}>
                                    {`Bottom bone ${bottomVertexMax ? "uses Top" : "uses Low"} Vertex`} 
                                </div>
                            </div>
                        </div>
                        {traitGroupName == "" ? 
                            <div className={styles["traitInfoText"] + ' ' + styles["centerAlign"]}
                                style={{ marginTop: '40px' }}>
                                Please choose a trait category in the left side menu.
                            </div> : 
                            <>
                            <div className={styles["traitInfoTitle"] + ' ' + styles["centerAlign"]}
                                style={{ marginTop: '20px' }}>
                                Generate
                            </div>
                            <div className={styles["traitInfoText"] + ' ' + styles["centerAlign"]}
                                style={{ margin: '0px auto 20px' }}>
                                {"( " + traitGroupName + " )"}
                            </div>
                            <div className={styles["simpleFlex"]} style={{ marginTop: '0px' }}>
                                <div 
                                        className={styles["actionButton"]} style={{ margin: '0px' }}
                                        onClick={()=>{createCustomThumbnails(false)}}>
                                        <div>  Current </div>
                                </div>
                                <div 
                                        className={styles["actionButton"]} style={{ margin: '0px' }}
                                        onClick={()=>{createCustomThumbnails(true)}}>
                                        <div>  All </div>
                                </div>
                            </div>
                        </>}

                    </>
                    }
                </div>
            </div>
        </div>
      )
}