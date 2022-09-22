import { textAlign } from "@mui/system";

export default function Landing({
    onSetModel
    }){
    return <div style = {{
        background : `url("/background.png") no-repeat center center fixed`,
        height : "100vh",
        backgroundSize : 'cover',
        display : 'flex',
        justifyContent : "center",
        alignItems : 'center'
    }
    }>
        <div style={{
            backgroundColor : 'black',
            width : '916px',
            height : '895px',
            display : 'flex',
            alignItems : "center",
            flexDirection : "column"
        }}>
            <img 
                src={"/logo.png"} 
                style = {{
                    width : '345px',
                    height : '100px',
                    marginTop : "56px"
                }}
            />
            <div style={{
                color : "white",
                fontFamily : 'Inter',
                fontStyle : "normal",
                fontWeight : "400",
                fontSize : "32px",
                lineHeight : "39px",
                textAlign : "center",
                marginTop : "49px"
            }} >
                <div>CREAT YOUR METAVERSE AVATAR</div>
                <div style={{
                    marginTop : "59px",
                    lineHeight : "38.73px"
                }}>PICK A CLASS <br/>   You'll be able to customzie in a moment </div>
            </div>
            <div style={{
                gridTemplateColumns : "repeat(3, 1fr)",
                columnGap : "61px",
                display : "grid",
                rowGap : "20px",
                marginTop : "20px",
                fontFamily : 'Inter'
            }}>
                <div style={{
                    display : "flex",
                    flexDirection : "column",
                    alignItems : "center",
                    gap : "20px"
                }}>
                    <img
                        src={"/hunter.png"} 
                        onClick = {() => onSetModel(1)}
                    ></img>
                    <span 
                        style={{
                            color : "white"
                        }}>Drop Hunter</span>
                </div>
                <div style={{
                    display : "flex",
                    flexDirection : "column",
                    alignItems : "center",
                    gap : "20px"
                }}>
                    <img
                        src={"/neuro.png"} 
                        onClick = {() => onSetModel(2)}
                    ></img>
                    <span 
                        style={{
                            color : "white"
                        }}>Neurohacker</span>
                </div>
                <div style={{
                    display : "flex",
                    flexDirection : "column",
                    alignItems : "center",
                    gap : "20px"
                }}>
                    <img
                        onClick = {() => onSetModel(3)}
                        src={"/nachi.png"} 
                    ></img>
                    <span 
                        style={{
                            color : "white"
                        }}>Nachi</span>
                </div>
 
                <div style={{
                    display : "flex",
                    flexDirection : "column",
                    alignItems : "center",
                    gap : "20px"
                }}>
                    <img
                        onClick = {() => onSetModel(4)}
                        src={"/hotwolf.png"} 
                    ></img>
                    <span 
                        style={{
                            color : "white"
                        }}>Hotwolf</span>
                </div>
                <div style={{
                    display : "flex",
                    flexDirection : "column",
                    alignItems : "center",
                    gap : "20px"
                }}>
                    <img
                        onClick = {() => onSetModel(5)}
                        src={"/anata.png"} 
                    ></img>
                    <span 
                        style={{
                            color : "white"
                        }}>Anata(holders only)</span>
                </div>
                <div style={{
                    display : "flex",
                    flexDirection : "column",
                    alignItems : "center",
                    gap : "20px"
                }}>
                    <img
                        onClick = {() => onSetModel(6)}
                        src={"/clonex.png"} 
                    ></img>
                    <span 
                        style={{
                            color : "white"
                        }}>Clonex(holders only)</span>
                </div>
            </div>
        </div>
    </div>
}