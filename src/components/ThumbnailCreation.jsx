import React, { useContext, useState, useEffect } from "react"
import styles from "./FloatingMenu.module.css"
import MenuTitle from "./MenuTitle"
import { SceneContext } from "../context/SceneContext";
import Slider from "./Slider";
import Dropdown from 'react-dropdown';
//import 'react-dropdown/style.css';

const maxResolution = 4096;

export default function ThumbnailCreation({selectedTrait, traitGroupName}){
    const { manifest, thumbnailsGenerator, sceneElements, characterManager } = React.useContext(SceneContext)

    const [ options, setOptions ] = useState([]) 
    const [ description, setDescription ] = useState("");
    const [ selection, setSelection ] = useState("");
    const [ manifestLocation, setManifestLocation ] = useState("");
    const [ viewingManifests,setViewingManifests ] = useState(false);

    const [width, setWidth] = useState(512);
    const [height, setHeight] = useState(512);
    const [botFrame, setBotFrame] = useState(0.1);
    const [topFrame, setTopFrame] = useState(0.1);

    const [zCam, setZCam] = useState("center");
    const [xCam, setXCam] = useState("center");
    const [yCam, setYCam] = useState("center");

    const [topBone, setTopBone] = useState("head");
    const [bottomBone, setBottomBone] = useState("chest");
    const [topVertexMax, setTopVertexMax] = useState(true);
    const [bottomVertexMax, setBottomVertexMax] = useState(false);


    const xCamOpts = [{label:"center"}, {label:"left"}, {label:"right"}];
    const yCamOpts = [{label:"center"}, {label:"top"}, {label:"bottom"}];
    const zCamOpts = [{label:"center"}, {label:"front"}, {label:"back"}];



    const bones = [{label:"head"}, {label:"neck"}, {label:"chest"}, {label:"spine"}, {label:"hips"}, 
                    {label:"upperLeg"}, {label:"lowerLeg"}, {label:"foot"}];

    const onSelect = (sel) =>{
        if (manifest?.thumbnails != null){
            setDescription(manifest.thumbnails[sel.value].description)
            setManifestLocation(manifest.thumbnails[sel.value].manifest);
            setSelection(manifest.thumbnails[sel.value].name);
        }
    }
    const validateValue = (value, min, max, fallback) => {
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

    const blurWidth = (event)=>{
        const val = parseInt(event.target.value);
        setWidth (validateValue(val,1,maxResolution,512))
    }
    const blurHeight = (event)=>{
        const val = parseInt(event.target.value);
        setHeight(validateValue(val,1,maxResolution,512));
    }
    const blurBotFrame = (event) =>{
        const val = parseFloat(event.target.value);
        setBotFrame(validateValue(val,0,1,0.1))
    }
    const blurTopFrame = (event) =>{
        const val = parseFloat(event.target.value);
        setTopFrame(validateValue(val,0,1,0.1))
    }


    
    const switchAction = (manifestActive) =>{
        setViewingManifests(manifestActive);
    }

    const createThumbnails = async () =>{
        const parentScene = sceneElements.parent;
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
                    saveOnlyIDs:exportAll ? null : selectedTrait.id
                }
            ]
        }
    }

    const createCustomThumbnails = async (createAll = false) => {
        characterManager.storeCurrentAvatar();
        //await characterManager.soloTargetGroupTrait(traitGroupName);
        const parentScene = sceneElements.parent;
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
                label:c.name, 
                description: c.description,
                manifest: c.manifest,
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
                        <Dropdown 
                            className={styles.dropdownControl}
                            options={options} 
                            value={selection} 
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
                            onChange={(e)=>{setWidth(e.target.value)}}
                            onBlur={blurWidth}
                        />
                        <br />
                        Height <input value={height} className={styles["input-box"]}  step ={1}
                            onChange={(e)=>{setHeight(e.target.value)}}
                            onBlur={blurHeight}
                        />
                        <br />
                        Top Spacing <input value={botFrame} className={styles["input-box"]}  step ={0.1}
                            onChange={(e)=>{setBotFrame(e.target.value)}}
                            onBlur={blurBotFrame}
                        />
                        <br />
                        Bottom Spacing <input value={topFrame} className={styles["input-box"]}  step ={0.1}
                            onChange={(e)=>{setTopFrame(e.target.value)}}
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
                            <Dropdown 
                                className={styles.dropdownControlSmall}
                                options={xCamOpts} 
                                onChange={(e)=>{
                                    setXCam(e.label)
                                }} 
                                value={xCam} 

                            />
                        </div>
                        <div className={styles["dropdownFlex"]}>
                            <div className={styles["traitInfoTitle"]} style={{ margin: '0px' }}>
                                Y
                            </div>
                            <Dropdown 
                                className={styles.dropdownControlSmall}
                                options={yCamOpts} 
                                onChange={(e)=>{
                                    setYCam(e.label)
                                }} 
                                value={yCam} 

                            />
                        </div>
                        <div className={styles["dropdownFlex"]}>
                            <div className={styles["traitInfoTitle"]} style={{ margin: '0px' }}>
                                Z
                            </div>
                            <Dropdown 
                                className={styles.dropdownControlSmall}
                                options={zCamOpts} 
                                onChange={(e)=>{
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
                            <Dropdown 
                                className={styles.dropdownControlSmall}
                                options={bones} 
                                onChange={(e)=>{
                                    setTopBone(e.label)
                                }} 
                                value={topBone} 

                            />
                        </div>
                        <div className={styles["dropdownFlex"]} style={{justifyContent:'space-between'}}>
                            <div className={styles["traitInfoTitle"]} style={{ margin: '0px' }}>
                                Bottom
                            </div>
                            <Dropdown 
                                className={styles.dropdownControlSmall}
                                options={bones} 
                                onChange={(e)=>{
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